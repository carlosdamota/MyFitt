import { onRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import Stripe from "stripe";
import type { Request, Response } from "express";

initializeApp();

const db = getFirestore();
const auth = getAuth();

const APP_ID = process.env.FITMANUAL_APP_ID ?? "fitmanual-default";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3-flash-preview";
const PRO_AI_MONTHLY_QUOTA = Number(process.env.PRO_AI_MONTHLY_QUOTA ?? "40");
const FREE_AI_WEEKLY_QUOTA = Number(process.env.FREE_AI_WEEKLY_QUOTA ?? "1");
const WEB_ORIGIN = process.env.WEB_ORIGIN ?? "";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? "";
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
const stripePricePro = process.env.STRIPE_PRICE_PRO_MONTHLY ?? "";
const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" });

type PlanType = "free" | "pro";

const normalizeOrigin = (value: string) => value.trim().replace(/\/$/, "");

const getAllowedOrigins = () => WEB_ORIGIN.split(",").map(normalizeOrigin).filter(Boolean);

const isOriginAllowed = (origin: string | undefined, allowedOrigins: string[]) => {
  if (!origin) return true;
  if (allowedOrigins.length === 0) return true;
  const requestOrigin = normalizeOrigin(origin);
  return allowedOrigins.includes(requestOrigin);
};

const sanitizeReturnUrl = (value: unknown, allowedOrigins: string[]) => {
  if (!value) return "";
  try {
    const url = new URL(String(value));
    const origin = normalizeOrigin(url.origin);
    if (allowedOrigins.length > 0 && !allowedOrigins.includes(origin)) return "";
    return url.toString();
  } catch {
    return "";
  }
};

const setCors = (
  origin: string | undefined,
  res: { setHeader: (k: string, v: string) => void },
) => {
  const requestOrigin = origin ? normalizeOrigin(origin) : "";
  const allowedOrigins = getAllowedOrigins();

  if (allowedOrigins.length > 0) {
    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      res.setHeader("Access-Control-Allow-Origin", requestOrigin);
      res.setHeader("Vary", "Origin");
    }
  } else if (requestOrigin) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
};

const sendJson = (res: any, status: number, payload: Record<string, unknown>) => {
  res.status(status).json(payload);
};

const requireAuth = async (req: any): Promise<{ uid: string; plan: PlanType }> => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    throw new Error("missing_auth");
  }
  const token = header.replace("Bearer ", "").trim();
  const decoded = await auth.verifyIdToken(token);
  const plan = (decoded.plan as PlanType) || "free";
  return { uid: decoded.uid, plan };
};

const billingCollection = (uid: string) =>
  db.collection("artifacts").doc(APP_ID).collection("users").doc(uid).collection("billing");

const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};

const getQuotaForPlan = (plan: PlanType) => {
  if (plan === "pro") {
    return { quota: PRO_AI_MONTHLY_QUOTA, resetInDays: 30 };
  }
  return { quota: FREE_AI_WEEKLY_QUOTA, resetInDays: 7 };
};

const ensureEntitlement = async (uid: string, jwtPlan: PlanType) => {
  const entRef = billingCollection(uid).doc("entitlement");
  const entSnap = await entRef.get();
  const now = new Date();

  if (!entSnap.exists) {
    // No entitlement exists, create one with the JWT plan
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

  // Entitlement exists - respect the database plan (can be set manually or by Stripe webhook)
  const data = entSnap.data() as {
    plan?: PlanType;
    quota?: number;
    used?: number;
    resetAt?: string;
  };

  // Use the database plan if it exists, otherwise fall back to JWT plan
  const activePlan: PlanType = data.plan || jwtPlan;
  const { quota, resetInDays } = getQuotaForPlan(activePlan);

  let used = data.used ?? 0;
  let resetAt = data.resetAt ?? addDays(now, resetInDays).toISOString();

  if (new Date(resetAt) <= now) {
    used = 0;
    resetAt = addDays(now, resetInDays).toISOString();
  }

  // Only update quota and reset info, NOT the plan (to respect manual DB changes)
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
  const entRef = billingCollection(uid).doc("entitlement");
  const ent = await ensureEntitlement(uid, plan);
  if (ent.used >= ent.quota) {
    return { allowed: false, ...ent };
  }
  const used = ent.used + 1;
  await entRef.set(
    {
      used,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  return { allowed: true, ...ent, used };
};

const callGemini = async (prompt: string, systemInstruction = "") => {
  if (!GEMINI_API_KEY) {
    throw new Error("gemini_key_missing");
  }
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
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

const extractJsonText = (text: string): string => {
  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) return fencedMatch[1].trim();
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1).trim();
  }
  return text.trim();
};

const parseJsonWithFixes = (text: string) => {
  const cleaned = extractJsonText(text)
    .replace(/\uFEFF/g, "")
    .replace(/,\s*([}\]])/g, "$1");
  return JSON.parse(cleaned);
};

