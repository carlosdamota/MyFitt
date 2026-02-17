import { onRequest } from "firebase-functions/v2/https";
import { FieldValue, type Firestore } from "firebase-admin/firestore";
import type { Auth } from "firebase-admin/auth";
import type { Request, Response } from "express";
import { getAllowedOrigins, isOriginAllowed, setCors, sendJson, requireAuth } from "./http.js";
import {
  parseJsonWithFixes,
  normalizeNutritionLog,
  buildFallbackProgram,
  normalizeProgram,
} from "./ai-normalizers.js";
import { buildPrompt } from "./prompts.js";
import { NutritionLogSchema, GeneratedProgramSchema } from "./schemas.js";
import { billingCollection } from "./data.js";

type PlanType = "free" | "pro";

interface AiFunctionDeps {
  db: Firestore;
  auth: Auth;
  appId: string;
  geminiApiKey: string;
  geminiDefaultModel: string;
  geminiNutritionModelFree: string;
  geminiNutritionModelPro: string;
  quotas: {
    routine: { free: number; pro: number };
    nutrition: { free: number; pro: number };
    coach: { free: number; pro: number };
    analysis: { free: number; pro: number };
  };
  freeMaxDays: number;
  webOrigin: string;
}

export const createAiGenerateFunction = ({
  db,
  auth,
  appId,
  geminiApiKey,
  geminiDefaultModel,
  geminiNutritionModelFree,
  geminiNutritionModelPro,
  quotas,
  freeMaxDays,
  webOrigin,
}: AiFunctionDeps) => {
  type GeminiPart =
    | { text: string }
    | { inline_data: { mime_type: string; data: string } }
    | { inlineData: { mimeType: string; data: string } };

  type GeminiTool = {
    google_search?: Record<string, never>;
  };

  const addDays = (date: Date, days: number): Date => {
    const next = new Date(date);
    next.setUTCDate(next.getUTCDate() + days);
    return next;
  };

  type QuotaType = "routine" | "nutrition" | "coach" | "analysis";

  const getQuotaLimit = (plan: PlanType, type: QuotaType) => {
    return { quota: quotas[type][plan], resetInDays: 30 };
  };

  const ensureEntitlement = async (uid: string, jwtPlan: PlanType) => {
    const entRef = billingCollection(db, appId, uid).doc("entitlement");
    const entSnap = await entRef.get();
    const now = new Date();

    if (!entSnap.exists) {
      const resetInDays = 30;
      const resetAt = addDays(now, resetInDays).toISOString();

      const initialData = {
        plan: jwtPlan,
        resetAt,
        updatedAt: FieldValue.serverTimestamp(),
        used_routine: 0,
        used_nutrition: 0,
        used_coach: 0,
        used_analysis: 0,
      };

      await entRef.set(initialData);
      return {
        plan: jwtPlan,
        usage: { routine: 0, nutrition: 0, coach: 0, analysis: 0 },
        resetAt,
      };
    }

    const data = entSnap.data() as {
      plan?: PlanType;
      resetAt?: string;
      used_routine?: number;
      used_nutrition?: number;
      used_coach?: number;
      used_analysis?: number;
      used?: number; // Legacy
    };

    const activePlan: PlanType = data.plan || jwtPlan;
    let resetAt = data.resetAt ?? addDays(now, 30).toISOString();

    let usage = {
      routine: data.used_routine ?? 0,
      nutrition: data.used_nutrition ?? data.used ?? 0, // Migrate legacy
      coach: data.used_coach ?? 0,
      analysis: data.used_analysis ?? 0,
    };

    if (new Date(resetAt) <= now) {
      usage = { routine: 0, nutrition: 0, coach: 0, analysis: 0 };
      resetAt = addDays(now, 30).toISOString();
      await entRef.set(
        {
          resetAt,
          used_routine: 0,
          used_nutrition: 0,
          used_coach: 0,
          used_analysis: 0,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    }

    return { plan: activePlan, usage, resetAt };
  };

  const getQuotaTypeFromTask = (task: string): QuotaType => {
    if (task === "routine_program") return "routine";
    if (task === "nutrition_parse") return "nutrition";
    if (task === "weekly_coach" || task === "chat_coach") return "coach";
    if (task === "nutrition_analysis" || task === "volume_trend" || task === "exercise_analysis")
      return "analysis";
    return "nutrition";
  };

  const consumeQuota = async (uid: string, plan: PlanType, task: string) => {
    const quotaType = getQuotaTypeFromTask(task);
    const entRef = billingCollection(db, appId, uid).doc("entitlement");
    const ent = await ensureEntitlement(uid, plan);

    const limit = getQuotaLimit(ent.plan, quotaType);
    const currentUsage = ent.usage[quotaType];

    if (currentUsage >= limit.quota) {
      return {
        allowed: false,
        plan: ent.plan,
        resetAt: ent.resetAt,
        quota: limit.quota,
        used: currentUsage,
        type: quotaType,
      };
    }

    const newUsage = currentUsage + 1;
    const fieldName = `used_${quotaType}`;

    await entRef.set(
      { [fieldName]: newUsage, updatedAt: FieldValue.serverTimestamp() },
      { merge: true },
    );

    return {
      allowed: true,
      plan: ent.plan,
      resetAt: ent.resetAt,
      quota: limit.quota,
      used: newUsage,
      type: quotaType,
    };
  };

  const releaseQuota = async (uid: string, task: string) => {
    const quotaType = getQuotaTypeFromTask(task);
    const entRef = billingCollection(db, appId, uid).doc("entitlement");
    const entSnap = await entRef.get();

    if (!entSnap.exists) return;

    const fieldName = `used_${quotaType}`;
    const data = entSnap.data() ?? {};
    const current = data[fieldName] as number | undefined;

    if (current !== undefined && current > 0) {
      await entRef.set(
        { [fieldName]: current - 1, updatedAt: FieldValue.serverTimestamp() },
        { merge: true },
      );
    }
  };

  const getImagePart = (rawImage: unknown, rawMimeType?: unknown): GeminiPart | null => {
    let data = "";
    let mimeType = typeof rawMimeType === "string" && rawMimeType ? rawMimeType : "image/jpeg";

    if (typeof rawImage === "string") {
      const dataUriMatch = rawImage.match(/^data:(image\/[\w.+-]+);base64,(.+)$/i);
      if (dataUriMatch) {
        mimeType = dataUriMatch[1];
        data = dataUriMatch[2];
      } else {
        data = rawImage;
      }
    } else if (rawImage && typeof rawImage === "object") {
      const imageObject = rawImage as { data?: unknown; base64?: unknown; mimeType?: unknown };
      const candidateData =
        typeof imageObject.data === "string"
          ? imageObject.data
          : typeof imageObject.base64 === "string"
            ? imageObject.base64
            : "";

      if (typeof imageObject.mimeType === "string" && imageObject.mimeType) {
        mimeType = imageObject.mimeType;
      }

      const dataUriMatch = candidateData.match(/^data:(image\/[\w.+-]+);base64,(.+)$/i);
      if (dataUriMatch) {
        mimeType = dataUriMatch[1];
        data = dataUriMatch[2];
      } else {
        data = candidateData;
      }
    }

    if (!data) return null;
    return {
      inline_data: {
        mime_type: mimeType,
        data,
      },
    };
  };

  const callGemini = async ({
    parts,
    systemInstruction = "",
    model,
    tools,
  }: {
    parts: GeminiPart[];
    systemInstruction?: string;
    model?: string;
    tools?: GeminiTool[];
  }) => {
    if (!geminiApiKey) throw new Error("gemini_key_missing");
    const targetModel = model || geminiDefaultModel;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${geminiApiKey}`;
    const payload: {
      contents: Array<{ parts: GeminiPart[] }>;
      systemInstruction: { parts: Array<{ text: string }> };
      tools?: GeminiTool[];
    } = {
      contents: [{ parts }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
    };

    if (tools && tools.length > 0) payload.tools = tools;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const msg = await response.text();
      throw new Error(`gemini_error:${response.status}:${msg}`);
    }
    const result = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text =
      result.candidates?.[0]?.content?.parts
        ?.map((part) => part.text)
        .filter((part): part is string => typeof part === "string")
        .join("\n") ?? "";
    if (!text) throw new Error("gemini_empty");
    return text;
  };

  return onRequest(
    { timeoutSeconds: 60, invoker: "public" },
    async (req: Request, res: Response) => {
      const allowedOrigins = getAllowedOrigins(webOrigin);
      setCors(req.headers.origin, res, allowedOrigins);
      if (!isOriginAllowed(req.headers.origin, allowedOrigins)) {
        sendJson(res, 403, { error: "origin_not_allowed" });
        return;
      }
      if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
      }

      let currentUid: string | undefined;
      let currentTask: string = "";

      try {
        const { uid, plan } = await requireAuth(req, auth);
        currentUid = uid;
        const task = String(req.body?.task ?? "");
        currentTask = task;
        const payload = (req.body?.payload ?? {}) as Record<string, unknown>;
        const rawImage = req.body?.image;
        const rawImageMimeType = req.body?.imageMimeType;

        const quotaState = await consumeQuota(uid, plan, task);
        if (!quotaState.allowed) {
          sendJson(res, 429, {
            error: "quota_exceeded",
            remaining: 0,
            resetAt: quotaState.resetAt,
            plan: quotaState.plan,
          });
          return;
        }

        if (task === "routine_program" && plan === "free") {
          const requestedDays = Number(payload.totalDays ?? payload.availableDays ?? 3);
          if (requestedDays > freeMaxDays) {
            await releaseQuota(uid, task);
            sendJson(res, 403, {
              error: "days_restricted",
              message: `Las rutinas de ${requestedDays} días son exclusivas de Pro`,
              maxDays: freeMaxDays,
            });
            return;
          }
        }

        const { system, user } = buildPrompt(task, payload);

        const isNutritionTask = task === "nutrition_parse";
        const nutritionModel = plan === "pro" ? geminiNutritionModelPro : geminiNutritionModelFree;
        const modelForTask = isNutritionTask ? nutritionModel : undefined;

        const parts: GeminiPart[] = [{ text: user }];
        if (isNutritionTask && plan === "pro") {
          const imagePart = getImagePart(rawImage, rawImageMimeType);
          if (imagePart) {
            parts.push(imagePart);
            if (!user.trim()) {
              parts[0] = { text: "Analiza la comida de la imagen y devuelve el JSON solicitado." };
            }
          }
        }

        const tools: GeminiTool[] | undefined = isNutritionTask
          ? [{ google_search: {} }]
          : undefined;

        const text = await callGemini({
          parts,
          systemInstruction: system,
          model: modelForTask,
          tools,
        });

        let validatedData: { text: string } = { text };
        try {
          let parsed: any;
          try {
            parsed = parseJsonWithFixes(text);
          } catch {
            parsed = null;
          }

          if (task === "nutrition_parse") {
            const normalized = normalizeNutritionLog(parsed ?? {});
            const nutritionResult = NutritionLogSchema.safeParse(normalized ?? {});
            if (!nutritionResult.success) throw new Error("ai_validation_failed");
            validatedData = { text: JSON.stringify(nutritionResult.data) };
          } else if (task === "routine_program") {
            const totalDays = Number(payload.totalDays ?? 3);
            const validated = GeneratedProgramSchema.safeParse(parsed ?? {});
            if (validated.success) {
              validatedData = { text: JSON.stringify(validated.data) };
            } else {
              const normalized = normalizeProgram(parsed, totalDays);
              const normalizedResult = GeneratedProgramSchema.safeParse(normalized);
              if (normalizedResult.success) {
                validatedData = { text: JSON.stringify(normalizedResult.data) };
              } else {
                const fallback = buildFallbackProgram(totalDays);
                const fallbackResult = GeneratedProgramSchema.safeParse(fallback);
                if (!fallbackResult.success) throw new Error("ai_validation_failed");
                validatedData = { text: JSON.stringify(fallbackResult.data) };
              }
            }
          }
        } catch {
          throw new Error("ai_validation_failed");
        }

        sendJson(res, 200, {
          text: validatedData.text,
          remaining: Math.max(0, quotaState.quota - quotaState.used),
          resetAt: quotaState.resetAt,
          plan: quotaState.plan,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "unknown_error";
        if (currentUid && (message === "ai_validation_failed" || message.startsWith("gemini_"))) {
          await releaseQuota(currentUid, currentTask);
        }

        if (message === "missing_auth") {
          sendJson(res, 401, { error: "unauthorized" });
          return;
        }
        if (message === "quota_exceeded") {
          sendJson(res, 429, { error: "quota_exceeded" });
          return;
        }
        sendJson(res, 500, { error: "ai_failed", message });
      }
    },
  );
};
