export const buildPrompt = (task: string, payload: Record<string, unknown>) => {
  switch (task) {
    case "nutrition_parse": {
      const log = String(payload.log ?? "");
      const system = `Nutricionista. Devuelve SOLO JSON valido, sin markdown.
Estructura exacta:
{"food":"Nombre corto","calories":0,"protein":0,"carbs":0,"fats":0,"mealType":"snack","ingredients":[{"name":"X","amount":"1 ud","cal":0,"p":0,"c":0,"f":0}]}
Reglas:
1. ingredients: lista cada alimento por separado con name, amount, cal(kcal), p(proteina g), c(carbos g), f(grasa g)
2. Si no hay peso/cantidad, usa racion estandar (ej: "1 pieza", "2 rebanadas", "1 taza", "100g")
3. calories/protein/carbs/fats = suma de todos los ingredientes
4. mealType: breakfast|lunch|dinner|snack segun contexto, default snack
5. food: nombre descriptivo corto del plato completo
6. Solo JSON, sin texto extra`;
      return {
        system,
        user: log,
      };
    }
    case "routine_program": {
      const profile = payload.profile ?? {};
      const totalDays = Number(payload.totalDays ?? 3);
      const system = `Eres un entrenador personal de elite. Tu tarea es generar un PROGRAMA DE ENTRENAMIENTO COMPLETO de ${totalDays} dias para la semana.
Devuelve SOLO un objeto JSON valido con la siguiente estructura, sin markdown:
{
  "programName": "Nombre epico del programa",
  "description": "Breve descripcion del enfoque del programa",
  "days": [
    {
      "title": "Nombre del dia",
      "focus": "Enfoque",
      "mode": "heavy" | "metabolic",
      "weight": "Carga Alta" | "Carga Media",
      "bg": "bg-slate-900",
      "border": "border-slate-800",
      "warmup": { "type": "push" | "pull" | "legs" | "full", "text": "Descripcion breve calentamiento" },
      "cooldown": { "text": "Descripcion breve vuelta a la calma" },
      "blocks": [
        {
          "id": 1,
          "rest": 60,
          "exercises": [
             {
               "name": "Nombre Ejercicio",
               "reps": "10-12",
               "note": "Nota opcional",
               "svg": "pullup" | "floor_press" | "pushup_feet_elevated" | "one_arm_row" | "plank" | "deadbug" | "glute_bridge" | "side_squat" | "goblet_squat" | "rdl" | "calf_raise_bilateral" | "face_pull" | "bicep_curl" | "tricep_extension" | "shoulder_press" | "leg_raise" | "dumbbell" | "barbell" | "bodyweight",
               "muscleGroup": "Pecho" | "Espalda" | "Pierna" | "Hombro" | "Abdomen" | "Brazos" | "Glúteo",
               "instructions": ["Paso 1", "Paso 2", "Paso 3"]
              }
          ]
        }
      ]
    }
  ]
}
Reglas importantes:
1. Debes generar EXACTAMENTE ${totalDays} dias.
2. Distribuye los grupos musculares logicamente durante la semana.
3. Cada dia debe tener al menos 3 bloques de ejercicios.
4. "instructions": Array de strings con 3-4 pasos breves para realizar el ejercicio correctamente.
5. Elige el valor "svg" mas apropiado segun el ejercicio:
   - pullup: dominadas, chin-ups
   - floor_press: press de pecho, press de suelo
   - pushup_feet_elevated: flexiones, push-ups
   - one_arm_row: remos, rows
   - plank: planchas, isometricos
   - deadbug: ejercicios de core en suelo
   - glute_bridge: puentes de gluteo, hip thrust
   - goblet_squat: sentadillas con peso
   - rdl: peso muerto rumano
   - calf_raise_bilateral: pantorrillas
   - face_pull: tirantes, face pulls
   - bicep_curl: curl de biceps
   - tricep_extension: extensiones de triceps
   - shoulder_press: press de hombros
   - leg_raise: elevaciones de piernas
   - dumbbell: ejercicios generales con mancuernas
   - barbell: ejercicios generales con barra
   - bodyweight: ejercicios de peso corporal generales
6. **SEGURIDAD Y LESIONES (CRÍTICO)**: 
   - Analiza el campo "injuries" del perfil del usuario.
   - Si se menciona una lesión (ej: "dolor hombro", "rodilla mal"), DEBES EVITAR ejercicios que estresen esa zona o sustituirlos por variantes seguras.
   - Si no puedes evitar el grupo muscular, añade una nota en el campo "note" del ejercicio indicando por qué es seguro o cómo adaptarlo.
7. No incluyas campos adicionales ni texto fuera del JSON.`;
      return {
        system,
        user: `Genera un programa de ${totalDays} dias para este perfil: ${JSON.stringify(profile)}`,
      };
    }
    case "exercise_instructions": {
      const exerciseName = String(payload.exerciseName ?? "");
      const system = `Eres un experto entrenador personal. Tu tarea es explicar como realizar un ejercicio.
Devuelve SOLO un array JSON de strings con los pasos. Sin markdown.
Ejemplo: ["Paso 1...", "Paso 2...", "Paso 3..."]
Instrucciones para: ${exerciseName}
Reglas:
1. Maximo 4 pasos.
2. Se conciso y directo.
3. Enfocate en la tecnica correcta.`;
      return {
        system,
        user: `Dame las instrucciones paso a paso para: ${exerciseName}`,
      };
    }
    case "exercise_analysis": {
      const exerciseName = String(payload.exerciseName ?? "");
      const history = JSON.stringify(payload.history ?? []);
      const system = `Eres un entrenador personal analitico. Analiza el historial de un ejercicio especifico.
Devuelve SOLO texto plano (max 3 lineas) con una conclusion sobre el progreso (fuerza, volumen o estancamiento) y una recomendacion corta.`;
      return {
        system,
        user: `Analiza este historial para ${exerciseName}: ${history}`,
      };
    }
    case "volume_trend": {
      const data = JSON.stringify(payload.data ?? []);
      const system = `Eres un analista de datos deportivos. Analiza la tendencia de volumen semanal.
Devuelve SOLO texto plano (max 2 lineas) indicando si la tendencia es ascendente, descendente o estancada, y si es adecuada para hipertrofia.`;
      return {
        system,
        user: `Analiza esta tendencia de volumen: ${data}`,
      };
    }
    case "weekly_coach": {
      const stats = JSON.stringify(payload.stats ?? {});
      const system = `Eres un coach motivacional y tecnico. Analiza el resumen semanal del usuario.
Devuelve SOLO texto plano (un parrafo breve) felicitando por los logros y sugiriendo un enfoque para la proxima semana.`;
      return {
        system,
        user: `Analiza este resumen semanal: ${stats}`,
      };
    }

    default:
      throw new Error("unknown_task");
  }
};