const normalizeNutritionLog = (value: any) => {
  if (!value || typeof value !== "object") return null;

  if (Array.isArray(value.meals)) {
    const meals = value.meals as Array<Record<string, any>>;
    const totals = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + Number(meal.calories ?? 0),
        protein: acc.protein + Number(meal.protein ?? 0),
        carbs: acc.carbs + Number(meal.carbs ?? 0),
        fats: acc.fats + Number(meal.fat ?? meal.fats ?? 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 },
    );

    const nameList = meals
      .map((meal) => String(meal.name ?? meal.food ?? "").trim())
      .filter(Boolean);

    return {
      food: nameList.length > 0 ? nameList.join(", ") : "Comida",
      calories: totals.calories,
      protein: totals.protein,
      carbs: totals.carbs,
      fats: totals.fats,
      mealType: value.mealType ?? "snack",
    };
  }

  return {
    food: value.food ?? value.name ?? "Comida",
    calories: value.calories ?? 0,
    protein: value.protein ?? 0,
    carbs: value.carbs ?? 0,
    fats: value.fats ?? value.fat ?? 0,
    mealType: value.mealType ?? "snack",
  };
};

const buildFallbackProgram = (totalDays: number) => {
  const days = Array.from({ length: totalDays }, (_, index) => ({
    title: `Dia ${index + 1}`,
    focus: "Full body",
    mode: "metabolic",
    weight: "Carga Media",
    bg: "bg-slate-900",
    border: "border-slate-800",
    blocks: [
      {
        id: 1,
        rest: 60,
        exercises: [{ name: "Sentadillas", reps: "10-12" }],
      },
      {
        id: 2,
        rest: 60,
        exercises: [{ name: "Flexiones", reps: "10-12" }],
      },
      {
        id: 3,
        rest: 45,
        exercises: [{ name: "Plancha", reps: "30-45s" }],
      },
    ],
  }));
  return {
    programName: "Programa Personalizado",
    description: "Programa generado automaticamente.",
    days,
  };
};

const normalizeProgram = (value: any, totalDays: number) => {
  const safeValue = typeof value === "object" && value ? value : {};
  const rawDays = Array.isArray(safeValue.days) ? safeValue.days : [];
  const daysBase = rawDays.length > 0 ? rawDays : Array.from({ length: totalDays }, () => ({}));

  const days = daysBase.map((day: any, index: number) => {
    const rawBlocks = Array.isArray(day?.blocks) ? day.blocks : [];
    const blocksBase = rawBlocks.length > 0 ? rawBlocks : [{ id: 1, rest: 60, exercises: [] }];
    const blocks = blocksBase.map((block: any, blockIndex: number) => {
      const rawExercises = Array.isArray(block?.exercises) ? block.exercises : [];
      const exercises =
        rawExercises.length > 0 ? rawExercises : [{ name: "Sentadillas", reps: "10-12" }];
      return {
        id: block?.id ?? blockIndex + 1,
        rest: block?.rest ?? 60,
        exercises,
      };
    });

    return {
      title: day?.title ?? `Dia ${index + 1}`,
      focus: day?.focus ?? "Full body",
      mode: day?.mode ?? "metabolic",
      weight: day?.weight ?? "Carga Media",
      bg: day?.bg ?? "bg-slate-900",
      border: day?.border ?? "border-slate-800",
      warmup: day?.warmup,
      cooldown: day?.cooldown,
      blocks,
    };
  });

  return {
    programName: safeValue.programName ?? "Programa Personalizado",
    description: safeValue.description ?? "Programa generado automaticamente.",
    days,
  };
};

