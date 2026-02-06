import {
  NutritionLogSchema,
  GeneratedRoutineSchema,
  type NutritionLog,
  type GeneratedRoutine,
  type UserProfile,
} from "../schemas/gemini";
import { callAI, AiError } from "./ai";

const cleanJsonText = (text: string): string =>
  text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

export const parseNutritionLog = async (text: string): Promise<NutritionLog> => {
  try {
    const response = await callAI("nutrition_parse", { log: text });
    const cleanJson = cleanJsonText(response.text);
    const parsed = JSON.parse(cleanJson);

    // Validate with Zod
    return NutritionLogSchema.parse(parsed);
  } catch (error) {
    console.error("Error parsing nutrition log:", error);
    if (error instanceof AiError) throw error;
    throw new Error("No se pudo interpretar la comida. Intenta ser más específico.");
  }
};

export const generateRoutine = async (profile: UserProfile): Promise<GeneratedRoutine> => {
  try {
    const response = await callAI("routine_program", {
      profile,
      totalDays: 1,
    });
    const cleanJson = cleanJsonText(response.text);
    const parsed = JSON.parse(cleanJson);
    const firstDay = parsed?.days?.[0];
    return GeneratedRoutineSchema.parse(firstDay);
  } catch (error) {
    console.error("Error generating routine:", error);
    if (error instanceof AiError) throw error;
    throw new Error("No se pudo generar la rutina. Intenta de nuevo.");
  }
};
export const generateFullProgram = async (
  profile: UserProfile,
): Promise<{ programName: string; description: string; days: GeneratedRoutine[] }> => {
  const totalDays = profile.totalDays || profile.availableDays || 3;

  try {
    const response = await callAI("routine_program", {
      profile,
      totalDays,
    });
    const cleanJson = cleanJsonText(response.text);
    const parsed = JSON.parse(cleanJson);

    // Validate structure (check if it has days array)
    if (!parsed.days || !Array.isArray(parsed.days)) {
      throw new Error("La respuesta no contiene un array de días válido.");
    }

    return parsed;
  } catch (error) {
    console.error("Error generating program:", error);
    if (error instanceof AiError) throw error;
    throw new Error("No se pudo generar el programa completo.");
  }
};
