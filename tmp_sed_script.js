const fs = require('fs');
let code = fs.readFileSync('src/hooks/useRoutines.ts', 'utf8');

// 1. imports
code = code.replace(
`import { useState, useEffect } from "react";
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
import { db, appId } from "../config/firebase";
import { routineData as defaultRoutineData } from "../data/routines";
import type { User } from "firebase/auth";
import type { Routine, RoutineData } from "../types";`,
`import {
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
import type { Routine, RoutineData } from "../types";`
);

// 2. Fetch useQuery
const oldFetch = `  // Start empty - defaults will be loaded only if user has NO saved routines
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
  }, [user]);`;

const newFetch = `  const queryClient = useQueryClient();

  // 1. Fetch routines using React Query
  const { 
    data: routines = defaultRoutineData, 
    isLoading: loading, 
    error: queryError 
  } = useQuery({
    queryKey: ["routines", user?.uid],
    queryFn: async () => {
      if (!user || !db) return defaultRoutineData;

      const routinesRef = collection(db, "artifacts", appId, "users", user.uid, "routines");
      const q = query(routinesRef, limit(20));
      const querySnapshot = await getDocs(q);

      const userRoutines: RoutineData = {};
      querySnapshot.forEach((docSnap) => {
        userRoutines[docSnap.id] = docSnap.data() as Routine;
      });

      return { ...defaultRoutineData, ...userRoutines };
    },
    // Solo cuando hay usuario y DB (aunque querramos que funcione default)
    // Pero si el queryClient puede devolver la default data, lo ejecutamos igual
  });

  const error = queryError ? "Error cargando rutinas" : null;`;


code = code.replace(oldFetch, newFetch);


fs.writeFileSync('src/hooks/useRoutines.ts', code);