import { NutritionLogSchema, GeneratedProgramSchema } from "./schemas.js";
import { z } from "zod";

const releaseQuota = async (uid: string, plan: PlanType) => {
  const entRef = billingCollection(uid).doc("entitlement");
  const entSnap = await entRef.get();
  if (!entSnap.exists) return;
  const data = entSnap.data() as { used?: number };
  const used = Math.max(0, (data.used ?? 1) - 1);
  await entRef.set({ used, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
};

const buildPrompt = (task: string, payload: Record<string, unknown>) => {
  switch (task) {
    case "nutrition_parse": {
      const log = String(payload.log ?? "");
      const system = `Eres un nutricionista experto. Analiza el texto del usuario y devuelve SOLO un objeto JSON valido (sin markdown, sin texto extra) con esta estructura:
{
  "food": "Descripcion corta de la comida",
  "calories": 500,
  "protein": 30,
  "carbs": 50,
  "fats": 15,
  "mealType": "breakfast" | "lunch" | "dinner" | "snack"
}
Reglas:
1. Si hay multiples alimentos, suma los macros en un solo registro.
2. Usa mealType segun el contexto; si no esta claro, usa "snack".
3. No incluyas campos adicionales ni texto fuera del JSON.`;
      return {
        system,
        user: `Analiza este registro de comidas: ${log}`,
      };
    }
    case "routine_program": {
      const profile = payload.profile ?? {};
      const totalDays = Number(payload.totalDays ?? 3);
      const system = `Eres un entrenador personal de elite. Tu tarea es generar un PROGRAMA DE ENTRENAMIENTO COMPLETO de ${totalDays} dias para la semana.
Devuelve SOLO un objeto JSON valido con la siguiente estructura, sin markdown:
{
  "programName": "Nombre epico del programa",
  "description": "Breve descripcion del enfoque del programa",
  "days": [
    {
      "title": "Nombre del dia",
      "focus": "Enfoque",
      "mode": "heavy" | "metabolic",
      "weight": "Carga Alta" | "Carga Media",
      "bg": "bg-slate-900",
      "border": "border-slate-800",
      "warmup": { "type": "push" | "pull" | "legs" | "full", "text": "Descripcion breve calentamiento" },
      "cooldown": { "text": "Descripcion breve vuelta a la calma" },
      "blocks": [
        {
          "id": 1,
          "rest": 60,
          "exercises": [
             {
               "name": "Nombre Ejercicio",
               "reps": "10-12",
               "note": "Nota opcional",
               "svg": "pullup" | "floor_press" | "pushup_feet_elevated" | "one_arm_row" | "plank" | "deadbug" | "glute_bridge" | "side_squat" | "goblet_squat" | "rdl" | "calf_raise_bilateral" | "face_pull" | "bicep_curl" | "tricep_extension" | "shoulder_press" | "leg_raise" | "dumbbell" | "barbell" | "bodyweight"
              }
          ]
        }
      ]
    }
  ]
}
Reglas importantes:
1. Debes generar EXACTAMENTE ${totalDays} dias.
2. Distribuye los grupos musculares logicamente durante la semana.
3. Cada dia debe tener al menos 3 bloques de ejercicios.
4. Elige el valor "svg" mas apropiado segun el ejercicio:
   - pullup: dominadas, chin-ups
   - floor_press: press de pecho, press de suelo
   - pushup_feet_elevated: flexiones, push-ups
   - one_arm_row: remos, rows
   - plank: planchas, isometricos
   - deadbug: ejercicios de core en suelo
   - glute_bridge: puentes de gluteo, hip thrust
   - goblet_squat: sentadillas con peso
   - rdl: peso muerto rumano
   - calf_raise_bilateral: pantorrillas
   - face_pull: tirantes, face pulls
   - bicep_curl: curl de biceps
   - tricep_extension: extensiones de triceps
   - shoulder_press: press de hombros
   - leg_raise: elevaciones de piernas
   - dumbbell: ejercicios generales con mancuernas
   - barbell: ejercicios generales con barra
   - bodyweight: ejercicios de peso corporal generales
5. No incluyas campos adicionales ni texto fuera del JSON.`;
      return {
        system,
        user: `Genera un programa de ${totalDays} dias para este perfil: ${JSON.stringify(profile)}`,
      };
    }
    case "exercise_variants": {
      const exerciseName = String(payload.exerciseName ?? "");
      const system = `Eres un experto en biomecanica. Tu tarea es sugerir variantes de ejercicios.
Devuelve SOLO texto plano con 3 variantes para el ejercicio dado, explicando brevemente el beneficio de cada una.
Formato:
1. Variante A: Beneficio
2. Variante B: Beneficio
3. Variante C: Beneficio`;
      return {
        system,
        user: `Sugiere 3 variantes para: ${exerciseName}`,
      };
    }
    case "exercise_analysis": {
      const exerciseName = String(payload.exerciseName ?? "");
      const history = JSON.stringify(payload.history ?? []);
      const system = `Eres un entrenador personal analitico. Analiza el historial de un ejercicio especifico.
Devuelve SOLO texto plano (max 3 lineas) con una conclusion sobre el progreso (fuerza, volumen o estancamiento) y una recomendacion corta.`;
      return {
        system,
        user: `Analiza este historial para ${exerciseName}: ${history}`,
      };
    }
    case "volume_trend": {
      const data = JSON.stringify(payload.data ?? []);
      const system = `Eres un analista de datos deportivos. Analiza la tendencia de volumen semanal.
Devuelve SOLO texto plano (max 2 lineas) indicando si la tendencia es ascendente, descendente o estancada, y si es adecuada para hipertrofia.`;
      return {
        system,
        user: `Analiza esta tendencia de volumen: ${data}`,
      };
    }
    case "weekly_coach": {
      const stats = JSON.stringify(payload.stats ?? {});
      const system = `Eres un coach motivacional y tecnico. Analiza el resumen semanal del usuario.
Devuelve SOLO texto plano (un parrafo breve) felicitando por los logros y sugiriendo un enfoque para la proxima semana.`;
      return {
        system,
        user: `Analiza este resumen semanal: ${stats}`,
      };
    }

    default:
      throw new Error("unknown_task");
  }
};

export const aiGenerate = onRequest(
  { timeoutSeconds: 60, invoker: "public" },
  async (req: Request, res: Response) => {
    const allowedOrigins = getAllowedOrigins();
    setCors(req.headers.origin, res);
    if (!isOriginAllowed(req.headers.origin, allowedOrigins)) {
      sendJson(res, 403, { error: "origin_not_allowed" });
      return;
    }
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    // Define these variables outside try scope so they can be used in catch block
    let currentUid: string | undefined;

    try {
      const { uid, plan } = await requireAuth(req);
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

      const { system, user } = buildPrompt(task, payload);
      const text = await callGemini(user, system);

      // --- ZOD VALIDATION START ---
      let validatedData: any = { text };
      try {
        let parsed: any;
        try {
          parsed = parseJsonWithFixes(text);
        } catch (parseError) {
          console.error("AI JSON Parse Error:", parseError);
          parsed = null;
        }

        if (task === "nutrition_parse") {
          const normalized = normalizeNutritionLog(parsed ?? {});
          const nutritionResult = NutritionLogSchema.safeParse(normalized ?? {});
          if (!nutritionResult.success) {
            throw new Error("ai_validation_failed");
          }
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
              if (fallbackResult.success) {
                validatedData = { text: JSON.stringify(fallbackResult.data) };
              } else {
                throw new Error("ai_validation_failed");
              }
            }
          }
        }
      } catch (validationError) {
        console.error("AI Validation Error:", validationError);
        // If validation fails, we treat it as an AI failure and should refund quota
        throw new Error("ai_validation_failed");
      }
      // --- ZOD VALIDATION END ---

      sendJson(res, 200, {
        text: validatedData.text || text, // Use validated text if available
        remaining: Math.max(0, quotaState.quota - quotaState.used),
        resetAt: quotaState.resetAt,
        plan: quotaState.plan,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown_error";
      console.error("aiGenerate error:", message, err);

      // Refund quota on AI/validation errors
      if (currentUid && (message === "ai_validation_failed" || message.startsWith("gemini_"))) {
        try {
          await releaseQuota(currentUid, "free");
        } catch (refundErr) {
          console.error("Failed to refund quota:", refundErr);
        }
      }

      if (message === "missing_auth") {
        sendJson(res, 401, { error: "unauthorized" });
      } else if (message === "quota_exceeded") {
        sendJson(res, 429, { error: "quota_exceeded" });
      } else {
        sendJson(res, 500, { error: "ai_failed", message });
      }
    }
  },
);

export const createCheckoutSession = onRequest(
  { timeoutSeconds: 60, invoker: "public" },
  async (req: Request, res: Response) => {
    const allowedOrigins = getAllowedOrigins();
    setCors(req.headers.origin, res);
    if (!isOriginAllowed(req.headers.origin, allowedOrigins)) {
      sendJson(res, 403, { error: "origin_not_allowed" });
      return;
    }
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }
    if (req.method !== "POST") {
      sendJson(res, 405, { error: "method_not_allowed" });
      return;
    }
    try {
      const { uid } = await requireAuth(req);
      if (!stripePricePro) {
        sendJson(res, 500, { error: "stripe_price_missing" });
        return;
      }
      const customerRef = billingCollection(uid).doc("customer");
      const customerSnap = await customerRef.get();
      let customerId = customerSnap.exists ? (customerSnap.data()?.stripeCustomerId as string) : "";
      if (!customerId) {
        const customer = await stripe.customers.create({ metadata: { uid } });
        customerId = customer.id;
        await customerRef.set({ stripeCustomerId: customerId }, { merge: true });
      }

      const defaultOrigin = allowedOrigins[0] || "";
      const successUrl = sanitizeReturnUrl(req.body?.successUrl, allowedOrigins) || defaultOrigin;
      const cancelUrl = sanitizeReturnUrl(req.body?.cancelUrl, allowedOrigins) || defaultOrigin;
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        line_items: [{ price: stripePricePro, quantity: 1 }],
        success_url: successUrl || "https://example.com/success",
        cancel_url: cancelUrl || "https://example.com/cancel",
        client_reference_id: uid,
        metadata: { uid },
      });

      sendJson(res, 200, { url: session.url });
    } catch (err: any) {
      // Handle "No such customer" error (e.g. customer deleted in Stripe dashboard)
      if (err?.code === "resource_missing" && err?.param === "customer") {
        console.warn("Stripe customer missing, recreating...", err.message);
        try {
          const { uid } = await requireAuth(req);
          const customerRef = billingCollection(uid).doc("customer");

          // Clear invalid customer ID
          await customerRef.delete();

          // Create new customer
          const customer = await stripe.customers.create({ metadata: { uid } });
          const newCustomerId = customer.id;
          await customerRef.set({ stripeCustomerId: newCustomerId }, { merge: true });

          // Retry session creation
          const defaultOrigin = allowedOrigins[0] || "";
          const successUrl =
            sanitizeReturnUrl(req.body?.successUrl, allowedOrigins) || defaultOrigin;
          const cancelUrl = sanitizeReturnUrl(req.body?.cancelUrl, allowedOrigins) || defaultOrigin;

          const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            customer: newCustomerId,
            line_items: [{ price: stripePricePro, quantity: 1 }],
            success_url: successUrl || "https://example.com/success",
            cancel_url: cancelUrl || "https://example.com/cancel",
            client_reference_id: uid,
            metadata: { uid },
          });

          sendJson(res, 200, { url: session.url });
          return;
        } catch (retryErr) {
          const message = retryErr instanceof Error ? retryErr.message : "unknown_retry_error";
          sendJson(res, 500, { error: "checkout_failed_retry", message });
          return;
        }
      }

      const message = err instanceof Error ? err.message : "unknown_error";
      sendJson(res, 500, { error: "checkout_failed", message });
    }
  },
);

