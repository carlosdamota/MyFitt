import { onRequest } from "firebase-functions/v2/https";
import { FieldValue, type Firestore } from "firebase-admin/firestore";
import type { Auth } from "firebase-admin/auth";
import type { Request, Response } from "express";
import {
  getAllowedOrigins,
  isOriginAllowed,
  setCors,
  sendJson,
  requireAuth,
} from "./http.js";
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
  geminiModel: string;
  geminiModelLite: string;
  proAiMonthlyQuota: number;
  freeAiMonthlyQuota: number;
  freeMaxDays: number;
  webOrigin: string;
}

export const createAiGenerateFunction = ({
  db,
  auth,
  appId,
  geminiApiKey,
  geminiModel,
  geminiModelLite,
  proAiMonthlyQuota,
  freeAiMonthlyQuota,
  freeMaxDays,
  webOrigin,
}: AiFunctionDeps) => {
  const addDays = (date: Date, days: number): Date => {
    const next = new Date(date);
    next.setUTCDate(next.getUTCDate() + days);
    return next;
  };

  const getQuotaForPlan = (plan: PlanType) => {
    if (plan === "pro") return { quota: proAiMonthlyQuota, resetInDays: 30 };
    return { quota: freeAiMonthlyQuota, resetInDays: 30 };
  };

  const ensureEntitlement = async (uid: string, jwtPlan: PlanType) => {
    const entRef = billingCollection(db, appId, uid).doc("entitlement");
    const entSnap = await entRef.get();
    const now = new Date();

    if (!entSnap.exists) {
      const { quota, resetInDays } = getQuotaForPlan(jwtPlan);
      const resetAt = addDays(now, resetInDays).toISOString();
      await entRef.set({
        plan: jwtPlan,
        quota,
        used: 0,
        resetAt,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { plan: jwtPlan, quota, used: 0, resetAt };
    }

    const data = entSnap.data() as {
      plan?: PlanType;
      quota?: number;
      used?: number;
      resetAt?: string;
    };

    const activePlan: PlanType = data.plan || jwtPlan;
    const { quota, resetInDays } = getQuotaForPlan(activePlan);
    let used = data.used ?? 0;
    let resetAt = data.resetAt ?? addDays(now, resetInDays).toISOString();

    if (new Date(resetAt) <= now) {
      used = 0;
      resetAt = addDays(now, resetInDays).toISOString();
    }

    await entRef.set(
      {
        quota,
        used,
        resetAt,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    return { plan: activePlan, quota, used, resetAt };
  };

  const consumeQuota = async (uid: string, plan: PlanType) => {
    const entRef = billingCollection(db, appId, uid).doc("entitlement");
    const ent = await ensureEntitlement(uid, plan);
    if (ent.used >= ent.quota) return { allowed: false, ...ent };
    const used = ent.used + 1;
    await entRef.set({ used, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    return { allowed: true, ...ent, used };
  };

  const releaseQuota = async (uid: string) => {
    const entRef = billingCollection(db, appId, uid).doc("entitlement");
    const entSnap = await entRef.get();
    if (!entSnap.exists) return;
    const data = entSnap.data() as { used?: number };
    const used = Math.max(0, (data.used ?? 1) - 1);
    await entRef.set({ used, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  };

  const callGemini = async (prompt: string, systemInstruction = "", model?: string) => {
    if (!geminiApiKey) throw new Error("gemini_key_missing");
    const targetModel = model || geminiModel;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${geminiApiKey}`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
    };

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
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("gemini_empty");
    return text;
  };

  return onRequest({ timeoutSeconds: 60, invoker: "public" }, async (req: Request, res: Response) => {
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

    try {
      const { uid, plan } = await requireAuth(req, auth);
      currentUid = uid;
      const task = String(req.body?.task ?? "");
      const payload = (req.body?.payload ?? {}) as Record<string, unknown>;

      const quotaState = await consumeQuota(uid, plan);
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
          await releaseQuota(uid);
          sendJson(res, 403, {
            error: "days_restricted",
            message: `Las rutinas de ${requestedDays} días son exclusivas de Pro`,
            maxDays: freeMaxDays,
          });
          return;
        }
      }

      const { system, user } = buildPrompt(task, payload);
      const modelForTask = task === "nutrition_parse" ? geminiModelLite : undefined;
      const text = await callGemini(user, system, modelForTask);

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
        await releaseQuota(currentUid);
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
  });
};
