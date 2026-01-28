export const routineData = {
  day1: {
    title: "Día 1: Torso Global",
    focus: "Pecho, Espalda, Hombro",
    mode: "heavy",
    weight: "FUERZA",
    color: "text-blue-400",
    bg: "bg-blue-900/20",
    border: "border-blue-900/50",
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
  day2: {
    title: "Día 2: Core & Runner",
    focus: "Abdomen, Glúteo, Movilidad",
    mode: "light",
    weight: "RUNNING",
    color: "text-amber-400",
    bg: "bg-amber-900/20",
    border: "border-amber-900/50",
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
            name: "Dead Bug (Bicho Muerto)",
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
  day3: {
    title: "Día 3: Piernas Express",
    focus: "Cuádriceps, Femoral, Sóleo",
    mode: "heavy",
    weight: "PESADO",
    color: "text-red-400",
    bg: "bg-red-900/20",
    border: "border-red-900/50",
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
            name: "Sentadilla Goblet (Copa)",
            reps: "3x 12-15",
            note: "Mancuerna al pecho. Baja profundo.",
            svg: "goblet_squat",
          },
          {
            name: "Peso Muerto Rumano (Mancuernas)",
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
            name: "Elevación Talones (2 piernas)",
            reps: "3x 15-20",
            note: "Sube rápido, BAJA EN 3 SEGUNDOS.",
            svg: "calf_raise_bilateral",
          },
          {
            name: "Sóleo Sentado (2 piernas)",
            reps: "3x 20-25",
            note: "Pesas en rodillas. Pausa arriba.",
            svg: "seated_calf_raise",
          },
        ],
      },
    ],
  },
  day4: {
    title: "Día 4: Espalda Postura",
    focus: "Corrección Postural, Hombro Post",
    mode: "light",
    weight: "POSTURA",
    color: "text-green-400",
    bg: "bg-green-900/20",
    border: "border-green-900/50",
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
            name: "Remo Pájaro (Rear Delt)",
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
  day5: {
    title: "Día 5: Brazos (Opcional)",
    focus: "Bíceps, Tríceps, Hombro",
    mode: "light",
    weight: "PLAYERO",
    color: "text-purple-400",
    bg: "bg-purple-900/20",
    border: "border-purple-900/50",
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
            name: "Elevación de Piernas (Core)",
            reps: "3x 15",
            note: "Extra abdomen.",
            svg: "leg_raise",
          },
        ],
      },
    ],
  },
};