export const createBillingPortal = onRequest(
  { timeoutSeconds: 60, invoker: "public" },
  async (req: Request, res: Response) => {
    const allowedOrigins = getAllowedOrigins();
    setCors(req.headers.origin, res);
    if (!isOriginAllowed(req.headers.origin, allowedOrigins)) {
      sendJson(res, 403, { error: "origin_not_allowed" });
      return;
    }
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }
    if (req.method !== "POST") {
      sendJson(res, 405, { error: "method_not_allowed" });
      return;
    }
    try {
      const { uid } = await requireAuth(req);
      const customerRef = billingCollection(uid).doc("customer");
      const customerSnap = await customerRef.get();
      let customerId = customerSnap.data()?.stripeCustomerId as string | undefined;
      if (!customerId) {
        // Lazy create customer if missing
        const customer = await stripe.customers.create({ metadata: { uid } });
        customerId = customer.id;
        await customerRef.set({ stripeCustomerId: customerId }, { merge: true });
      }
      const returnUrl =
        sanitizeReturnUrl(req.body?.returnUrl, allowedOrigins) || allowedOrigins[0] || "";
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl || "https://example.com",
      });
      sendJson(res, 200, { url: session.url });
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown_error";
      sendJson(res, 500, { error: "portal_failed", message });
    }
  },
);

