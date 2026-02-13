import { useState, useEffect, useMemo } from "react";
import {
  collection,
  query,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  limit,
  orderBy,
} from "firebase/firestore";
import { db, appId } from "../config/firebase";
import type { User } from "firebase/auth";
import type { NutritionLogEntry, MacroTotals, MealType } from "../types";

export interface UseNutritionReturn {
  logs: NutritionLogEntry[];
  loading: boolean;
  error: string | null;
  addFoodLog: (logData: Omit<NutritionLogEntry, "id" | "date">) => Promise<boolean>;
  deleteFoodLog: (logId: string) => Promise<boolean>;
  todayTotals: MacroTotals;
  getDayTotals: (date: Date | string) => MacroTotals;
}

export const useNutrition = (user: User | null): UseNutritionReturn => {
  const [logs, setLogs] = useState<NutritionLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !db) {
      setLogs([]);
      setLoading(false);
      return;
    }

    const logsRef = collection(db, "artifacts", appId, "users", user.uid, "nutrition_logs");
    // Limit to last 100 items to prevent performance issues
    const q = query(logsRef, orderBy("date", "desc"), limit(100));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedLogs: NutritionLogEntry[] = snapshot.docs.map(
          (docSnap) =>
            ({
              id: docSnap.id,
              ...docSnap.data(),
            }) as NutritionLogEntry,
        );

        setLogs(fetchedLogs);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching nutrition logs:", err);
        setError("Error cargando historial de nutrición");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  const addFoodLog = async (logData: Omit<NutritionLogEntry, "id" | "date">): Promise<boolean> => {
    if (!user || !db) return false;
    try {
      const logsRef = collection(db, "artifacts", appId, "users", user.uid, "nutrition_logs");
      await addDoc(logsRef, {
        ...logData,
        date: new Date().toISOString(),
      });
      return true;
    } catch (err) {
      console.error("Error adding food log:", err);
      setError("Error guardando comida");
      return false;
    }
  };

  const deleteFoodLog = async (logId: string): Promise<boolean> => {
    if (!user || !db) return false;
    try {
      const logRef = doc(db, "artifacts", appId, "users", user.uid, "nutrition_logs", logId);
      await deleteDoc(logRef);
      return true;
    } catch (err) {
      console.error("Error deleting food log:", err);
      setError("Error borrando comida");
      return false;
    }
  };

  // Calcular totales de hoy
  const todayTotals = useMemo<MacroTotals>(() => {
    const today = new Date().toDateString();
    const todaysLogs = logs.filter((log) => new Date(log.date).toDateString() === today);

    return todaysLogs.reduce<MacroTotals>(
      (acc, log) => ({
        calories: acc.calories + (log.calories || 0),
        protein: acc.protein + (log.protein || 0),
        carbs: acc.carbs + (log.carbs || 0),
        fats: acc.fats + (log.fats || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 },
    );
  }, [logs]);

  // Calcular totales para una fecha específica
  const getDayTotals = (date: Date | string): MacroTotals => {
    const targetDate = new Date(date).toDateString();
    const dayLogs = logs.filter((log) => new Date(log.date).toDateString() === targetDate);

    return dayLogs.reduce<MacroTotals>(
      (acc, log) => ({
        calories: acc.calories + (log.calories || 0),
        protein: acc.protein + (log.protein || 0),
        carbs: acc.carbs + (log.carbs || 0),
        fats: acc.fats + (log.fats || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 },
    );
  };

  return { logs, loading, error, addFoodLog, deleteFoodLog, todayTotals, getDayTotals };
};
