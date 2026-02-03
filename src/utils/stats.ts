import type { WorkoutLogEntry, RoutineData } from "../types";

// ============================================
// Personal Best Types
// ============================================

interface PersonalBest {
  weight: number;
  reps: number;
  date: string | null;
}

type PBCategory = "low" | "mid" | "high";

export type PersonalBests = Partial<Record<PBCategory, PersonalBest>>;

// ============================================
// Weekly Stats Types
// ============================================

export interface ExerciseStats {
  maxWeight: number;
  totalReps: number;
  totalSets: number;
}

export interface WeeklyStats {
  daysTrained: number;
  trainingDates: string[];
  totalVolume: number;
  previousWeekVolume: number;
  musclesWorked: string[];
  currentWeekExercises: Record<string, ExerciseStats>;
  previousWeekExercises: Record<string, ExerciseStats>;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Helper to identify bodyweight exercises
 */
export const isBodyweightExercise = (name: string): boolean => {
  const bodyweightKeywords = [
    "flexiones",
    "dominadas",
    "fondos",
    "zancadas",
    "burpees",
    "plancha",
    "core",
    "abdominales",
    "l-sit",
    "pino",
    "crunches",
    "leg raises",
    "sentadilla libre",
    "bridge",
  ];
  const lowerName = name.toLowerCase();
  return bodyweightKeywords.some((keyword) => lowerName.includes(keyword));
};

// ============================================
// Main Functions
// ============================================

/**
 * Calcula los Récords Personales (PB) para un ejercicio dado.
 * Clasifica los PBs en tres categorías:
 * - Fuerza: 1-5 repeticiones
 * - Hipertrofia: 6-12 repeticiones
 * - Resistencia: 12+ repeticiones
 */
export const calculatePersonalBests = (logs: WorkoutLogEntry[]): PersonalBests | null => {
  if (!logs || logs.length === 0) return null;

  const pbs: Record<PBCategory, PersonalBest> = {
    low: { weight: 0, reps: 0, date: null }, // 1-5 reps
    mid: { weight: 0, reps: 0, date: null }, // 6-12 reps
    high: { weight: 0, reps: 0, date: null }, // 12+ reps
  };

  logs.forEach((log) => {
    const weight = parseFloat(String(log.weight ?? 0));
    const reps = parseInt(String(log.reps ?? 0));

    if (isNaN(weight) || isNaN(reps)) return;

    // Categorizar por rango de repeticiones
    let category: PBCategory | null = null;
    if (reps >= 1 && reps <= 5) category = "low";
    else if (reps >= 6 && reps <= 12) category = "mid";
    else if (reps > 12) category = "high";

    if (category) {
      // Verificar si es un nuevo récord de peso
      const currentBest = pbs[category];

      if (
        weight > currentBest.weight ||
        (weight === currentBest.weight && reps > currentBest.reps)
      ) {
        pbs[category] = {
          weight,
          reps,
          date: log.date,
        };
      }
    }
  });

  // Limpiar categorías vacías
  const result: PersonalBests = {};
  (Object.keys(pbs) as PBCategory[]).forEach((key) => {
    if (pbs[key].weight > 0) {
      result[key] = pbs[key];
    }
  });

  return Object.keys(result).length > 0 ? result : null;
};

/**
 * Verifica si un nuevo set es un Récord Personal.
 */
export const isNewRecord = (
  newSet: { weight: number | string; reps: number | string },
  currentPbs: PersonalBests | null,
): boolean => {
  if (!currentPbs) return true; // Si no hay historia, es récord

  const weight = parseFloat(String(newSet.weight));
  const reps = parseInt(String(newSet.reps));

  let category: PBCategory | null = null;
  if (reps >= 1 && reps <= 5) category = "low";
  else if (reps >= 6 && reps <= 12) category = "mid";
  else if (reps > 12) category = "high";

  if (!category) return false;

  const currentBest = currentPbs[category];

  // Si no hay récord en esta categoría, es nuevo récord
  if (!currentBest) return true;

  // Comparar
  if (weight > currentBest.weight) return true;
  if (weight === currentBest.weight && reps > currentBest.reps) return true;

  return false;
};

/**
 * Calcula estadísticas semanales para el reporte de IA.
 */
export const getWeeklyStats = (
  logs: Record<string, WorkoutLogEntry[]>,
  routineData: RoutineData | null,
  userWeightStr: string | number,
): WeeklyStats => {
  const now = new Date();
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(now.getDate() - 7);
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(now.getDate() - 14);

  const userWeight = parseFloat(String(userWeightStr)) || 70;

  const currentWeekDays = new Set<string>();
  let totalVolume = 0;
  let previousWeekVolume = 0;
  const musclesWorked = new Set<string>();

  // Almacenar detalles de ejercicios para comparación
  const currentExercises: Record<string, ExerciseStats> = {};
  const previousExercises: Record<string, ExerciseStats> = {};

  // Mapa auxiliar ejercicio -> musculo
  const exerciseToMuscle: Record<string, string> = {};
  if (routineData) {
    Object.values(routineData).forEach((day) => {
      if (day.blocks) {
        day.blocks.forEach((block) => {
          block.exercises.forEach((ex) => {
            exerciseToMuscle[ex.name] = (ex as { muscleGroup?: string }).muscleGroup || "Otros";
          });
        });
      }
    });
  }

  Object.entries(logs).forEach(([exName, exLogs]) => {
    exLogs.forEach((log) => {
      const logDate = new Date(log.date);
      const weight = parseFloat(String(log.weight ?? 0)) || 0;
      const reps = parseInt(String(log.reps ?? 0)) || 0;
      const sets = parseInt(String(log.sets ?? 1)) || 1;

      // Si el peso es 0 y es de calistenia, usamos 1 para contar repeticiones como volumen base
      // Esto evita que el peso corporal infle artificialmente el tonelaje
      const effectiveWeight = weight === 0 && isBodyweightExercise(exName) ? 1 : weight;
      const volume = effectiveWeight * reps * sets;

      if (logDate >= oneWeekAgo) {
        // Esta semana
        currentWeekDays.add(logDate.toDateString());
        totalVolume += volume;

        if (!currentExercises[exName]) {
          currentExercises[exName] = { maxWeight: 0, totalReps: 0, totalSets: 0 };
        }
        currentExercises[exName].maxWeight = Math.max(currentExercises[exName].maxWeight, weight);
        currentExercises[exName].totalReps += reps * sets;
        currentExercises[exName].totalSets += sets;

        if (exerciseToMuscle[exName]) {
          musclesWorked.add(exerciseToMuscle[exName]);
        }
      } else if (logDate >= twoWeeksAgo && logDate < oneWeekAgo) {
        // Semana anterior
        previousWeekVolume += volume;

        if (!previousExercises[exName]) {
          previousExercises[exName] = { maxWeight: 0, totalReps: 0, totalSets: 0 };
        }
        previousExercises[exName].maxWeight = Math.max(previousExercises[exName].maxWeight, weight);
        previousExercises[exName].totalReps += reps * sets;
        previousExercises[exName].totalSets += sets;
      }
    });
  });

  return {
    daysTrained: currentWeekDays.size,
    trainingDates: Array.from(currentWeekDays).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime(),
    ),
    totalVolume,
    previousWeekVolume,
    musclesWorked: Array.from(musclesWorked),
    currentWeekExercises: currentExercises,
    previousWeekExercises: previousExercises,
  };
};
