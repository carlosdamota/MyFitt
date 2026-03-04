import { useState, useEffect } from "react";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db, appId } from "../config/firebase";
import type { User } from "firebase/auth";
import type { EquipmentOption, AiPersonality } from "../types";

export interface UserProfile {
  weight: string | number;
  height: string | number;
  age: string | number;
  gender: "male" | "female" | "other";
  experienceLevel: "beginner" | "intermediate" | "advanced";
  goal: "muscle_gain" | "fat_loss" | "strength" | "endurance";
  availableDays: number;
  dailyTimeMinutes: number;
  equipment: EquipmentOption[];
  dietType: "balanced" | "keto" | "paleo" | "high_protein" | "low_carb";
  injuries: string;
  onboardingCompleted?: boolean;
  activeRoutineId?: string;
  coachPersonality?: AiPersonality;
  nutritionPersonality?: AiPersonality;
  updatedAt?: string;
  strava?: {
    linked: boolean;
    athleteId?: number;
    athleteName?: string;
  };
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
  equipment: ["gym_full"],
  dietType: "balanced",
  injuries: "",
  onboardingCompleted: false,
  activeRoutineId: undefined,
  coachPersonality: "motivador",
  nutritionPersonality: "motivador",
};

const normalizeEquipment = (value: unknown): EquipmentOption[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is EquipmentOption => typeof item === "string");
  }
  if (typeof value === "string" && value) {
    return [value as EquipmentOption];
  }
  return defaultProfile.equipment;
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

    // Reset loading state when user changes to avoid a micro-frame
    // where loading=false + profile=null causes onboarding to flash
    setLoading(true);
    setProfile(null);

    const profileRef = doc(db, "artifacts", appId, "users", user.uid, "app_data", "profile");

    const unsubscribe = onSnapshot(
      profileRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as Partial<UserProfile>;

          // Auto-migrate legacy accounts missing personality fields
          const patch: Record<string, string> = {};
          if (!data.coachPersonality) patch.coachPersonality = defaultProfile.coachPersonality!;
          if (!data.nutritionPersonality)
            patch.nutritionPersonality = defaultProfile.nutritionPersonality!;

          if (Object.keys(patch).length > 0) {
            setDoc(profileRef, patch, { merge: true }).catch((e) =>
              console.warn("[useProfile] Auto-migration failed:", e),
            );
          }

          setProfile({
            ...defaultProfile,
            ...data,
            ...patch, // Apply patch immediately so UI reflects it
            equipment: normalizeEquipment(data.equipment),
          });
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
      const cleanData = Object.fromEntries(
        Object.entries(profileData).filter(([_, v]) => v !== undefined),
      ) as Partial<UserProfile>;

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
