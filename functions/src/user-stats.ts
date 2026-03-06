import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getPostHogClient } from "./utils/posthog.js";

/**
 * Personal Best structure (mirrors frontend)
 */
interface PB {
  weight: number;
  reps: number;
  date: string;
}

interface UserStatsData {
  totalSessions: number;
  totalVolume: number;
  totalExercises: number;
  workoutDates: string[];
  gamification?: {
    weekStreak: number;
    bestWeekStreak: number;
    shieldCount: number;
    shieldProgress: number;
    medalTier: "none" | "bronze" | "silver" | "gold";
    lastProcessedWeekKey?: string;
    lastRescueAt?: string;
    lastRescueWeekKey?: string;
  };
  personalBests: {
    [exerciseName: string]: {
      low?: PB;
      mid?: PB;
      high?: PB;
    };
  };
  dailyVolume: {
    date: string;
    volume: number;
  }[];
}

export const createUpdateUserStatsFunction = (params: { appId: string }) => {
  const { appId } = params;
  const campaignTimeZone = "Europe/Madrid";

  const resolveMedalTier = (weekStreak: number): "none" | "bronze" | "silver" | "gold" => {
    if (weekStreak >= 24) return "gold";
    if (weekStreak >= 12) return "silver";
    if (weekStreak >= 4) return "bronze";
    return "none";
  };

  const ensureGamification = (stats: UserStatsData) => {
    const current = stats.gamification;
    const safeWeekStreak = Math.max(0, Number(current?.weekStreak ?? 0));
    const safeBest = Math.max(safeWeekStreak, Number(current?.bestWeekStreak ?? 0));

    return {
      weekStreak: safeWeekStreak,
      bestWeekStreak: safeBest,
      shieldCount: Math.min(3, Math.max(0, Number(current?.shieldCount ?? 0))),
      shieldProgress: Math.min(9, Math.max(0, Number(current?.shieldProgress ?? 0))),
      medalTier: resolveMedalTier(safeWeekStreak),
      lastProcessedWeekKey: current?.lastProcessedWeekKey,
      lastRescueAt: current?.lastRescueAt,
      lastRescueWeekKey: current?.lastRescueWeekKey,
    } as NonNullable<UserStatsData["gamification"]>;
  };

  const toDateKeyInTimeZone = (rawDate: string): string => {
    const parsed = new Date(rawDate);
    if (Number.isNaN(parsed.getTime())) return rawDate.slice(0, 10);
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: campaignTimeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(parsed);
  };

  return onDocumentCreated(
    `artifacts/${appId}/users/{userId}/workout_sessions/{sessionId}`,
    async (event) => {
      const snapshot = event.data;
      if (!snapshot) return;

      const db = getFirestore();
      const userId = event.params.userId;
      const sessionData = snapshot.data();
      if (!sessionData || !sessionData.logs) return;

      const statsRef = db.doc(`artifacts/${appId}/users/${userId}/app_data/stats`);
      const notificationsRef = db.collection(`artifacts/${appId}/users/${userId}/notifications`);
      let didEarnShield = false;

      await db.runTransaction(async (transaction) => {
        const statsDoc = await transaction.get(statsRef);
        let stats: UserStatsData = statsDoc.exists
          ? (statsDoc.data() as UserStatsData)
          : {
              totalSessions: 0,
              totalVolume: 0,
              totalExercises: 0,
              workoutDates: [],
              gamification: {
                weekStreak: 0,
                bestWeekStreak: 0,
                shieldCount: 0,
                shieldProgress: 0,
                medalTier: "none",
              },
              personalBests: {},
              dailyVolume: [],
            };

        const gamification = ensureGamification(stats);

        const logs = sessionData.logs;
        const sessionDate = sessionData.date || new Date().toISOString();
        const dateKey = toDateKeyInTimeZone(sessionDate);

        let sessionVolume = 0;
        const sessionExercises = Object.keys(logs);

        // 1. Update Workout Dates for streaks
        if (!stats.workoutDates.includes(dateKey)) {
          stats.workoutDates.push(dateKey);
          stats.workoutDates.sort((a, b) => b.localeCompare(a));
        }

        // 2. Process Logs
        for (const [exerciseName, entries] of Object.entries(logs)) {
          if (!stats.personalBests[exerciseName]) {
            stats.personalBests[exerciseName] = {};
            stats.totalExercises++;
          }

          for (const entry of entries as any[]) {
            const weight = parseFloat(String(entry.weight || 0));
            const reps = parseInt(String(entry.reps || 0));
            const sets = parseInt(String(entry.sets || 1));
            const vol = weight * reps * sets;
            sessionVolume += vol;

            // Categorize PB
            let category: "low" | "mid" | "high" | null = null;
            if (reps >= 1 && reps <= 5) category = "low";
            else if (reps >= 6 && reps <= 12) category = "mid";
            else if (reps > 12) category = "high";

            if (category) {
              const currentPB = stats.personalBests[exerciseName][category];
              if (
                !currentPB ||
                weight > currentPB.weight ||
                (weight === currentPB.weight && reps > currentPB.reps)
              ) {
                stats.personalBests[exerciseName][category] = {
                  weight,
                  reps,
                  date: sessionDate,
                };
              }
            }
          }
        }

        // 3. Update Totals
        stats.totalSessions++;
        stats.totalVolume += sessionVolume;

        // 3b. Shield economy: every 10 completed sessions grants 1 shield (max inventory 3)
        if (gamification.shieldCount < 3) {
          gamification.shieldProgress += 1;
          if (gamification.shieldProgress >= 10) {
            gamification.shieldProgress = 0;
            gamification.shieldCount = Math.min(3, gamification.shieldCount + 1);
            didEarnShield = true;
          }
        }
        gamification.medalTier = resolveMedalTier(gamification.weekStreak);
        stats.gamification = gamification;

        // 4. Update Daily Volume Chart Data
        const existingDayIdx = stats.dailyVolume.findIndex((d) => d.date === dateKey);
        if (existingDayIdx > -1) {
          stats.dailyVolume[existingDayIdx].volume += sessionVolume;
        } else {
          stats.dailyVolume.push({ date: dateKey, volume: sessionVolume });
          // Limit to many days or keep some history? User wanted efficiency.
          // Let's keep last 90 days for trends.
          stats.dailyVolume.sort((a, b) => a.date.localeCompare(b.date));
          if (stats.dailyVolume.length > 100) stats.dailyVolume.shift();
        }

        transaction.set(statsRef, stats, { merge: true });
      });

      if (didEarnShield) {
        await notificationsRef.add({
          title: "Escudo conseguido",
          body: "Ganaste un escudo por tu constancia. Tu racha semanal está mejor protegida.",
          url: "/app",
          type: "shield_earned",
          status: "pending",
          createdAt: FieldValue.serverTimestamp(),
        });
      }

      // Track Firebase workload proxy in PostHog
      try {
        const ph = getPostHogClient();
        ph.capture({
          distinctId: userId,
          event: "stats_aggregated",
          properties: {
            session_id: event.params.sessionId,
            exercises_count: Object.keys(sessionData.logs || {}).length,
          },
        });
      } catch (phError) {
        console.error("Failed to track stats aggregation in PostHog:", phError);
      }
    },
  );
};
