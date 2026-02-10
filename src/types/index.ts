// Shared types for the FitForge application
import type { User } from "firebase/auth";

// Re-export Firebase User type for convenience
export type { User } from "firebase/auth";

// ============================================
// Routine Types
// ============================================

export interface Exercise {
  name: string;
  reps: string;
  note?: string;
  svg?: string;
  svg_icon?: string;
  muscleGroup?: string;
}

export interface RoutineBlock {
  id: string | number;
  rest: number;
  exercises: Exercise[];
}

export interface Warmup {
  type?: string;
  text: string;
}

export interface Cooldown {
  text: string;
}

export interface Routine {
  title: string;
  focus: string;
  mode: "heavy" | "light" | "metabolic";
  weight: string;
  color?: string;
  bg: string;
  border: string;
  warmup?: Warmup;
  cooldown?: Cooldown;
  blocks: RoutineBlock[];
  programId?: string;
  active?: boolean;
  createdAt?: string;
  goal?: string;
  totalDays?: number;
  dayNumber?: number;
  isDefault?: boolean;
}

export type RoutineData = Record<string, Routine>;

// ============================================
// Workout Log Types
// ============================================

export interface WorkoutLogEntry {
  date: string;
  weight?: number;
  reps?: number;
  sets?: number;
  notes?: string;
  [key: string]: unknown;
}

export type WorkoutLogs = Record<string, WorkoutLogEntry[]>;

// ============================================
// Nutrition Types
// ============================================

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface Ingredient {
  name: string;
  amount: string;
  cal: number;
  p: number;
  c: number;
  f: number;
}

export interface NutritionLogEntry {
  id: string;
  food: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  mealType: MealType;
  date: string;
  ingredients?: Ingredient[];
}

export interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

// ============================================
// Cookie Consent Types
// ============================================

export interface CookieConsent {
  essential: boolean;
  analytics: boolean;
}

// ============================================
// Rate Limit Types
// ============================================

export interface RateLimitData {
  count: number;
  resetAt: string;
  lastAction: string | null;
}

// ============================================
// User Profile Types
// ============================================

export type EquipmentOption =
  | "gym_full"
  | "home_gym"
  | "dumbbells_only"
  | "bodyweight"
  | "barbell_plates"
  | "pullup_bar"
  | "resistance_bands"
  | "bench"
  | "kettlebells";

export interface ProfileFormData {
  weight: string;
  height: string;
  age: string;
  gender: "male" | "female" | "other";
  dietType: "balanced" | "keto" | "paleo" | "high_protein" | "low_carb";
  goal: "muscle_gain" | "fat_loss" | "strength" | "endurance";
  experienceLevel: "beginner" | "intermediate" | "advanced";
  availableDays: number;
  dailyTimeMinutes: number;
  equipment: EquipmentOption[];
  injuries: string;
}

export interface UserProfile extends ProfileFormData {
  activeRoutineId?: string;
}
