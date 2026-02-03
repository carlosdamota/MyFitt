import {
  NutritionLogSchema,
  GeneratedRoutineSchema,
  type NutritionLog,
  type GeneratedRoutine,
  type UserProfile,
} from "../schemas/gemini";

const GEMINI_MODEL = "gemini-3-flash-preview";

// Declare global variable injected at runtime
declare const __gemini_api_key: string | undefined;

const API_KEY: string =
  typeof __gemini_api_key !== "undefined"
    ? __gemini_api_key
    : (import.meta.env.VITE_GEMINI_API_KEY as string) || "";

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

export const callGeminiAPI = async (
  prompt: string,
  systemInstruction: string = "",
  maxRetries: number = 5,
): Promise<string> => {
  if (!API_KEY) {
    console.warn("Gemini API Key no encontrada.");
    throw new Error("API Key de Gemini no configurada.");
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
  };

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 429 && attempt < maxRetries - 1) {
        // Aumentar el backoff: (2^attempt * 2000ms) + random
        const delay = Math.pow(2, attempt) * 2000 + Math.random() * 1000;
        console.warn(`Hit rate limit. Retrying in ${Math.round(delay)}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(
            "El servidor de IA está ocupado (Límite de peticiones). Por favor, espera un momento.",
          );
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GeminiResponse = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) return text;
      throw new Error("Respuesta del modelo vacía o estructura inesperada.");
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      if (attempt === maxRetries - 1) {
        if (error instanceof Error && error.message.includes("Límite de peticiones")) {
          throw error;
        }
        throw new Error("Error al comunicarse con el modelo Gemini.");
      }
    }
  }

  throw new Error("Error al comunicarse con el modelo Gemini.");
};

export const parseNutritionLog = async (text: string): Promise<NutritionLog> => {
  const systemPrompt = `Eres un nutricionista experto. Tu tarea es analizar el texto de entrada (que describe una comida) y estimar las calorías y macronutrientes.
    Devuelve SOLAMENTE un objeto JSON válido con la siguiente estructura, sin markdown ni explicaciones adicionales:
    {
        "food": "Nombre corto y descriptivo de la comida",
        "calories": número (kcal estimadas),
        "protein": número (gramos estimados),
        "carbs": número (gramos estimados),
        "fats": número (gramos estimados),
        "mealType": "breakfast" | "lunch" | "dinner" | "snack" (inferido del contexto o hora del día, por defecto snack)
    }`;

  const userPrompt = `Analiza esta comida: "${text}"`;

  try {
    const responseText = await callGeminiAPI(userPrompt, systemPrompt);
    // Clean possible markdown code blocks
    const cleanJson = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(cleanJson);

    // Validate with Zod
    return NutritionLogSchema.parse(parsed);
  } catch (error) {
    console.error("Error parsing nutrition log:", error);
    throw new Error("No se pudo interpretar la comida. Intenta ser más específico.");
  }
};

export const generateRoutine = async (profile: UserProfile): Promise<GeneratedRoutine> => {
  const systemPrompt = `Eres un entrenador personal de élite. Tu tarea es generar una rutina de entrenamiento completa y personalizada basada en el perfil del usuario.
    Devuelve SOLAMENTE un objeto JSON válido con la siguiente estructura (compatible con la app), sin markdown:
    {
        "title": "Nombre creativo de la rutina",
        "focus": "Enfoque principal (ej. Hipertrofia, Fuerza)",
        "mode": "heavy" | "metabolic",
        "weight": "Carga Alta" | "Carga Media",
        "bg": "bg-slate-900",
        "border": "border-slate-800",
        "blocks": [
            {
                "id": 1,
                "rest": 60,
                "exercises": [
                    {
                        "name": "Nombre del ejercicio",
                        "reps": "Rango de reps (ej. 10-12)",
                        "note": "Nota técnica breve",
                        "svg": "dumbbell" | "barbell" | "bodyweight" (tipo de icono sugerido)
                    }
                ]
            }
        ]
    }
    Genera al menos 3 bloques con 1-2 ejercicios cada uno. Adapta el volumen y la selección de ejercicios al nivel, equipo y días disponibles del usuario.`;

  const userPrompt = `Genera una rutina para este perfil:
    - Objetivo: ${profile.goal}
    - Nivel: ${profile.experienceLevel}
    - Días totales por semana: ${profile.totalDays || profile.availableDays}
    - Día actual: ${profile.dayNumber || 1} de ${profile.totalDays || profile.availableDays}
    - Tiempo disponible por sesión: ${profile.dailyTimeMinutes || 60} minutos
    - Equipo: ${profile.equipment}
    - Lesiones: ${profile.injuries || "Ninguna"}
    - Peso/Altura: ${profile.weight}kg / ${profile.height}cm
    
    IMPORTANTE: Adapta el volumen de ejercicios al tiempo disponible (${profile.dailyTimeMinutes || 60} min). Si es el día ${profile.dayNumber || 1} de ${profile.totalDays || profile.availableDays}, distribuye los grupos musculares de forma óptima para una rutina semanal completa.`;

  try {
    const responseText = await callGeminiAPI(userPrompt, systemPrompt);
    const cleanJson = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(cleanJson);

    // Validate with Zod
    return GeneratedRoutineSchema.parse(parsed);
  } catch (error) {
    console.error("Error generating routine:", error);
    throw new Error("No se pudo generar la rutina. Intenta de nuevo.");
  }
};
export const generateFullProgram = async (
  profile: UserProfile,
): Promise<{ programName: string; description: string; days: GeneratedRoutine[] }> => {
  const totalDays = profile.totalDays || profile.availableDays || 3;

  const systemPrompt = `Eres un entrenador personal de élite. Tu tarea es generar un PROGRAMA DE ENTRENAMIENTO COMPLETO de ${totalDays} días para la semana.
    Devuelve SOLAMENTE un objeto JSON válido con la siguiente estructura, sin markdown:
    {
        "programName": "Nombre épico del programa (ej. 'Spartan Strength v1')",
        "description": "Breve descripción del enfoque del programa",
        "days": [
            // Aquí irán ${totalDays} objetos de rutina completos, uno para cada día.
            // Sigue EXACTAMENTE este esquema para cada día:
            {
                "title": "Nombre del día (ej. 'Día 1: Pierna Potencia')",
                "focus": "Enfoque (ej. Fuerza, Hipertrofia)",
                "mode": "heavy" | "metabolic",
                "weight": "Carga Alta" | "Carga Media",
                "bg": "bg-slate-900",
                "border": "border-slate-800",
                "blocks": [ ... ] // Array de bloques con ejercicios
            }
        ]
    }
    
    REGLAS IMPORTANTES:
    1. Debes generar EXACTAMENTE ${totalDays} días de entrenamiento.
    2. Distribuye los grupos musculares lógicamente durante la semana.
    3. Cada día debe tener al menos 3 bloques de ejercicios.
    4. Adapta el volumen al tiempo disponible: ${profile.dailyTimeMinutes || 60} min.`;

  const userPrompt = `Genera un programa de ${totalDays} días para este perfil:
    - Objetivo: ${profile.goal}
    - Nivel: ${profile.experienceLevel}
    - Equipo: ${profile.equipment}
    - Lesiones: ${profile.injuries || "Ninguna"}
    
    Asegúrate de que haya buena variedad y progresión entre los días.`;

  try {
    const responseText = await callGeminiAPI(userPrompt, systemPrompt);
    const cleanJson = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(cleanJson);

    // Validate structure (check if it has days array)
    if (!parsed.days || !Array.isArray(parsed.days)) {
      throw new Error("La respuesta no contiene un array de días válido.");
    }

    return parsed;
  } catch (error) {
    console.error("Error generating program:", error);
    throw new Error("No se pudo generar el programa completo.");
  }
};
