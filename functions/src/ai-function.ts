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
import { NutritionLogSchema, GeneratedProgramSchema, type GeneratedProgram } from "./schemas.js";
import { billingCollection } from "./data.js";
import { type PlanType, type Quotas, consumeQuota, releaseQuota } from "./utils/quota.js";
import { type GeminiPart, type GeminiTool, callGemini, getImagePart } from "./utils/gemini.js";
import { getPostHogClient } from "./utils/posthog.js";

// Cache normalized exercises to avoid querying Firestore on every routine generation
interface CachedExercise {
  id: string;
  name: string;
  aliases: string[];
  equipment: string[];
  muscleGroup: string;
  targetMuscle?: string;
}
let cachedNormalizedExercises: CachedExercise[] | null = null;
let lastCacheTime = 0;

async function getNormalizedExercises(db: Firestore): Promise<CachedExercise[]> {
  const now = Date.now();
  // Cache for 1 hour
  if (cachedNormalizedExercises && now - lastCacheTime < 1000 * 60 * 60) {
    return cachedNormalizedExercises;
  }
  const snap = await db.collection("normalized_exercises").get();
  cachedNormalizedExercises = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      name: data.name,
      aliases: data.aliases || [],
      equipment: data.equipment || [],
      muscleGroup: data.muscleGroup || "",
      targetMuscle: data.targetMuscle || "",
    };
  });
  lastCacheTime = now;
  return cachedNormalizedExercises;
}

interface AiFunctionDeps {
  db: Firestore;
  auth: Auth;
  appId: string;
  geminiApiKey: string;
  geminiDefaultModel: string;
  geminiFastModel: string;
  geminiProModel: string;
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
  geminiFastModel,
  geminiProModel,
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

        // For routine_program: inject filtered exercise catalog into prompt
        if (task === "routine_program") {
          const catalog = await getNormalizedExercises(db);
          const userEquipment = ((payload.profile as any)?.equipment ?? []) as string[];
          // Filter catalog by user equipment overlap: STICKT filtering (.every)
          // Also allow exercises with no equipment requirements
          const filtered = catalog.filter((ex) => {
            if (!ex.equipment || ex.equipment.length === 0) return true;
            return ex.equipment.every((eq) => userEquipment.includes(eq));
          });
          payload.exerciseCatalog = filtered;
        }

        const { system, user } = buildPrompt(task, payload);

        const isNutritionTask = task === "nutrition_parse";
        const isRoutineTask = task === "routine_program";
        const isVolumeTrendTask = task === "volume_trend";
        const isStravaSummaryTask = task === "strava_summary";

        let modelForTask: string | undefined = undefined;

        if (isNutritionTask) {
          modelForTask = plan === "pro" ? geminiNutritionModelPro : geminiNutritionModelFree;
        } else if (isRoutineTask) {
          modelForTask = plan === "pro" ? geminiProModel : geminiDefaultModel;
        } else if (isVolumeTrendTask || isStravaSummaryTask) {
          modelForTask = geminiFastModel;
        }

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

        const startTime = Date.now();
        const text = await callGemini({
          geminiApiKey,
          geminiDefaultModel,
          parts,
          systemInstruction: system,
          model: modelForTask,
          tools,
        });
        const durationMs = Date.now() - startTime;

        // Track consumption in PostHog
        try {
          const ph = getPostHogClient();
          ph.capture({
            distinctId: uid,
            event: "ai_generation",
            properties: {
              task,
              model: modelForTask || geminiDefaultModel,
              duration_ms: durationMs,
              plan,
            },
          });
        } catch (phError) {
          console.error("Failed to track AI generation in PostHog:", phError);
        }

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

            let programObj: GeneratedProgram | null = null;

            if (validated.success) {
              programObj = validated.data;
            } else {
              const normalized = normalizeProgram(parsed, totalDays);
              const normalizedResult = GeneratedProgramSchema.safeParse(normalized);
              if (normalizedResult.success) {
                programObj = normalizedResult.data;
              } else {
                const fallback = buildFallbackProgram(totalDays);
                const fallbackResult = GeneratedProgramSchema.safeParse(fallback);
                if (!fallbackResult.success) throw new Error("ai_validation_failed");
                programObj = fallbackResult.data;
              }
            }

            // Post-process: Validate against strict catalog and apply fallback
            if (programObj) {
              // Ensure we have the filtered catalog available. It was set in payload earlier.
              const catalog = (payload.exerciseCatalog as CachedExercise[]) || [];
              const validIds = new Set(catalog.map((e) => e.id));

              programObj.days.forEach((day) => {
                day.blocks.forEach((block) => {
                  block.exercises.forEach((ex) => {
                    const aiGeneratedId = (ex as any).exerciseId;
                    
                    // Priority 1: Use aiGeneratedId if valid
                    if (aiGeneratedId && validIds.has(aiGeneratedId)) {
                      ex.normalizedId = aiGeneratedId;
                    } 
                    // Priority 2: Fallback logic - aiGeneratedId is missing or invalid
                    else {
                      const targetMuscleGroup = (ex as any).muscleGroup || "";
                      
                      // Find candidates targeting the same muscle group
                      const muscleCandidates = catalog.filter((c) => c.muscleGroup === targetMuscleGroup);
                      
                      const candidates = muscleCandidates.length > 0 ? muscleCandidates : catalog;
                      
                      if (candidates.length > 0) {
                        // Pick a random replacement
                        const replacement = candidates[Math.floor(Math.random() * candidates.length)];
                        ex.normalizedId = replacement.id;
                        ex.name = replacement.name; // Overwrite the invented name
                        ex.note = ex.note ? `${ex.note} (Sustituido por equipo)` : "Sustituido por adaptación de material";
                      }
                    }
                  });
                });
              });

              validatedData = { text: JSON.stringify(programObj) };
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
