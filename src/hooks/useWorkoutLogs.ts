import { useState, useEffect, useMemo } from "react";
import { doc, setDoc, onSnapshot, collection } from "firebase/firestore";
import { db, appId } from "../config/firebase";
import type { User } from "firebase/auth";
import type { WorkoutLogs, WorkoutLogEntry } from "../types";

export interface UseWorkoutLogsReturn {
  workoutLogs: WorkoutLogs;
  coachAdvice: string | null;
  saveCoachAdvice: (advice: string) => Promise<void>;
  dbError: string | null;
  dayStreak: number;
  weekStreak: number;
}

export const useWorkoutLogs = (user: User | null): UseWorkoutLogsReturn => {
  const [legacyLogs, setLegacyLogs] = useState<WorkoutLogs>({});
  const [sessionLogs, setSessionLogs] = useState<WorkoutLogs>({});
  const [coachAdvice, setCoachAdvice] = useState<string | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);

  // ── Merge legacy + session logs into a single WorkoutLogs ──
  const workoutLogs = useMemo(() => {
    const merged: WorkoutLogs = {};

    // Add legacy logs
    Object.entries(legacyLogs).forEach(([exercise, entries]) => {
      merged[exercise] = [...(merged[exercise] || []), ...entries];
    });

    // Add session logs
    Object.entries(sessionLogs).forEach(([exercise, entries]) => {
      merged[exercise] = [...(merged[exercise] || []), ...entries];
    });

    return merged;
  }, [legacyLogs, sessionLogs]);

  // Calcular racha diaria (Day Streak) y racha semanal (Week Streak)
  const { dayStreak, weekStreak } = useMemo(() => {
    // Obtener todas las fechas únicas de entrenamiento
    const allDates = new Set<string>();
    Object.values(workoutLogs).forEach((logs) => {
      logs.forEach((log) => {
        const d = new Date(log.date);
        if (!isNaN(d.getTime())) {
          allDates.add(d.toDateString());
        }
      });
    });

    if (allDates.size === 0) return { dayStreak: 0, weekStreak: 0 };

    const sortedDates = Array.from(allDates)
      .map((d) => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // --- CÁLCULO RACHA DIARIA ---
    let currentDayStreak = 0;
    const lastWorkout = sortedDates[0];

    // Si el último entreno fue hoy o ayer, calculamos racha diaria
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

    // --- CÁLCULO RACHA SEMANAL ---
    // Agrupar fechas por semana (Lunes a Domingo)
    const getWeekId = (date: Date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lunes
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

    // La racha se mantiene si entrenó esta semana O si la semana pasada entrenó (y esta sigue en curso)
    if (hasWorkoutThisWeek || hasWorkoutLastWeek) {
      // Re-calculamos contando semanas consecutivas reales
      let tempStreak = 0;
      let checkWeek = new Date(hasWorkoutThisWeek ? currentWeekId : lastWeekId);

      while (weeksWithWorkouts.has(checkWeek.toDateString())) {
        tempStreak++;
        checkWeek.setDate(checkWeek.getDate() - 7);
      }
      currentWeekStreak = tempStreak;
    }

    return { dayStreak: currentDayStreak, weekStreak: currentWeekStreak };
  }, [workoutLogs]);

  // ── Listen to legacy logs document ──
  useEffect(() => {
    if (!user || !db) return;

    const docRef = doc(db, "artifacts", appId, "users", user.uid, "app_data", "logs");

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as {
            logs?: WorkoutLogs;
            coachAdvice?: string;
            [key: string]: unknown;
          };
          // Soporte para nueva estructura { logs: { ... }, coachAdvice: "..." }
          // y para estructura antigua { ejercicio1: [ ... ], ejercicio2: [ ... ] }
          if (data.logs) {
            setLegacyLogs(data.logs);
            setCoachAdvice(data.coachAdvice || null);
          } else {
            // Estructura antigua: filtrar metadatos para evitar TypeErrors
            const filteredLogs: WorkoutLogs = {};
            Object.entries(data).forEach(([key, value]) => {
              if (Array.isArray(value)) {
                filteredLogs[key] = value as WorkoutLogEntry[];
              }
            });
            setLegacyLogs(filteredLogs);
            setCoachAdvice((data.coachAdvice as string) || null);
          }
        } else {
          setLegacyLogs({});
          setCoachAdvice(null);
        }
      },
      (error) => {
        console.error("Firestore Read Error", error);
        setDbError("Error leyendo datos");
      },
    );

    return () => unsubscribe();
  }, [user]);

  // ── Load all workout_sessions subcollection ──
  useEffect(() => {
    if (!user || !db) return;

    const sessionsRef = collection(db, "artifacts", appId, "users", user.uid, "workout_sessions");

    // Use onSnapshot for real-time updates
    const unsubscribe = onSnapshot(
      sessionsRef,
      (snapshot) => {
        const merged: WorkoutLogs = {};
        snapshot.docs.forEach((docSnap) => {
          const session = docSnap.data();
          if (session.logs && typeof session.logs === "object") {
            Object.entries(session.logs).forEach(([exercise, entries]) => {
              if (Array.isArray(entries)) {
                merged[exercise] = [...(merged[exercise] || []), ...(entries as WorkoutLogEntry[])];
              }
            });
          }
        });
        setSessionLogs(merged);
      },
      (error) => {
        console.error("Firestore Sessions Read Error", error);
        // Don't overwrite dbError if legacy read also failed
      },
    );

    return () => unsubscribe();
  }, [user]);

  const saveCoachAdvice = async (advice: string): Promise<void> => {
    if (!user || !db) return;

    setCoachAdvice(advice);
    try {
      const docRef = doc(db, "artifacts", appId, "users", user.uid, "app_data", "logs");
      await setDoc(docRef, { coachAdvice: advice }, { merge: true });
    } catch (e) {
      console.error("Coach Advice Save Error", e);
      setDbError("Error guardando reporte del coach");
    }
  };

  return {
    workoutLogs,
    coachAdvice,
    saveCoachAdvice,
    dbError,
    dayStreak,
    weekStreak,
  };
};
