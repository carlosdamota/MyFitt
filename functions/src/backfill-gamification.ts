/**
 * Mini backfill for weekly gamification fields in app_data/stats.
 *
 * What it does:
 * - Creates missing `gamification` block.
 * - Computes an initial `weekStreak` from existing workoutDates.
 * - Infers initial shield inventory from totalSessions (10 sessions => 1 shield, max 3).
 * - Sets medal tier from streak thresholds: 4/12/24.
 *
 * By default, this script runs in DRY RUN mode.
 * Use --commit to actually write to Firestore.
 *
 * Usage:
 *   cd functions
 *   npx ts-node src/scripts/backfill-gamification.ts
 *   npx ts-node src/scripts/backfill-gamification.ts --commit
 */

import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp();

const db = getFirestore();
const appId = process.env.FITTWIZ_APP_ID ?? process.env.FITMANUAL_APP_ID ?? "fitmanual-default";
const TIME_ZONE = "Europe/Madrid";
const shouldCommit = process.argv.includes("--commit");

type MedalTier = "none" | "bronze" | "silver" | "gold";

interface GamificationState {
  weekStreak: number;
  bestWeekStreak: number;
  shieldCount: number;
  shieldProgress: number;
  medalTier: MedalTier;
  lastProcessedWeekKey?: string;
  lastRescueAt?: string;
  lastRescueWeekKey?: string;
}

interface UserStatsLike {
  totalSessions?: number;
  workoutDates?: string[];
  gamification?: Partial<GamificationState>;
}

const WEEKDAY_MAP: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
};

const resolveMedalTier = (weekStreak: number): MedalTier => {
  if (weekStreak >= 24) return "gold";
  if (weekStreak >= 12) return "silver";
  if (weekStreak >= 4) return "bronze";
  return "none";
};

const addDaysIso = (isoDate: string, days: number): string => {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

const getTimeZoneParts = (date: Date, timeZone: string) => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const pick = (type: string) => parts.find((part) => part.type === type)?.value || "";

  return {
    weekday: pick("weekday"),
    year: pick("year"),
    month: pick("month"),
    day: pick("day"),
  };
};

const getWeekKeyForDate = (date: Date, timeZone: string): string => {
  const { weekday, year, month, day } = getTimeZoneParts(date, timeZone);
  const localIso = `${year}-${month}-${day}`;
  const weekdayNumber = WEEKDAY_MAP[weekday] || 1;
  return addDaysIso(localIso, -(weekdayNumber - 1));
};

const getWeekKeyForDateKey = (dateKey: string, timeZone: string): string => {
  const safeDate = new Date(`${dateKey}T12:00:00.000Z`);
  if (Number.isNaN(safeDate.getTime())) return dateKey;
  return getWeekKeyForDate(safeDate, timeZone);
};

const computeWeekStreak = (workoutDates: string[], timeZone: string): number => {
  if (!Array.isArray(workoutDates) || workoutDates.length === 0) return 0;

  const weeksWithWorkouts = new Set(
    workoutDates
      .filter((d) => typeof d === "string" && d.length >= 10)
      .map((d) => getWeekKeyForDateKey(d.slice(0, 10), timeZone)),
  );

  const currentWeekKey = getWeekKeyForDate(new Date(), timeZone);
  const lastWeekKey = addDaysIso(currentWeekKey, -7);

  const anchorWeek = weeksWithWorkouts.has(currentWeekKey)
    ? currentWeekKey
    : weeksWithWorkouts.has(lastWeekKey)
      ? lastWeekKey
      : null;

  if (!anchorWeek) return 0;

  let streak = 0;
  let cursor = anchorWeek;

  while (weeksWithWorkouts.has(cursor)) {
    streak += 1;
    cursor = addDaysIso(cursor, -7);
  }

  return streak;
};

const inferShieldState = (totalSessions: number) => {
  const earnedShields = Math.floor(Math.max(0, totalSessions) / 10);
  const shieldCount = Math.min(3, earnedShields);
  const shieldProgress = shieldCount >= 3 ? 0 : Math.max(0, totalSessions) % 10;
  return { shieldCount, shieldProgress };
};

async function backfillGamification() {
  console.log(`🔧 Gamification mini-backfill for app: ${appId}`);
  console.log(`🧪 Mode: ${shouldCommit ? "COMMIT" : "DRY RUN"}`);

  const usersRef = db.collection("artifacts").doc(appId).collection("users");
  const userDocRefs = await usersRef.listDocuments();

  console.log(`📋 Found ${userDocRefs.length} users\n`);

  let scanned = 0;
  let updated = 0;
  let skipped = 0;

  for (const userDocRef of userDocRefs) {
    scanned += 1;

    const statsRef = userDocRef.collection("app_data").doc("stats");
    const statsSnap = await statsRef.get();

    if (!statsSnap.exists) {
      skipped += 1;
      continue;
    }

    const stats = (statsSnap.data() || {}) as UserStatsLike;
    const current = stats.gamification || {};

    const computedWeekStreak =
      current.weekStreak !== undefined
        ? Math.max(0, Number(current.weekStreak))
        : computeWeekStreak(stats.workoutDates || [], TIME_ZONE);

    const totalSessions = Math.max(0, Number(stats.totalSessions ?? 0));
    const inferredShield = inferShieldState(totalSessions);

    const next: GamificationState = {
      weekStreak: computedWeekStreak,
      bestWeekStreak: Math.max(computedWeekStreak, Number(current.bestWeekStreak ?? 0)),
      shieldCount:
        current.shieldCount !== undefined
          ? Math.min(3, Math.max(0, Number(current.shieldCount)))
          : inferredShield.shieldCount,
      shieldProgress:
        current.shieldProgress !== undefined
          ? Math.min(9, Math.max(0, Number(current.shieldProgress)))
          : inferredShield.shieldProgress,
      medalTier: resolveMedalTier(computedWeekStreak),
      ...(typeof current.lastProcessedWeekKey === "string"
        ? { lastProcessedWeekKey: current.lastProcessedWeekKey }
        : {}),
      ...(typeof current.lastRescueAt === "string" ? { lastRescueAt: current.lastRescueAt } : {}),
      ...(typeof current.lastRescueWeekKey === "string"
        ? { lastRescueWeekKey: current.lastRescueWeekKey }
        : {}),
    };

    const unchanged =
      Number(current.weekStreak ?? -1) === next.weekStreak &&
      Number(current.bestWeekStreak ?? -1) === next.bestWeekStreak &&
      Number(current.shieldCount ?? -1) === next.shieldCount &&
      Number(current.shieldProgress ?? -1) === next.shieldProgress &&
      String(current.medalTier ?? "") === next.medalTier;

    if (unchanged) {
      skipped += 1;
      continue;
    }

    if (shouldCommit) {
      await statsRef.set({ gamification: next }, { merge: true });
    }

    updated += 1;
    console.log(
      `  ${shouldCommit ? "✅" : "📝"} ${userDocRef.id} -> streak=${next.weekStreak}, shields=${next.shieldCount}, progress=${next.shieldProgress}/10, medal=${next.medalTier}`,
    );
  }

  console.log("\n🏁 Mini-backfill finished");
  console.log(`   Scanned: ${scanned}`);
  console.log(`   ${shouldCommit ? "Updated" : "Would update"}: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
}

backfillGamification().catch((err) => {
  console.error("❌ Mini-backfill failed:", err);
  process.exit(1);
});