const updatePlanForCustomer = async (
  customerId: string,
  isPro: boolean,
  subscriptionId?: string,
) => {
  console.log("updatePlanForCustomer called:", { customerId, isPro, subscriptionId });

  try {
    const userQuery = await db
      .collectionGroup("billing")
      .where("stripeCustomerId", "==", customerId)
      .limit(1)
      .get();

    console.log("Query result:", { empty: userQuery.empty, size: userQuery.size });

    if (userQuery.empty) {
      console.warn("No billing document found for customer:", customerId);
      return;
    }

    const customerDoc = userQuery.docs[0];
    const uid = customerDoc.ref.parent.parent?.id;
    console.log("Found user:", { uid, docPath: customerDoc.ref.path });

    if (!uid) {
      console.warn("Could not extract UID from document path");
      return;
    }

    const plan: PlanType = isPro ? "pro" : "free";
    console.log("Setting plan:", { uid, plan });

    await auth.setCustomUserClaims(uid, { plan });
    console.log("Custom claims set successfully");

    await billingCollection(uid)
      .doc("entitlement")
      .set(
        {
          plan,
          subscriptionId: subscriptionId ?? null,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    console.log("Entitlement document updated successfully");
  } catch (err) {
    console.error("updatePlanForCustomer error:", err);
    throw err; // Re-throw to be caught by webhook handler
  }
};

export const stripeWebhook = onRequest(
  { timeoutSeconds: 60, invoker: "public" },
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string | undefined;
    if (!sig || !stripeWebhookSecret) {
      res.status(400).send("missing_signature");
      return;
    }

    let event: Stripe.Event;
    try {
      const payload = (req as any).rawBody;
      event = stripe.webhooks.constructEvent(payload, sig, stripeWebhookSecret);
    } catch (err) {
      res.status(400).send("invalid_signature");
      return;
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          if (session.customer) {
            await updatePlanForCustomer(
              String(session.customer),
              true,
              String(session.subscription),
            );
          }
          break;
        }
        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          const isActive = subscription.status === "active" || subscription.status === "trialing";
          await updatePlanForCustomer(String(subscription.customer), isActive, subscription.id);
          break;
        }
        default:
          break;
      }
    } catch (err) {
      res.status(500).send("webhook_failed");
      return;
    }

    res.status(200).send("ok");
  },
);
