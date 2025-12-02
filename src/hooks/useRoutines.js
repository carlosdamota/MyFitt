import { useState, useEffect } from 'react';
import { collection, getDocs, setDoc, doc, query, addDoc, getDoc, limit } from 'firebase/firestore';
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
        // Limit to 20 routines (more than enough for a weekly schedule + extras)
        const q = query(routinesRef, limit(20));
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

  /**
   * Comparte una rutina publicándola en una colección pública.
   * @param {string} routineId - ID de la rutina (ej. 'day1')
   * @param {object} routineData - Datos de la rutina
   * @returns {string|null} - ID de la rutina compartida o null si falla
   */
  const shareRoutine = async (routineId, routineData) => {
    if (!user || !db) return null;
    try {
      // Crear un documento en una colección pública 'shared_routines'
      const sharedRef = collection(db, 'artifacts', appId, 'shared_routines');
      
      const docRef = await addDoc(sharedRef, {
        ...routineData,
        originalAuthor: user.uid,
        originalName: routineData.title || routineId,
        sharedAt: new Date().toISOString()
      });

      return docRef.id;
    } catch (err) {
      console.error("Error sharing routine:", err);
      setError("Error compartiendo la rutina");
      return null;
    }
  };

  /**
   * Importa una rutina compartida a la colección del usuario.
   * @param {string} sharedId - ID de la rutina compartida
   * @param {string} targetDayId - ID del día donde se guardará (ej. 'day1')
   */
  const importSharedRoutine = async (sharedId, targetDayId) => {
    if (!user || !db) return false;
    try {
      const sharedRef = doc(db, 'artifacts', appId, 'shared_routines', sharedId);
      const sharedSnap = await getDoc(sharedRef);

      if (!sharedSnap.exists()) {
        setError("La rutina compartida no existe");
        return false;
      }

      const routineData = sharedSnap.data();
      // Limpiar metadatos de compartido antes de guardar
      const { originalAuthor, originalName, sharedAt, ...cleanData } = routineData;
      
      // Guardar en la colección del usuario
      await saveRoutine(targetDayId, {
        ...cleanData,
        title: `${cleanData.title} (Importada)`
      });
      
      return true;
    } catch (err) {
      console.error("Error importing routine:", err);
      setError("Error importando la rutina");
      return false;
    }
  };

  return { routines, loading, error, saveRoutine, shareRoutine, importSharedRoutine };
};
