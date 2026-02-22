import { FieldValue, type Firestore } from "firebase-admin/firestore";
import { billingCollection } from "../data.js";

export type PlanType = "free" | "pro";

export type QuotaType = "routine" | "nutrition" | "coach" | "analysis";

export interface Quotas {
  routine: { free: number; pro: number };
  nutrition: { free: number; pro: number };
  coach: { free: number; pro: number };
  analysis: { free: number; pro: number };
}

export const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};

export const getQuotaLimit = (plan: PlanType, type: QuotaType, quotas: Quotas) => {
  return { quota: quotas[type][plan], resetInDays: 30 };
};

export const ensureEntitlement = async (
  db: Firestore,
  appId: string,
  uid: string,
  jwtPlan: PlanType,
) => {
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

export const getQuotaTypeFromTask = (task: string): QuotaType => {
  if (task === "routine_program") return "routine";
  if (task === "nutrition_parse") return "nutrition";
  if (task === "weekly_coach" || task === "chat_coach") return "coach";
  if (task === "nutrition_analysis" || task === "volume_trend" || task === "exercise_analysis")
    return "analysis";
  return "nutrition";
};

export const consumeQuota = async (
  db: Firestore,
  appId: string,
  uid: string,
  plan: PlanType,
  task: string,
  quotas: Quotas,
) => {
  const quotaType = getQuotaTypeFromTask(task);
  const entRef = billingCollection(db, appId, uid).doc("entitlement");
  const ent = await ensureEntitlement(db, appId, uid, plan);

  const limit = getQuotaLimit(ent.plan, quotaType, quotas);
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

export const releaseQuota = async (db: Firestore, appId: string, uid: string, task: string) => {
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
