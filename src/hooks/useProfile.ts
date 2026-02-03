import { useState, useEffect } from "react";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db, appId } from "../config/firebase";
import type { User } from "firebase/auth";

export interface UserProfile {
  weight: string | number;
  height: string | number;
  age: string | number;
  gender: "male" | "female" | "other";
  experienceLevel: "beginner" | "intermediate" | "advanced";
  goal: "muscle_gain" | "fat_loss" | "strength" | "endurance";
  availableDays: number;
  dailyTimeMinutes: number;
  equipment: "gym_full" | "dumbbells_only" | "bodyweight" | "home_gym";
  dietType: "balanced" | "keto" | "paleo" | "high_protein" | "low_carb";
  injuries: string;
  activeRoutineId?: string;
  updatedAt?: string;
}

export interface UseProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  saveProfile: (profileData: Partial<UserProfile>) => Promise<boolean>;
}

const defaultProfile: UserProfile = {
  weight: "",
  height: "",
  age: "",
  gender: "male",
  experienceLevel: "intermediate",
  goal: "muscle_gain",
  availableDays: 3,
  dailyTimeMinutes: 60,
  equipment: "gym_full",
  dietType: "balanced",
  injuries: "",
  activeRoutineId: undefined,
};

export const useProfile = (user: User | null): UseProfileReturn => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !db) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const profileRef = doc(db, "artifacts", appId, "users", user.uid, "app_data", "profile");

    const unsubscribe = onSnapshot(
      profileRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          setProfile(defaultProfile);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching profile:", err);
        setError("Error cargando perfil");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  const saveProfile = async (profileData: Partial<UserProfile>): Promise<boolean> => {
    if (!user || !db) return false;
    try {
      const profileRef = doc(db, "artifacts", appId, "users", user.uid, "app_data", "profile");

      // Filtrar valores undefined ya que Firestore no los soporta
      const cleanData = Object.entries(profileData).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key as keyof UserProfile] = value;
        }
        return acc;
      }, {} as Partial<UserProfile>);

      await setDoc(
        profileRef,
        {
          ...cleanData,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
      return true;
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Error guardando perfil");
      return false;
    }
  };

  return { profile, loading, error, saveProfile };
};
