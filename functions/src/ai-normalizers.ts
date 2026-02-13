export const extractJsonText = (text: string): string => {
  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) return fencedMatch[1].trim();
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1).trim();
  }
  return text.trim();
};

export const parseJsonWithFixes = (text: string) => {
  const cleaned = extractJsonText(text)
    .replace(/\uFEFF/g, "")
    .replace(/,\s*([}\]])/g, "$1");
  return JSON.parse(cleaned);
};

export const normalizeNutritionLog = (value: any) => {
  if (!value || typeof value !== "object") return null;

  let ingredients: Array<Record<string, any>> = [];
  if (Array.isArray(value.ingredients)) {
    ingredients = value.ingredients.map((ing: any) => ({
      name: ing.name ?? "Ingrediente",
      amount: ing.amount ?? ing.quantity ?? "1 ración",
      cal: Number(ing.cal ?? ing.calories ?? 0),
      p: Number(ing.p ?? ing.protein ?? 0),
      c: Number(ing.c ?? ing.carbs ?? 0),
      f: Number(ing.f ?? ing.fats ?? ing.fat ?? 0),
    }));
  }

  if (Array.isArray(value.meals)) {
    const meals = value.meals as Array<Record<string, any>>;
    ingredients = meals.map((meal) => ({
      name: String(meal.name ?? meal.food ?? "Ingrediente").trim(),
      amount: meal.amount ?? "1 ración",
      cal: Number(meal.calories ?? meal.cal ?? 0),
      p: Number(meal.protein ?? meal.p ?? 0),
      c: Number(meal.carbs ?? meal.c ?? 0),
      f: Number(meal.fat ?? meal.fats ?? meal.f ?? 0),
    }));
  }

  if (ingredients.length > 0) {
    const totals = ingredients.reduce(
      (acc, ing) => ({
        calories: acc.calories + ing.cal,
        protein: acc.protein + ing.p,
        carbs: acc.carbs + ing.c,
        fats: acc.fats + ing.f,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 },
    );

    const nameList = ingredients.map((i) => i.name).filter(Boolean);

    return {
      food: value.food ?? (nameList.length > 0 ? nameList.join(", ") : "Comida"),
      calories: totals.calories,
      protein: totals.protein,
      carbs: totals.carbs,
      fats: totals.fats,
      mealType: value.mealType ?? "snack",
      ingredients,
    };
  }

  return {
    food: value.food ?? value.name ?? "Comida",
    calories: value.calories ?? 0,
    protein: value.protein ?? 0,
    carbs: value.carbs ?? 0,
    fats: value.fats ?? value.fat ?? 0,
    mealType: value.mealType ?? "snack",
    ingredients: [],
  };
};

export const buildFallbackProgram = (totalDays: number) => {
  const days = Array.from({ length: totalDays }, (_, index) => ({
    title: `Dia ${index + 1}`,
    focus: "Full body",
    mode: "metabolic",
    weight: "Carga Media",
    bg: "bg-slate-900",
    border: "border-slate-800",
    blocks: [
      {
        id: 1,
        rest: 60,
        exercises: [
          {
            name: "Sentadillas",
            reps: "10-12",
            instructions: [
              "Coloca los pies a la anchura de los hombros.",
              "Baja la cadera hacia atrás y abajo, manteniendo la espalda recta.",
              "Desciende hasta que los muslos estén paralelos al suelo.",
              "Sube empujando con los talones y contrae glúteos al final.",
            ],
          },
        ],
      },
      {
        id: 2,
        rest: 60,
        exercises: [
          {
            name: "Flexiones",
            reps: "10-12",
            instructions: [
              "Colócate en plancha, manos bajo los hombros.",
              "Baja el pecho hasta casi tocar el suelo, codos cerca del cuerpo.",
              "Mantén el cuerpo en línea recta desde la cabeza a los talones.",
              "Empuja el suelo para volver a la posición inicial.",
            ],
          },
        ],
      },
      {
        id: 3,
        rest: 45,
        exercises: [
          {
            name: "Plancha",
            reps: "30-45s",
            instructions: [
              "Apoya los antebrazos y los pies en el suelo.",
              "Mantén el cuerpo recto como una tabla, desde la cabeza a los talones.",
              "Contrae fuertemente abdomen y glúteos para evitar que la cadera caiga.",
              "Respira de forma constante sin perder la tensión.",
            ],
          },
        ],
      },
    ],
  }));
  return {
    programName: "Programa Personalizado",
    description: "Programa generado automaticamente.",
    days,
  };
};

export const normalizeProgram = (value: any, totalDays: number) => {
  const safeValue = typeof value === "object" && value ? value : {};
  const rawDays = Array.isArray(safeValue.days) ? safeValue.days : [];
  const daysBase = rawDays.length > 0 ? rawDays : Array.from({ length: totalDays }, () => ({}));

  const days = daysBase.map((day: any, index: number) => {
    const rawBlocks = Array.isArray(day?.blocks) ? day.blocks : [];
    const blocksBase = rawBlocks.length > 0 ? rawBlocks : [{ id: 1, rest: 60, exercises: [] }];
    const blocks = blocksBase.map((block: any, blockIndex: number) => {
      const rawExercises = Array.isArray(block?.exercises) ? block.exercises : [];
      const exercises = rawExercises.length > 0 ? rawExercises : [{ name: "Sentadillas", reps: "10-12" }];
      return {
        id: block?.id ?? blockIndex + 1,
        rest: block?.rest ?? 60,
        exercises,
      };
    });

    return {
      title: day?.title ?? `Dia ${index + 1}`,
      focus: day?.focus ?? "Full body",
      mode: day?.mode ?? "metabolic",
      weight: day?.weight ?? "Carga Media",
      bg: day?.bg ?? "bg-slate-900",
      border: day?.border ?? "border-slate-800",
      warmup: day?.warmup,
      cooldown: day?.cooldown,
      blocks,
    };
  });

  return {
    programName: safeValue.programName ?? "Programa Personalizado",
    description: safeValue.description ?? "Programa generado automaticamente.",
    days,
  };
};
