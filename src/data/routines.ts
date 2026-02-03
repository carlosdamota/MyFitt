import type { Routine, RoutineData } from "../types";

export const routineData: RoutineData = {
  // ==========================================
  // PROGRAMA 1: RUTINA BASE (5 DÍAS) - "La original"
  // ==========================================
  default_base_day1: {
    title: "Día 1: Torso Global",
    focus: "Pecho, Espalda, Hombro",
    mode: "heavy",
    weight: "FUERZA",
    color: "text-blue-400",
    bg: "bg-blue-900/20",
    border: "border-blue-900/50",
    programId: "default_base_5",
    totalDays: 5,
    dayNumber: 1,
    isDefault: true,
    warmup: { type: "push", text: "5 min Bici + Dislocaciones + Rotaciones de hombros" },
    cooldown: { text: "Estiramiento Pectoral en marco puerta + Colgarse de barra (Dorsal)" },
    blocks: [
      {
        id: "A (Empuje)",
        rest: 90,
        exercises: [
          {
            name: "Press de Banca Suelo",
            reps: "3x 8-10",
            note: "Pesado. Controla bajada.",
            svg: "floor_press",
          },
          {
            name: "Flexiones Pies Elevados",
            reps: "3x Fallo",
            note: "Core tenso.",
            svg: "pushup_feet_elevated",
          },
        ],
      },
      {
        id: "B (Tracción)",
        rest: 90,
        exercises: [
          {
            name: "Dominadas (o Supinas)",
            reps: "3x Fallo",
            note: "Rango completo.",
            svg: "pullup",
          },
          {
            name: "Remo con Mancuerna",
            reps: "3x 10-12",
            note: "Sin dolor de hombro.",
            svg: "one_arm_row",
          },
        ],
      },
    ],
  },
  default_base_day2: {
    title: "Día 2: Core & Runner",
    focus: "Abdomen, Glúteo, Movilidad",
    mode: "light",
    weight: "RUNNING",
    color: "text-amber-400",
    bg: "bg-amber-900/20",
    border: "border-amber-900/50",
    programId: "default_base_5",
    totalDays: 5,
    dayNumber: 2,
    isDefault: true,
    warmup: {
      type: "legs",
      text: "Movilidad de cadera (World's Greatest Stretch) + 20 Jumping Jacks",
    },
    cooldown: { text: "Estiramiento Flexores Cadera (Zancada) + Gemelo + Perro Boca Abajo" },
    blocks: [
      {
        id: "A (Core Blindado)",
        rest: 60,
        exercises: [
          {
            name: "Plancha Abdominal",
            reps: "3x 45-60s",
            note: "Aprieta glúteo y abdomen.",
            svg: "plank",
          },
          {
            name: "Dead Bug",
            reps: "3x 12-15",
            note: "Espalda baja pegada al suelo.",
            svg: "deadbug",
          },
        ],
      },
      {
        id: "B (Motor Runner)",
        rest: 60,
        exercises: [
          {
            name: "Puente de Glúteo",
            reps: "3x 15-20",
            note: "Sube cadera, aprieta culo.",
            svg: "glute_bridge",
          },
          {
            name: "Sentadilla Lateral",
            reps: "2x 10/lado",
            note: "Movilidad aductores.",
            svg: "side_squat",
          },
        ],
      },
    ],
  },
  default_base_day3: {
    title: "Día 3: Piernas Express",
    focus: "Cuádriceps, Femoral, Sóleo",
    mode: "heavy",
    weight: "PESADO",
    color: "text-red-400",
    bg: "bg-red-900/20",
    border: "border-red-900/50",
    programId: "default_base_5",
    totalDays: 5,
    dayNumber: 3,
    isDefault: true,
    warmup: { type: "legs", text: "5 min Bici (Ritmo medio) + 10 Sentadillas al aire" },
    cooldown: {
      text: "Estiramiento Cuádriceps (Talón al glúteo) + Isquios + Gemelo en pared (45s obligatorios)",
    },
    blocks: [
      {
        id: "A",
        rest: 90,
        exercises: [
          {
            name: "Sentadilla Goblet",
            reps: "3x 12-15",
            note: "Mancuerna al pecho. Baja profundo.",
            svg: "goblet_squat",
          },
          {
            name: "Peso Muerto Rumano",
            reps: "3x 12-15",
            note: "Dos piernas a la vez. Culo atrás.",
            svg: "rdl_bilateral",
          },
        ],
      },
      {
        id: "B (Blindaje Gemelo)",
        rest: 60,
        exercises: [
          {
            name: "Elevación Talones",
            reps: "3x 15-20",
            note: "Sube rápido, BAJA EN 3 SEGUNDOS.",
            svg: "calf_raise_bilateral",
          },
          {
            name: "Sóleo Sentado",
            reps: "3x 20-25",
            note: "Pesas en rodillas. Pausa arriba.",
            svg: "seated_calf_raise",
          },
        ],
      },
    ],
  },
  default_base_day4: {
    title: "Día 4: Espalda Postura",
    focus: "Corrección Postural, Hombro Post",
    mode: "light",
    weight: "POSTURA",
    color: "text-green-400",
    bg: "bg-green-900/20",
    border: "border-green-900/50",
    programId: "default_base_5",
    totalDays: 5,
    dayNumber: 4,
    isDefault: true,
    warmup: { type: "pull", text: "5-8 min Bici + Dislocaciones hombro + Gato-Vaca" },
    cooldown: { text: "Estiramiento Cuello suave (Trapecio) + Pectoral + Niño (Child Pose)" },
    blocks: [
      {
        id: "A (Anti-Cifosis)",
        rest: 60,
        exercises: [
          {
            name: "Face Pulls",
            reps: "3x 15-20",
            note: "Tira a la frente. Aguanta 1s.",
            svg: "face_pull",
          },
          {
            name: "Remo Pájaro",
            reps: "3x 15-20",
            note: "Abre brazos en cruz.",
            svg: "rear_delt_fly",
          },
        ],
      },
      {
        id: "B (Detalle)",
        rest: 60,
        exercises: [
          { name: "Curl Martillo", reps: "3x 12-15", note: "Para el codo.", svg: "hammer_curl" },
          {
            name: "Elevaciones Laterales",
            reps: "3x 15-20",
            note: "Codos suben, manos bajan.",
            svg: "lateral_raise",
          },
        ],
      },
    ],
  },
  default_base_day5: {
    title: "Día 5: Brazos (Opcional)",
    focus: "Bíceps, Tríceps, Hombro",
    mode: "light",
    weight: "PLAYERO",
    color: "text-purple-400",
    bg: "bg-purple-900/20",
    border: "border-purple-900/50",
    programId: "default_base_5",
    totalDays: 5,
    dayNumber: 5,
    isDefault: true,
    warmup: { type: "push", text: "Rotaciones muñecas + Flexiones suaves contra pared" },
    cooldown: { text: "Estiramiento Tríceps tras nuca + Antebrazos + Bíceps contra pared" },
    blocks: [
      {
        id: "A",
        rest: 60,
        exercises: [
          { name: "Curl de Bíceps", reps: "3x 12-15", note: "Supinación.", svg: "bicep_curl" },
          {
            name: "Extensión Tríceps",
            reps: "3x 12-15",
            note: "Codo al techo.",
            svg: "tricep_extension",
          },
        ],
      },
      {
        id: "B",
        rest: 60,
        exercises: [
          {
            name: "Press Hombros Sentado",
            reps: "3x 10-12",
            note: "Ligero.",
            svg: "shoulder_press",
          },
          {
            name: "Elevación de Piernas",
            reps: "3x 15",
            note: "Extra abdomen.",
            svg: "leg_raise",
          },
        ],
      },
    ],
  },

  // ==========================================
  // PROGRAMA 2: FULL BODY (3 DÍAS)
  // ==========================================
  default_fb_day1: {
    title: "Día 1: Full Body A",
    focus: "Cuerpo Completo",
    mode: "heavy",
    weight: "FULLBODY",
    color: "text-orange-400",
    bg: "bg-orange-900/20",
    border: "border-orange-900/50",
    programId: "default_fullbody_3",
    totalDays: 3,
    dayNumber: 1,
    isDefault: true,
    warmup: { type: "full", text: "5 min Remo/Bici + Movilidad articular" },
    cooldown: { text: "Estiramiento general" },
    blocks: [
      {
        id: "Principal",
        rest: 120,
        exercises: [
          { name: "Sentadilla (o Goblet)", reps: "3x 8-10", svg: "goblet_squat" },
          { name: "Press Banca (o Flexiones)", reps: "3x 8-10", svg: "pushup" },
          { name: "Remo con Mancuerna", reps: "3x 10-12", svg: "one_arm_row" },
        ],
      },
    ],
  },
  default_fb_day2: {
    title: "Día 2: Full Body B",
    focus: "Cuerpo Completo",
    mode: "heavy",
    weight: "FULLBODY",
    color: "text-orange-400",
    bg: "bg-orange-900/20",
    border: "border-orange-900/50",
    programId: "default_fullbody_3",
    totalDays: 3,
    dayNumber: 2,
    isDefault: true,
    warmup: { type: "full", text: "5 min Remo/Bici + Movilidad articular" },
    cooldown: { text: "Estiramiento general" },
    blocks: [
      {
        id: "Principal",
        rest: 120,
        exercises: [
          { name: "Peso Muerto Rumano", reps: "3x 10-12", svg: "rdl_bilateral" },
          { name: "Press Militar (Mancuernas)", reps: "3x 8-10", svg: "shoulder_press" },
          { name: "Dominadas (o Jalón)", reps: "3x Fallo/12", svg: "pullup" },
        ],
      },
    ],
  },
  default_fb_day3: {
    title: "Día 3: Full Body C",
    focus: "Cuerpo Completo",
    mode: "metabolic",
    weight: "FULLBODY",
    color: "text-orange-400",
    bg: "bg-orange-900/20",
    border: "border-orange-900/50",
    programId: "default_fullbody_3",
    totalDays: 3,
    dayNumber: 3,
    isDefault: true,
    warmup: { type: "full", text: "5 min Remo/Bici + Movilidad articular" },
    cooldown: { text: "Estiramiento general" },
    blocks: [
      {
        id: "Principal",
        rest: 90,
        exercises: [
          { name: "Zancadas (Lunge)", reps: "3x 10/pierna", svg: "lunge" },
          { name: "Fondos (Dips) o Banco", reps: "3x Fallo", svg: "dips" },
          { name: "Face Pulls", reps: "3x 15", svg: "face_pull" },
        ],
      },
    ],
  },

  // ==========================================
  // PROGRAMA 3: TORSO / PIERNA 4 Días
  // ==========================================
  default_ul_day1: {
    title: "Día 1: Torso Fuerza",
    focus: "Pecho, Espalda",
    mode: "heavy",
    weight: "TORSO",
    color: "text-cyan-400",
    bg: "bg-cyan-900/20",
    border: "border-cyan-900/50",
    programId: "default_upperlower_4",
    totalDays: 4,
    dayNumber: 1,
    isDefault: true,
    warmup: { type: "push", text: "Movilidad Hombros + Flexiones" },
    cooldown: { text: "Estiramiento Pectoral y Dorsal" },
    blocks: [
      {
        id: "A",
        rest: 120,
        exercises: [
          { name: "Press Banca", reps: "3x 6-8", svg: "bench_press" },
          { name: "Remo Barra/Mancuerna", reps: "3x 8-10", svg: "barbell_row" },
        ],
      },
    ],
  },
  default_ul_day2: {
    title: "Día 2: Pierna Fuerza",
    focus: "Cuádriceps, Femoral",
    mode: "heavy",
    weight: "PIERNA",
    color: "text-cyan-400",
    bg: "bg-cyan-900/20",
    border: "border-cyan-900/50",
    programId: "default_upperlower_4",
    totalDays: 4,
    dayNumber: 2,
    isDefault: true,
    warmup: { type: "legs", text: "Sentadillas aire + Movilidad Cadera" },
    cooldown: { text: "Estiramiento Cuádriceps e Isquios" },
    blocks: [
      {
        id: "A",
        rest: 120,
        exercises: [
          { name: "Sentadilla", reps: "3x 6-8", svg: "squat" },
          { name: "Peso Muerto Rumano", reps: "3x 8-10", svg: "rdl" },
        ],
      },
    ],
  },
  default_ul_day3: {
    title: "Día 3: Torso Hipertrofia",
    focus: "Hombros, Brazos",
    mode: "metabolic",
    weight: "TORSO",
    color: "text-cyan-400",
    bg: "bg-cyan-900/20",
    border: "border-cyan-900/50",
    programId: "default_upperlower_4",
    totalDays: 4,
    dayNumber: 3,
    isDefault: true,
    warmup: { type: "push", text: "Movilidad Hombros" },
    cooldown: { text: "Estiramiento Brazos" },
    blocks: [
      {
        id: "A",
        rest: 60,
        exercises: [
          { name: "Press Militar", reps: "3x 10-12", svg: "overhead_press" },
          { name: "Chin Ups (Dominadas)", reps: "3x Fallo", svg: "chinup" },
          { name: "Elevaciones Laterales", reps: "3x 15", svg: "lateral_raise" },
        ],
      },
    ],
  },
  default_ul_day4: {
    title: "Día 4: Pierna Hipertrofia",
    focus: "Glúteo, Gemelo",
    mode: "metabolic",
    weight: "PIERNA",
    color: "text-cyan-400",
    bg: "bg-cyan-900/20",
    border: "border-cyan-900/50",
    programId: "default_upperlower_4",
    totalDays: 4,
    dayNumber: 4,
    isDefault: true,
    warmup: { type: "legs", text: "Movilidad Cadera" },
    cooldown: { text: "Estiramiento Glúteo y Gemelo" },
    blocks: [
      {
        id: "A",
        rest: 60,
        exercises: [
          { name: "Prensa (o Zancada)", reps: "3x 12-15", svg: "leg_press" },
          { name: "Curl Femoral", reps: "3x 12-15", svg: "leg_curl" },
          { name: "Gemelo De Pie", reps: "4x 15", svg: "calf_raise" },
        ],
      },
    ],
  },
};
