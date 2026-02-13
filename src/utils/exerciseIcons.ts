import { EXERCISE_ICON_KEYS } from "../components/icons/ExerciseIcons";

/**
 * Tries to find the best matching icon for a given exercise name.
 * It uses a set of keywords mapped to the available icon keys.
 */
export const getExerciseIcon = (
  exerciseName: string,
  explicitIcon?: string,
): string | undefined => {
  // 1. If an explicit icon is provided and it exists in our registry, use it.
  if (explicitIcon && EXERCISE_ICON_KEYS.includes(explicitIcon)) {
    return explicitIcon;
  }

  // 2. Normalize the name for searching
  const lowerName = exerciseName.toLowerCase();

  // 3. Define keyword mappings to icon keys
  // The order matters slightly: specific matches should come before generic ones if overlapping.
  const keywordMap: Array<{ keywords: string[]; icon: string }> = [
    // --- LEGS ---
    { keywords: ["goblet", "copa"], icon: "goblet_squat" },
    { keywords: ["sentadilla", "squat"], icon: "goblet_squat" }, // Generic squat fallback
    { keywords: ["zancada", "lunge", "bulgara", "split"], icon: "side_squat" }, // Side squat as generic lunge/leg unilateral
    { keywords: ["puente", "glute", "hip thrust", "cadera"], icon: "glute_bridge" },
    { keywords: ["peso muerto", "deadlift", "rumano", "rdl"], icon: "rdl" },
    { keywords: ["gemelo", "calf", "sóleo", "soleo", "talones"], icon: "calf_raise_bilateral" },
    { keywords: ["prensa", "leg press"], icon: "goblet_squat" }, // Fallback for leg press
    { keywords: ["curl femoral", "leg curl", "femoral"], icon: "rdl" }, // Fallback for hamstring curl

    // --- PUSH (Chest/Shoulders/Triceps) ---
    { keywords: ["flexion", "push up", "pushup", "fondo"], icon: "pushup_feet_elevated" },
    { keywords: ["press banca", "bench press", "pecho", "chest press"], icon: "floor_press" },
    { keywords: ["militar", "hombro", "shoulder", "overhead", "press"], icon: "shoulder_press" },
    { keywords: ["elevacion", "lateral", "pajaro", "fly", "deltoid"], icon: "lateral_raise" },
    { keywords: ["tricep", "copa", "frances", "extension"], icon: "tricep_extension" },
    { keywords: ["face pull", "cara"], icon: "face_pull" },

    // --- PULL (Back/Biceps) ---
    { keywords: ["dominada", "pull up", "chin up", "jalon", "lat pulldown"], icon: "pullup" },
    { keywords: ["remo", "row", "serrucho"], icon: "one_arm_row" },
    { keywords: ["bicep", "curl", "martillo", "hammer"], icon: "bicep_curl" },

    // --- CORE ---
    { keywords: ["plancha", "plank", "isometrico"], icon: "plank" },
    { keywords: ["dead bug", "bicho muerto"], icon: "deadbug" },
    {
      keywords: ["leg raise", "elevacion piernas", "piernas", "abdominal", "crunch", "sit up"],
      icon: "leg_raise",
    },
  ];

  // 4. Search for keywords
  for (const entry of keywordMap) {
    if (entry.keywords.some((keyword) => lowerName.includes(keyword))) {
      return entry.icon;
    }
  }

  // 5. Check if the name itself contains an icon key (e.g. "My Plank Exercise" -> matches "plank")
  const directMatch = EXERCISE_ICON_KEYS.find((key) => lowerName.includes(key.replace(/_/g, " ")));
  if (directMatch) return directMatch;

  // 6. Return undefined to let the component show the default fallback (Dumbbell)
  return undefined;
};
