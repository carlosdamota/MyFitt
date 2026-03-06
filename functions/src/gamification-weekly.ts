import { FieldValue, type DocumentReference, type Firestore } from "firebase-admin/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";

interface WeeklyGamificationDeps {
  db: Firestore;
  appId: string;
  timeZone?: string;
}

type NotificationType = "shield_rescue" | "medal_unlocked" | "streak_lost" | "streak_risk";

interface GamificationState {
  weekStreak: number;
  bestWeekStreak: number;
  shieldCount: number;
  shieldProgress: number;
  medalTier: "none" | "bronze" | "silver" | "gold";
  lastProcessedWeekKey?: string;
  lastRescueAt?: string;
  lastRescueWeekKey?: string;
}

interface UserStatsLike {
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

const resolveMedalTier = (weekStreak: number): "none" | "bronze" | "silver" | "gold" => {
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
  if (Number.isNaN(safeDate.getTime())) {
    return dateKey;
  }
  return getWeekKeyForDate(safeDate, timeZone);
};

const ensureGamification = (stats: UserStatsLike): GamificationState => {
  const source = stats.gamification || {};
  const weekStreak = Math.max(0, Number(source.weekStreak ?? 0));
  const bestWeekStreak = Math.max(weekStreak, Number(source.bestWeekStreak ?? 0));

  return {
    weekStreak,
    bestWeekStreak,
    shieldCount: Math.min(3, Math.max(0, Number(source.shieldCount ?? 0))),
    shieldProgress: Math.min(9, Math.max(0, Number(source.shieldProgress ?? 0))),
    medalTier: resolveMedalTier(weekStreak),
    lastProcessedWeekKey: source.lastProcessedWeekKey,
    lastRescueAt: source.lastRescueAt,
    lastRescueWeekKey: source.lastRescueWeekKey,
  };
};

export const createWeeklyGamificationRollupFunction = ({
  db,
  appId,
  timeZone = "Europe/Madrid",
}: WeeklyGamificationDeps) => {
  const notifyUser = async (
    userRef: DocumentReference,
    notificationId: string,
    payload: {
      title: string;
      body: string;
      url?: string;
      type: NotificationType;
      meta?: Record<string, unknown>;
    },
  ) => {
    await userRef
      .collection("notifications")
      .doc(notificationId)
      .set(
        {
          ...payload,
          url: payload.url || "/app",
          status: "pending",
          createdAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
  };

  return onSchedule({ schedule: "every monday 00:05", timeZone }, async () => {
    const currentWeekKey = getWeekKeyForDate(new Date(), timeZone);
    const closedWeekKey = addDaysIso(currentWeekKey, -7);

    logger.info("Running weekly gamification rollup", {
      timeZone,
      currentWeekKey,
      closedWeekKey,
    });

    const usersRef = db.collection("artifacts").doc(appId).collection("users");
    const userDocs = await usersRef.listDocuments();

    let processedUsers = 0;
    let streakIncrements = 0;
    let streakResets = 0;
    let shieldRescues = 0;
    let skippedAlreadyProcessed = 0;

    for (const userDocRef of userDocs) {
      const statsRef = userDocRef.collection("app_data").doc("stats");
      const statsSnap = await statsRef.get();
      if (!statsSnap.exists) {
        continue;
      }

      const stats = (statsSnap.data() || {}) as UserStatsLike;
      const gamification = ensureGamification(stats);
      const previousTier = resolveMedalTier(gamification.weekStreak);
      const previousStreak = gamification.weekStreak;

      if (gamification.lastProcessedWeekKey === closedWeekKey) {
        skippedAlreadyProcessed++;
        continue;
      }

      const workoutDates = Array.isArray(stats.workoutDates) ? stats.workoutDates : [];
      const hadWorkoutInClosedWeek = workoutDates.some(
        (dateKey) => getWeekKeyForDateKey(dateKey, timeZone) === closedWeekKey,
      );

      if (hadWorkoutInClosedWeek) {
        gamification.weekStreak += 1;
        gamification.bestWeekStreak = Math.max(gamification.bestWeekStreak, gamification.weekStreak);
        streakIncrements++;
      } else if (gamification.shieldCount > 0) {
        gamification.shieldCount -= 1;
        gamification.lastRescueAt = new Date().toISOString();
        gamification.lastRescueWeekKey = closedWeekKey;
        shieldRescues++;

        await notifyUser(userDocRef, `shield_rescue_${closedWeekKey}`, {
          title: "Escudo activado",
          body: "Usamos un escudo para proteger tu racha semanal. Tu progreso sigue intacto.",
          type: "shield_rescue",
          meta: {
            weekKey: closedWeekKey,
            previousStreak,
          },
        });
      } else {
        gamification.weekStreak = 0;
        streakResets++;

        await notifyUser(userDocRef, `streak_lost_${closedWeekKey}`, {
          title: "Racha reiniciada",
          body: "La semana cerró sin entrenos ni escudo. Reiniciamos tu racha, pero hoy puedes empezar una nueva.",
          type: "streak_lost",
          meta: {
            weekKey: closedWeekKey,
            previousStreak,
          },
        });
      }

      gamification.medalTier = resolveMedalTier(gamification.weekStreak);
      gamification.lastProcessedWeekKey = closedWeekKey;

      if (hadWorkoutInClosedWeek && previousTier !== gamification.medalTier && gamification.medalTier !== "none") {
        const medalLabel =
          gamification.medalTier === "gold"
            ? "Oro"
            : gamification.medalTier === "silver"
              ? "Plata"
              : "Bronce";

        await notifyUser(userDocRef, `medal_unlocked_${gamification.medalTier}_${closedWeekKey}`, {
          title: `Medalla ${medalLabel} desbloqueada`,
          body: `Conseguiste la medalla ${medalLabel} por tu constancia semanal. Sigue así para el siguiente nivel.`,
          type: "medal_unlocked",
          meta: {
            tier: gamification.medalTier,
            streakWeeks: gamification.weekStreak,
            weekKey: closedWeekKey,
          },
        });
      }

      await statsRef.set(
        {
          gamification,
        },
        { merge: true },
      );

      processedUsers++;
    }

    logger.info("Weekly gamification rollup completed", {
      scannedUsers: userDocs.length,
      processedUsers,
      streakIncrements,
      shieldRescues,
      streakResets,
      skippedAlreadyProcessed,
      closedWeekKey,
    });
  });
};

export const createStreakRiskReminderFunction = ({
  db,
  appId,
  timeZone = "Europe/Madrid",
}: WeeklyGamificationDeps) => {
  const notifyUser = async (
    userRef: DocumentReference,
    notificationId: string,
    payload: {
      title: string;
      body: string;
      url?: string;
      type: NotificationType;
      meta?: Record<string, unknown>;
    },
  ) => {
    await userRef
      .collection("notifications")
      .doc(notificationId)
      .set(
        {
          ...payload,
          url: payload.url || "/app",
          status: "pending",
          createdAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
  };

  return onSchedule({ schedule: "every saturday 19:00", timeZone }, async () => {
    const currentWeekKey = getWeekKeyForDate(new Date(), timeZone);
    const usersRef = db.collection("artifacts").doc(appId).collection("users");
    const userDocs = await usersRef.listDocuments();

    let queued = 0;

    for (const userDocRef of userDocs) {
      const statsRef = userDocRef.collection("app_data").doc("stats");
      const statsSnap = await statsRef.get();
      if (!statsSnap.exists) continue;

      const stats = (statsSnap.data() || {}) as UserStatsLike;
      const gamification = ensureGamification(stats);

      if (gamification.weekStreak <= 0) continue;

      const workoutDates = Array.isArray(stats.workoutDates) ? stats.workoutDates : [];
      const hasWorkoutThisWeek = workoutDates.some(
        (dateKey) => getWeekKeyForDateKey(dateKey, timeZone) === currentWeekKey,
      );

      if (hasWorkoutThisWeek) continue;

      await notifyUser(userDocRef, `streak_risk_${currentWeekKey}`, {
        title: "Tu racha está en riesgo",
        body: "Aún puedes salvar la semana con un entreno. Un solo día mantiene tu racha viva.",
        type: "streak_risk",
        meta: {
          weekKey: currentWeekKey,
          currentStreak: gamification.weekStreak,
          shields: gamification.shieldCount,
        },
      });

      queued++;
    }

    logger.info("Streak risk reminders queued", {
      weekKey: currentWeekKey,
      scannedUsers: userDocs.length,
      queued,
    });
  });
};
