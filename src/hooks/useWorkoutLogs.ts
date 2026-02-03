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
  streak: number;
}

export const useWorkoutLogs = (user: User | null): UseWorkoutLogsReturn => {
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLogs>({});
  const [coachAdvice, setCoachAdvice] = useState<string | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);

  // Calcular racha (Streak)
  const streak = useMemo<number>(() => {
    // Obtener todas las fechas únicas de entrenamiento
    const allDates = new Set<string>();
    Object.values(workoutLogs).forEach((logs) => {
      logs.forEach((log) => {
        allDates.add(new Date(log.date).toDateString());
      });
    });

    if (allDates.size === 0) return 0;

    const sortedDates = Array.from(allDates)
      .map((d) => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Verificar si el último entrenamiento fue hoy o ayer
    const lastWorkout = sortedDates[0];
    // Si el último entreno fue antes de ayer, la racha se rompió (0)
    if (lastWorkout < yesterday) return 0;

    let currentStreak = 1; // Empezamos con 1 porque ya verificamos que entrenó hoy o ayer

    // Si entrenó hoy, el siguiente a buscar es ayer. Si entrenó ayer, el siguiente es anteayer.
    // Simplemente contamos días consecutivos hacia atrás.
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const current = sortedDates[i];
      const next = sortedDates[i + 1];
      const diffTime = Math.abs(current.getTime() - next.getTime());
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
    return currentStreak;
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

  return { workoutLogs, saveLog, deleteLog, coachAdvice, saveCoachAdvice, dbError, streak };
};
