import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, collection, getDocs, getDoc, setDoc, query, orderBy } from "firebase/firestore";
import { db, appId } from "../config/firebase";
import type { User } from "firebase/auth";
import type { WorkoutLogs, WorkoutSession } from "../types";

export interface UseWorkoutLogsReturn {
  workoutLogs: WorkoutLogs;
  sessions: WorkoutSession[];
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  coachAdvice: string | null;
  saveCoachAdvice: (advice: string) => Promise<void>;
  isLoading: boolean;
  dbError: string | null;
  dayStreak: number;
  weekStreak: number;
}

export const useWorkoutLogs = (user: User | null): UseWorkoutLogsReturn => {
  const queryClient = useQueryClient();

  // 1. Fetch coachAdvice and streaks from legacy/metadata doc
  const { data: appData, isLoading: isAppDataLoading } = useQuery({
    queryKey: ["appData", user?.uid],
    queryFn: async () => {
      if (!user || !db) return null;
      const docRef = doc(db, "artifacts", appId, "users", user.uid, "app_data", "logs");
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        return {
          coachAdvice: (data.coachAdvice as string) || null,
        };
      }
      return { coachAdvice: null };
    },
    enabled: !!user && !!db,
  });

  // 2. Fetch All Sessions
  // Obtenemos todo el historial para que funcionen las estadísticas globales (Rachas, Gráficas)
  const {
    data: sessionsData,
    isLoading: isSessionsLoading,
    error: sessionsError,
  } = useQuery({
    queryKey: ["workout_sessions", user?.uid],
    queryFn: async () => {
      if (!user || !db) return [];

      const sessionsRef = collection(db, "artifacts", appId, "users", user.uid, "workout_sessions");
      // Sin límite de paginación para calcular rachas históricas
      const q = query(sessionsRef, orderBy("date", "desc"));

      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as WorkoutSession);
    },
    enabled: !!user && !!db,
  });

  const sessions = sessionsData || [];

  // Mantenemos estas firmas falsas para que la UI dependiente no se rompa (StatsPage / LogViewer)
  const fetchNextPage = () => {};
  const hasNextPage = false;
  const isFetchingNextPage = false;

  // Re-build older `workoutLogs` map format purely for backwards compatibility with UI
  const workoutLogs: WorkoutLogs = {};
  sessions.forEach((session) => {
    if (session.logs && typeof session.logs === "object") {
      Object.entries(session.logs).forEach(([exercise, entries]) => {
        if (!workoutLogs[exercise]) workoutLogs[exercise] = [];
        // Append at the end (sessions are desc ordered, so oldest exercises go to the end)
        workoutLogs[exercise].push(...(entries as any));
      });
    }
  });

  // 3. Mutate Coach Advice
  const { mutateAsync: mutateCoachAdvice } = useMutation({
    mutationFn: async (advice: string) => {
      if (!user || !db) throw new Error("No user or DB");
      const docRef = doc(db, "artifacts", appId, "users", user.uid, "app_data", "logs");
      await setDoc(docRef, { coachAdvice: advice }, { merge: true });
    },
    onSuccess: (_, advice) => {
      queryClient.setQueryData(["appData", user?.uid], (old: any) => ({
        ...old,
        coachAdvice: advice,
      }));
    },
  });

  // 4. Streak Calculation over locally loaded sessions
  // Notice: Since infinite queries only load 15 at first, this calculates streaks
  // ONLY for the most recent loaded data.
  const { dayStreak, weekStreak } = (() => {
    const allDates = new Set<string>();

    sessions.forEach((s) => {
      const d = new Date(s.date);
      if (!isNaN(d.getTime())) allDates.add(d.toDateString());
    });

    if (allDates.size === 0) return { dayStreak: 0, weekStreak: 0 };

    const sortedDates = Array.from(allDates)
      .map((d) => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // --- DAY STREAK ---
    let currentDayStreak = 0;
    const lastWorkout = sortedDates[0];

    if (lastWorkout >= yesterday) {
      currentDayStreak = 1;
      for (let i = 0; i < sortedDates.length - 1; i++) {
        const current = sortedDates[i];
        const next = sortedDates[i + 1];
        const diffTime = Math.abs(current.getTime() - next.getTime());
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentDayStreak++;
        } else {
          break;
        }
      }
    }

    // --- WEEK STREAK ---
    const getWeekId = (date: Date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d);
      monday.setDate(diff);
      return monday.toDateString();
    };

    const weeksWithWorkouts = new Set<string>();
    sortedDates.forEach((d) => weeksWithWorkouts.add(getWeekId(d)));

    const currentWeekId = getWeekId(today);
    const lastWeekDate = new Date(today);
    lastWeekDate.setDate(today.getDate() - 7);
    const lastWeekId = getWeekId(lastWeekDate);

    let currentWeekStreak = 0;
    const hasWorkoutThisWeek = weeksWithWorkouts.has(currentWeekId);
    const hasWorkoutLastWeek = weeksWithWorkouts.has(lastWeekId);

    if (hasWorkoutThisWeek || hasWorkoutLastWeek) {
      let tempStreak = 0;
      let checkWeek = new Date(hasWorkoutThisWeek ? currentWeekId : lastWeekId);

      while (weeksWithWorkouts.has(checkWeek.toDateString())) {
        tempStreak++;
        checkWeek.setDate(checkWeek.getDate() - 7);
      }
      currentWeekStreak = tempStreak;
    }

    return { dayStreak: currentDayStreak, weekStreak: currentWeekStreak };
  })();

  const saveCoachAdvice = async (advice: string) => {
    try {
      await mutateCoachAdvice(advice);
    } catch (e) {
      console.error(e);
    }
  };

  return {
    workoutLogs,
    sessions,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    coachAdvice: appData?.coachAdvice || null,
    saveCoachAdvice,
    isLoading: isAppDataLoading || isSessionsLoading,
    dbError: sessionsError ? "Error loading workout sessions" : null,
    dayStreak,
    weekStreak,
  };
};
