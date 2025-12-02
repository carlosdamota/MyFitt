import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db, appId } from '../config/firebase';

export const useNutrition = (user) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !db) {
      setLogs([]);
      setLoading(false);
      return;
    }

    const logsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'nutrition_logs');
    // Limit to last 100 items to prevent performance issues
    const q = query(logsRef, limit(100));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedLogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Ordenar en cliente por fecha descendente
      fetchedLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setLogs(fetchedLogs);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching nutrition logs:", err);
      setError("Error cargando historial de nutrición");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addFoodLog = async (logData) => {
    if (!user || !db) return;
    try {
      const logsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'nutrition_logs');
      await addDoc(logsRef, {
        ...logData,
        date: new Date().toISOString()
      });
      return true;
    } catch (err) {
      console.error("Error adding food log:", err);
      setError("Error guardando comida");
      return false;
    }
  };

  const deleteFoodLog = async (logId) => {
    if (!user || !db) return;
    try {
      const logRef = doc(db, 'artifacts', appId, 'users', user.uid, 'nutrition_logs', logId);
      await deleteDoc(logRef);
      return true;
    } catch (err) {
      console.error("Error deleting food log:", err);
      setError("Error borrando comida");
      return false;
    }
  };

  // Calcular totales de hoy
  const todayTotals = useMemo(() => {
    const today = new Date().toDateString();
    const todaysLogs = logs.filter(log => new Date(log.date).toDateString() === today);

    return todaysLogs.reduce((acc, log) => ({
      calories: acc.calories + (log.calories || 0),
      protein: acc.protein + (log.protein || 0),
      carbs: acc.carbs + (log.carbs || 0),
      fats: acc.fats + (log.fats || 0)
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
  }, [logs]);

  // Calcular totales para una fecha específica
  const getDayTotals = (date) => {
    const targetDate = new Date(date).toDateString();
    const dayLogs = logs.filter(log => new Date(log.date).toDateString() === targetDate);

    return dayLogs.reduce((acc, log) => ({
      calories: acc.calories + (log.calories || 0),
      protein: acc.protein + (log.protein || 0),
      carbs: acc.carbs + (log.carbs || 0),
      fats: acc.fats + (log.fats || 0)
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
  };

  return { logs, loading, error, addFoodLog, deleteFoodLog, todayTotals, getDayTotals };
};
