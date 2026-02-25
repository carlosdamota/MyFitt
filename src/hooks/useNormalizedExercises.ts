import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import type { NormalizedExercise } from "../types";

export const useNormalizedExercises = () => {
  return useQuery({
    queryKey: ["normalized_exercises"],
    queryFn: async () => {
      if (!db) return {};
      const snapshot = await getDocs(collection(db, "normalized_exercises"));
      const exercises: Record<string, NormalizedExercise> = {};
      snapshot.forEach((doc) => {
        exercises[doc.id] = { id: doc.id, ...doc.data() } as NormalizedExercise;
      });
      return exercises;
    },
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours to minimize reads
  });
};
