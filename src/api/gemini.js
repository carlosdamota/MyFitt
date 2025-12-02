const GEMINI_MODEL = "gemini-2.5-flash";
// La clave se provee en runtime o por variable de entorno
const API_KEY = typeof __gemini_api_key !== 'undefined' ? __gemini_api_key : import.meta.env.VITE_GEMINI_API_KEY || "";

export const callGeminiAPI = async (prompt, systemInstruction = "", maxRetries = 5) => {
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
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.status === 429 && attempt < maxRetries - 1) {
                const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const result = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (text) return text;
            throw new Error("Respuesta del modelo vacía o estructura inesperada.");

        } catch (error) {
            console.error(`Attempt ${attempt + 1} failed:`, error);
            if (attempt === maxRetries - 1) throw new Error("Error al comunicarse con el modelo Gemini.");
        }
    }
};
export const parseNutritionLog = async (text) => {
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
        // Limpiar posibles bloques de código markdown
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);
    } catch (error) {
        console.error("Error parsing nutrition log:", error);
        throw new Error("No se pudo interpretar la comida. Intenta ser más específico.");
    }
};

export const generateRoutine = async (profile) => {
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
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);
    } catch (error) {
        console.error("Error generating routine:", error);
        throw new Error("No se pudo generar la rutina. Intenta de nuevo.");
    }
};
