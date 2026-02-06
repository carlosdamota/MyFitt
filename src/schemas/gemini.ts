import { z } from "zod";

// Schema for meal type
export const MealTypeSchema = z.enum(["breakfast", "lunch", "dinner", "snack"]);
export type MealType = z.infer<typeof MealTypeSchema>;

// Schema for nutrition log response from Gemini
export const NutritionLogSchema = z.object({
  food: z.string().describe("Short, descriptive name of the meal"),
  calories: z.number().positive().describe("Estimated kcal"),
  protein: z.number().nonnegative().describe("Estimated grams of protein"),
  carbs: z.number().nonnegative().describe("Estimated grams of carbs"),
  fats: z.number().nonnegative().describe("Estimated grams of fats"),
  mealType: MealTypeSchema,
});
export type NutritionLog = z.infer<typeof NutritionLogSchema>;
export const ExerciseSchema = z.object({
  name: z.string(),
  reps: z.string().describe('Rep range, e.g., "10-12"'),
  note: z.string().optional(),
  svg: z.enum(["dumbbell", "barbell", "bodyweight"]).optional(),
  svg_icon: z
    .string()
    .optional()
    .describe("A simple, minimalist SVG string representing the exercise"),
});
export type Exercise = z.infer<typeof ExerciseSchema>;

export const RoutineBlockSchema = z.object({
  id: z.number(),
  rest: z.number().default(60),
  exercises: z.array(ExerciseSchema).min(1),
});
export type RoutineBlock = z.infer<typeof RoutineBlockSchema>;

// Schema for a generated routine from Gemini
export const GeneratedRoutineSchema = z.object({
  title: z.string(),
  focus: z.string(),
  mode: z.enum(["heavy", "metabolic"]),
  weight: z.enum(["Carga Alta", "Carga Media"]),
  bg: z.string().default("bg-slate-900"),
  border: z.string().default("border-slate-800"),
  blocks: z.array(RoutineBlockSchema).min(1),
});
export type GeneratedRoutine = z.infer<typeof GeneratedRoutineSchema>;

export const GeneratedProgramSchema = z.object({
  programName: z.string(),
  description: z.string(),
  days: z.array(GeneratedRoutineSchema),
});
export type GeneratedProgram = z.infer<typeof GeneratedProgramSchema>;

// Schema for user profile used to generate routines
export const UserProfileSchema = z.object({
  goal: z.string(),
  experienceLevel: z.string(),
  totalDays: z.number().optional(),
  availableDays: z.number().optional(),
  dayNumber: z.number().optional(),
  dailyTimeMinutes: z.number().optional(),
  equipment: z.union([z.string(), z.array(z.string())]),
  injuries: z.string().optional(),
  weight: z.number(),
  height: z.number(),
  age: z.number().optional(),
  gender: z.string().optional(),
  dietType: z.string().optional(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;
