import { useState, useEffect } from 'react';
import { collection, getDocs, setDoc, doc, query } from 'firebase/firestore';
import { db, appId } from '../config/firebase';
import { routineData as defaultRoutineData } from '../data/routines';

export const useRoutines = (user) => {
  const [routines, setRoutines] = useState(defaultRoutineData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !db) {
      setRoutines(defaultRoutineData);
      setLoading(false);
      return;
    }

    const fetchRoutines = async () => {
      try {
        setLoading(true);
        const routinesRef = collection(db, 'artifacts', appId, 'users', user.uid, 'routines');
        const q = query(routinesRef);
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          // Si no hay rutinas personalizadas, usar las por defecto
          setRoutines(defaultRoutineData);
        } else {
          const customRoutines = {};
          querySnapshot.forEach((doc) => {
            customRoutines[doc.id] = doc.data();
          });
          // Ordenar por claves (day1, day2...) para mantener consistencia
          const sortedRoutines = Object.keys(customRoutines).sort().reduce(
            (obj, key) => { 
              obj[key] = customRoutines[key]; 
              return obj;
            }, 
            {}
          );
          setRoutines(sortedRoutines);
        }
      } catch (err) {
        console.error("Error fetching routines:", err);
        setError("Error cargando rutinas personalizadas");
        // Fallback a default en caso de error
        setRoutines(defaultRoutineData);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutines();
  }, [user]);

  const saveRoutine = async (routineId, routineData) => {
    if (!user || !db) return;
    try {
      const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'routines', routineId);
      await setDoc(docRef, routineData);
      
      // Actualizar estado local
      setRoutines(prev => ({
        ...prev,
        [routineId]: routineData
      }));
      return true;
    } catch (err) {
      console.error("Error saving routine:", err);
      setError("Error guardando la rutina");
      return false;
    }
  };

  return { routines, loading, error, saveRoutine };
};
