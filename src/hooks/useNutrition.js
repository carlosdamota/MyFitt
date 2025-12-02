import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, onSnapshot, orderBy } from 'firebase/firestore';
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
    // Escuchar cambios en tiempo real, ordenados por fecha descendente
    // Nota: Firestore requiere índice para ordenar. Si falla, usaremos ordenamiento en cliente.
    // Para simplificar y evitar errores de índice ahora, ordenaremos en cliente.
    
    const unsubscribe = onSnapshot(logsRef, (snapshot) => {
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

  return { logs, loading, error, addFoodLog, deleteFoodLog, todayTotals };
};
