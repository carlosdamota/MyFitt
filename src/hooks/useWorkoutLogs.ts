import { useState, useEffect, useMemo } from "react";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db, appId } from "../config/firebase";
import type { User } from "firebase/auth";
import type { WorkoutLogs, WorkoutLogEntry } from "../types";

export interface UseWorkoutLogsReturn {
  workoutLogs: WorkoutLogs;
  saveLog: (exerciseName: string, entry: WorkoutLogEntry) => Promise<void>;
  deleteLog: (exerciseName: string, logToDelete: WorkoutLogEntry) => Promise<void>;
  coachAdvice: string | null;
  saveCoachAdvice: (advice: string) => Promise<void>;
  dbError: string | null;
  dayStreak: number;
  weekStreak: number;
}

export const useWorkoutLogs = (user: User | null): UseWorkoutLogsReturn => {
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLogs>({});
  const [coachAdvice, setCoachAdvice] = useState<string | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);

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
    const sortedWeekIds = Array.from(weeksWithWorkouts)
      .map((d) => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime())
      .map((d) => d.toDateString());

    const hasWorkoutThisWeek = weeksWithWorkouts.has(currentWeekId);
    const hasWorkoutLastWeek = weeksWithWorkouts.has(lastWeekId);

    // La racha se mantiene si entrenó esta semana O si la semana pasada entrenó (y esta sigue en curso)
    if (hasWorkoutThisWeek || hasWorkoutLastWeek) {
      currentWeekStreak = hasWorkoutThisWeek ? 1 : 0; // Si no ha entrenado esta semana, empezamos desde la racha de semanas pasadas

      // Si entrenó esta semana, empezamos a buscar desde esta semana hacia atrás
      // Si no, empezamos desde la semana pasada
      let startIdx = hasWorkoutThisWeek ? 0 : sortedWeekIds.indexOf(lastWeekId);
      if (startIdx === -1) startIdx = 0;

      if (hasWorkoutThisWeek) currentWeekStreak = 1;
      else if (hasWorkoutLastWeek) {
        // No tiene hoy, pero tiene la pasada. La racha es la que traía hasta la pasada.
        currentWeekStreak = 0;
      }

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

  useEffect(() => {
    // Escuchar los logs solo si el usuario está autenticado y db está inicializado
    if (!user || !db) return;

    // Ruta de la colección: /artifacts/{appId}/users/{userId}/app_data/logs
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
            setWorkoutLogs(data.logs);
            setCoachAdvice(data.coachAdvice || null);
          } else {
            // Estructura antigua: filtrar metadatos para evitar TypeErrors
            const filteredLogs: WorkoutLogs = {};
            Object.entries(data).forEach(([key, value]) => {
              if (Array.isArray(value)) {
                filteredLogs[key] = value as WorkoutLogEntry[];
              }
            });
            setWorkoutLogs(filteredLogs);
            setCoachAdvice((data.coachAdvice as string) || null);
          }
        } else {
          setWorkoutLogs({});
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

  const saveLog = async (exerciseName: string, entry: WorkoutLogEntry): Promise<void> => {
    if (!user || !db) return;

    const previousLogs = { ...workoutLogs };
    const newLogs = { ...workoutLogs };
    const currentExerciseLogs = newLogs[exerciseName] || [];
    newLogs[exerciseName] = [...currentExerciseLogs, entry];

    // Actualización optimista
    setWorkoutLogs(newLogs);

    try {
      const docRef = doc(db, "artifacts", appId, "users", user.uid, "app_data", "logs");
      await setDoc(docRef, { logs: newLogs }, { merge: true });
    } catch (e) {
      console.error("Save Error", e);
      setDbError("Error guardando datos");
      // Revertir
      setWorkoutLogs(previousLogs);
    }
  };

  const deleteLog = async (exerciseName: string, logToDelete: WorkoutLogEntry): Promise<void> => {
    if (!user || !db) return;

    const previousLogs = { ...workoutLogs };
    const newLogs = { ...workoutLogs };
    const currentExerciseLogs = newLogs[exerciseName] || [];

    // Filtrar el log a borrar por su marca de tiempo 'date'
    newLogs[exerciseName] = currentExerciseLogs.filter((log) => log.date !== logToDelete.date);

    setWorkoutLogs(newLogs);

    try {
      const docRef = doc(db, "artifacts", appId, "users", user.uid, "app_data", "logs");
      await setDoc(docRef, { logs: newLogs }, { merge: true });
    } catch (e) {
      console.error("Delete Error", e);
      setDbError("Error borrando datos");
      setWorkoutLogs(previousLogs);
    }
  };

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
    saveLog,
    deleteLog,
    coachAdvice,
    saveCoachAdvice,
    dbError,
    dayStreak,
    weekStreak,
  };
};
