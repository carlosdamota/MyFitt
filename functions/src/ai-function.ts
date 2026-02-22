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
import { type PlanType, type Quotas, consumeQuota, releaseQuota } from "./utils/quota.js";
import { type GeminiPart, type GeminiTool, callGemini, getImagePart } from "./utils/gemini.js";

interface AiFunctionDeps {
  db: Firestore;
  auth: Auth;
  appId: string;
  geminiApiKey: string;
  geminiDefaultModel: string;
  geminiNutritionModelFree: string;
  geminiNutritionModelPro: string;
  quotas: Quotas;
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

        const quotaState = await consumeQuota(db, appId, uid, plan, task, quotas);
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
            await releaseQuota(db, appId, uid, task);
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
          geminiApiKey,
          geminiDefaultModel,
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
          await releaseQuota(db, appId, currentUid, currentTask);
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
