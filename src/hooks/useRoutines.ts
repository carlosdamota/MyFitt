import { useState, useEffect } from "react";

import {
  collection,
  getDocs,
  setDoc,
  doc,
  query,
  addDoc,
  getDoc,
  limit,
  deleteDoc,
} from "firebase/firestore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db, appId } from "../config/firebase";
import { routineData as defaultRoutineData } from "../data/routines";
import type { User } from "firebase/auth";
import type { Routine, RoutineData } from "../types";

export interface UseRoutinesReturn {
  routines: RoutineData;
  loading: boolean;
  error: string | null;
  saveRoutine: (routineId: string, routineData: Routine) => Promise<boolean | undefined>;
  createRoutine: (routineName: string, routineData: Routine) => Promise<string | null>;
  deleteRoutine: (routineId: string) => Promise<boolean>;
  shareRoutine: (routineId: string, routineData: Routine) => Promise<string | null>;
  importSharedRoutine: (sharedId: string, targetDayId: string) => Promise<boolean>;
}

export const useRoutines = (user: User | null): UseRoutinesReturn => {
  // Start empty - defaults will be loaded only if user has NO saved routines
  const [routines, setRoutines] = useState<RoutineData>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !db) {
      // No user - show defaults for demo/guest mode
      setRoutines(defaultRoutineData);
      setLoading(false);
      return;
    }

    const fetchRoutines = async (): Promise<void> => {
      try {
        setLoading(true);
        const routinesRef = collection(db!, "artifacts", appId, "users", user!.uid, "routines");
        // Limit to 20 routines (more than enough for a weekly schedule + extras)
        const q = query(routinesRef, limit(20));
        const querySnapshot = await getDocs(q);

        // Always include default routines (isDefault: true) + user's generated routines
        // Defaults cannot be deleted, user routines can
        const userRoutines: RoutineData = {};
        querySnapshot.forEach((docSnap) => {
          userRoutines[docSnap.id] = docSnap.data() as Routine;
        });

        // Merge: defaults first, then user routines (user routines with same ID override defaults)
        setRoutines({ ...defaultRoutineData, ...userRoutines });
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

  const saveRoutine = async (
    routineId: string,
    routineData: Routine,
  ): Promise<boolean | undefined> => {
    if (!user || !db) return;
    try {
      const docRef = doc(db!, "artifacts", appId, "users", user!.uid, "routines", routineId);
      await setDoc(
        docRef,
        {
          ...routineData,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );

      // Actualizar estado local
      setRoutines((prev: RoutineData) => ({
        ...prev,
        [routineId]: routineData,
      }));
      return true;
    } catch (err) {
      console.error("Error saving routine:", err);
      setError("Error guardando la rutina");
      return false;
    }
  };

  const createRoutine = async (
    routineName: string,
    routineData: Routine,
  ): Promise<string | null> => {
    if (!user || !db) return null;
    try {
      const routinesCollection = collection(
        db!,
        "artifacts",
        appId,
        "users",
        user!.uid,
        "routines",
      );
      const newRoutineRef = await addDoc(routinesCollection, {
        ...routineData,
        title: routineName,
        createdAt: new Date().toISOString(),
      });

      const newId = newRoutineRef.id;
      setRoutines((prev: RoutineData) => ({
        ...prev,
        [newId]: { ...routineData, title: routineName },
      }));
      return newId;
    } catch (err) {
      console.error("Error creating routine:", err);
      setError("Error creando rutina");
      return null;
    }
  };

  const deleteRoutine = async (routineId: string): Promise<boolean> => {
    if (!user || !db) return false;

    // Protect default routines from deletion
    const routine = routines[routineId];
    if (routine?.isDefault) {
      console.warn("Cannot delete default routines");
      return false;
    }

    try {
      const docRef = doc(db!, "artifacts", appId, "users", user!.uid, "routines", routineId);
      await deleteDoc(docRef);

      // Eliminación local
      setRoutines((prev: RoutineData) => {
        const updated = { ...prev };
        delete updated[routineId];
        return updated;
      });
      return true;
    } catch (err) {
      console.error("Error deleting routine:", err);
      return false;
    }
  };

  /**
   * Comparte una rutina publicándola en una colección pública.
   */
  const shareRoutine = async (routineId: string, routineData: Routine): Promise<string | null> => {
    if (!user || !db) return null;
    try {
      const sharedRef = collection(db!, "artifacts", appId, "shared_routines");

      const docRef = await addDoc(sharedRef, {
        ...routineData,
        originalAuthor: user!.uid,
        originalName: routineData.title || routineId,
        sharedAt: new Date().toISOString(),
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
   */
  const importSharedRoutine = async (sharedId: string, targetDayId: string): Promise<boolean> => {
    if (!user || !db) return false;
    try {
      const sharedRef = doc(db!, "artifacts", appId, "shared_routines", sharedId);
      const sharedSnap = await getDoc(sharedRef);

      if (!sharedSnap.exists()) {
        setError("La rutina compartida no existe");
        return false;
      }

      const data = sharedSnap.data() as Routine & {
        originalAuthor?: string;
        originalName?: string;
        sharedAt?: string;
      };
      // Limpiar metadatos de compartido antes de guardar
      const { originalAuthor, originalName, sharedAt, ...cleanData } = data;

      // Guardar en la colección del usuario
      await saveRoutine(targetDayId, {
        ...cleanData,
        title: `${cleanData.title} (Importada)`,
      });

      return true;
    } catch (err) {
      console.error("Error importing routine:", err);
      setError("Error importando la rutina");
      return false;
    }
  };

  return {
    routines,
    loading,
    error,
    saveRoutine,
    createRoutine,
    deleteRoutine,
    shareRoutine,
    importSharedRoutine,
  };
};
