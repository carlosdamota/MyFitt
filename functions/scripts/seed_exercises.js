import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read Service Account
let serviceAccount;
try {
  const serviceAccountPath = join(__dirname, "..", "serviceAccount.json");
  const sf = readFileSync(serviceAccountPath, "utf8");
  serviceAccount = JSON.parse(sf);
} catch (error) {
  console.error(
    "❌ No se pudo encontrar o leer el archivo serviceAccount.json en la carpeta functions/",
  );
  process.exit(1);
}

// Initialize Firebase Admin
let app;
try {
  app = initializeApp({
    credential: cert(serviceAccount),
    projectId: "myfitt-5ddf6",
  });
} catch (error) {
  console.log("Could not initialize with service account credentials");
  console.error(error);
  process.exit(1);
}

const db = getFirestore();

// Massive Exercise Catalog
const seedExercises = [
  // ================= PECHO =================
  {
    id: "barbell_bench_press",
    name: "Press de Banca con Barra",
    aliases: ["Bench Press", "Press Plano", "Press de pecho plana"],
    muscleGroup: "Pecho",
    equipment: ["barbell_plates", "bench", "gym_full"],
    svgIcon: "barbell",
  },
  {
    id: "dumbbell_bench_press",
    name: "Press de Banca con Mancuernas",
    aliases: ["Dumbbell Bench Press", "Press con mancuernas", "Press plano mancuernas"],
    muscleGroup: "Pecho",
    equipment: ["dumbbells_only", "bench", "home_gym", "gym_full"],
    svgIcon: "dumbbell",
  },
  {
    id: "incline_barbell_bench_press",
    name: "Press Inclinado con Barra",
    aliases: ["Incline Bench Press", "Press superior barra"],
    muscleGroup: "Pecho",
    equipment: ["barbell_plates", "bench", "gym_full"],
    svgIcon: "barbell",
  },
  {
    id: "incline_dumbbell_bench_press",
    name: "Press Inclinado con Mancuernas",
    aliases: ["Incline Dumbbell Press", "Press superior mancuernas"],
    muscleGroup: "Pecho",
    equipment: ["dumbbells_only", "bench", "home_gym", "gym_full"],
    svgIcon: "dumbbell",
  },
  {
    id: "decline_barbell_bench_press",
    name: "Press Declinado con Barra",
    aliases: ["Decline Bench Press", "Press inferior"],
    muscleGroup: "Pecho",
    equipment: ["barbell_plates", "bench", "gym_full"],
    svgIcon: "barbell",
  },
  {
    id: "cable_crossover",
    name: "Cruces en Polea",
    aliases: ["Cable Crossover", "Aperturas en polea", "Cables pecho"],
    muscleGroup: "Pecho",
    equipment: ["gym_full"],
    svgIcon: "floor_press",
  },
  {
    id: "dumbbell_flyes",
    name: "Aperturas con Mancuernas",
    aliases: ["Dumbbell Flyes", "Aperturas planas", "Cristos"],
    muscleGroup: "Pecho",
    equipment: ["dumbbells_only", "bench", "home_gym", "gym_full"],
    svgIcon: "dumbbell",
  },
  {
    id: "incline_dumbbell_flyes",
    name: "Aperturas Inclinadas",
    aliases: ["Incline Flyes"],
    muscleGroup: "Pecho",
    equipment: ["dumbbells_only", "bench", "home_gym", "gym_full"],
    svgIcon: "dumbbell",
  },
  {
    id: "pec_deck",
    name: "Pec Deck (Máquina)",
    aliases: ["Pec Deck", "Butterfly", "Máquina contractora"],
    muscleGroup: "Pecho",
    equipment: ["gym_full"],
    svgIcon: "floor_press",
  },
  {
    id: "pushups",
    name: "Flexiones Clásicas",
    aliases: ["Pushups", "Lagartijas", "Flexiones de pecho", "Push-ups"],
    muscleGroup: "Pecho",
    equipment: ["bodyweight", "home_gym", "gym_full"],
    svgIcon: "pushup_feet_elevated",
  },
  {
    id: "incline_pushups",
    name: "Flexiones Inclinadas",
    aliases: ["Incline Pushups", "Flexiones con manos elevadas"],
    muscleGroup: "Pecho",
    equipment: ["bodyweight", "bench", "home_gym", "gym_full"],
    svgIcon: "pushup_feet_elevated",
  },
  {
    id: "decline_pushups",
    name: "Flexiones Declinadas",
    aliases: ["Decline Pushups", "Flexiones con pies elevados"],
    muscleGroup: "Pecho",
    equipment: ["bodyweight", "bench", "home_gym", "gym_full"],
    svgIcon: "pushup_feet_elevated",
  },
  {
    id: "chest_dips",
    name: "Fondos en Paralelas (Pecho)",
    aliases: ["Dips", "Chest Dips", "Fondos de pecho", "Paralelas"],
    muscleGroup: "Pecho",
    equipment: ["gym_full", "home_gym"],
    svgIcon: "bodyweight",
  },
  {
    id: "machine_chest_press",
    name: "Press de Pecho en Máquina",
    aliases: ["Machine Chest Press", "Press sentado maquina"],
    muscleGroup: "Pecho",
    equipment: ["gym_full"],
    svgIcon: "floor_press",
  },
  {
    id: "floor_press_barbell",
    name: "Floor Press con Barra",
    aliases: ["Press de suelo con barra", "Barbell floor press"],
    muscleGroup: "Pecho",
    equipment: ["barbell_plates", "gym_full"],
    svgIcon: "floor_press",
  },
  {
    id: "floor_press_dumbbell",
    name: "Floor Press con Mancuernas",
    aliases: ["Press de suelo mancuernas", "Dumbbell floor press"],
    muscleGroup: "Pecho",
    equipment: ["dumbbells_only", "home_gym", "gym_full"],
    svgIcon: "floor_press",
  },

  // ================= ESPALDA =================
  {
    id: "pullups",
    name: "Dominadas Bajas (Pronas)",
    aliases: ["Pullups", "Dominadas abiertas", "Dominada prona"],
    muscleGroup: "Espalda",
    equipment: ["pullup_bar", "home_gym", "gym_full"],
    svgIcon: "pullup",
  },
  {
    id: "chinups",
    name: "Dominadas Supinas",
    aliases: ["Chin-ups", "Chin ups", "Dominadas agarre inverso"],
    muscleGroup: "Espalda",
    equipment: ["pullup_bar", "home_gym", "gym_full"],
    svgIcon: "pullup",
  },
  {
    id: "lat_pulldown",
    name: "Jalón al Pecho",
    aliases: ["Lat Pulldown", "Jalón polea", "Jalón dorsal"],
    muscleGroup: "Espalda",
    equipment: ["gym_full"],
    svgIcon: "pullup",
  },
  {
    id: "close_grip_pulldown",
    name: "Jalón Agarre Estrecho",
    aliases: ["Close Grip Pulldown", "Jalón agarre V"],
    muscleGroup: "Espalda",
    equipment: ["gym_full"],
    svgIcon: "pullup",
  },
  {
    id: "barbell_row",
    name: "Remo con Barra",
    aliases: ["Barbell Row", "Bent over row", "Remo 90"],
    muscleGroup: "Espalda",
    equipment: ["barbell_plates", "gym_full"],
    svgIcon: "barbell",
  },
  {
    id: "dumbbell_row",
    name: "Remo a una Mano",
    aliases: ["Dumbbell Row", "One Arm Row", "Remo mancuerna", "Serrucho"],
    muscleGroup: "Espalda",
    equipment: ["dumbbells_only", "bench", "home_gym", "gym_full"],
    svgIcon: "one_arm_row",
  },
  {
    id: "pendlay_row",
    name: "Remo Pendlay",
    aliases: ["Pendlay Row"],
    muscleGroup: "Espalda",
    equipment: ["barbell_plates", "gym_full"],
    svgIcon: "barbell",
  },
  {
    id: "t_bar_row",
    name: "Remo en Punta (T-Bar)",
    aliases: ["T-Bar Row", "Remo T", "Remo barra T"],
    muscleGroup: "Espalda",
    equipment: ["barbell_plates", "gym_full"],
    svgIcon: "barbell",
  },
  {
    id: "seated_cable_row",
    name: "Remo Gironda (Polea)",
    aliases: ["Seated Cable Row", "Remo sentado"],
    muscleGroup: "Espalda",
    equipment: ["gym_full"],
    svgIcon: "one_arm_row",
  },
  {
    id: "machine_row",
    name: "Remo en Máquina",
    aliases: ["Machine Row"],
    muscleGroup: "Espalda",
    equipment: ["gym_full"],
    svgIcon: "one_arm_row",
  },
  {
    id: "straight_arm_pulldown",
    name: "Pullover en Polea Alta",
    aliases: ["Straight Arm Pulldown", "Jalón brazos rectos"],
    muscleGroup: "Espalda",
    equipment: ["gym_full"],
    svgIcon: "pullup",
  },
  {
    id: "dumbbell_pullover",
    name: "Pullover con Mancuerna",
    aliases: ["Dumbbell Pullover"],
    muscleGroup: "Espalda",
    equipment: ["dumbbells_only", "bench", "home_gym", "gym_full"],
    svgIcon: "dumbbell",
  },
  {
    id: "back_extension",
    name: "Extensiones Lumbares",
    aliases: ["Back Extensions", "Hyperextensions", "Hiperextensiones"],
    muscleGroup: "Espalda",
    equipment: ["gym_full", "home_gym"],
    svgIcon: "bodyweight",
  },
  {
    id: "deadlift",
    name: "Peso Muerto Convencional",
    aliases: ["Deadlift", "Peso muerto"],
    muscleGroup: "Espalda",
    equipment: ["barbell_plates", "gym_full"],
    svgIcon: "barbell",
  },

  // ================= PIERNA =================
  {
    id: "barbell_squat",
    name: "Sentadilla Libre (Barra)",
    aliases: ["Squat", "Back Squat", "Sentadilla TR"],
    muscleGroup: "Pierna",
    equipment: ["barbell_plates", "gym_full"],
    svgIcon: "barbell",
  },
  {
    id: "front_squat",
    name: "Sentadilla Frontal",
    aliases: ["Front Squat", "Sentadilla delantera"],
    muscleGroup: "Pierna",
    equipment: ["barbell_plates", "gym_full"],
    svgIcon: "barbell",
  },
  {
    id: "goblet_squat",
    name: "Sentadilla Copa",
    aliases: ["Goblet Squat", "Sentadilla goblet"],
    muscleGroup: "Pierna",
    equipment: ["dumbbells_only", "kettlebells", "home_gym", "gym_full"],
    svgIcon: "goblet_squat",
  },
  {
    id: "leg_press",
    name: "Prensa de Piernas",
    aliases: ["Leg Press", "Prensa 45", "Prensa"],
    muscleGroup: "Pierna",
    equipment: ["gym_full"],
    svgIcon: "bodyweight",
  },
  {
    id: "hack_squat",
    name: "Sentadilla Hack",
    aliases: ["Hack Squat", "Máquina Hack"],
    muscleGroup: "Pierna",
    equipment: ["gym_full"],
    svgIcon: "barbell",
  },
  {
    id: "bulgarian_split_squat",
    name: "Sentadilla Búlgara",
    aliases: ["Bulgarian Split Squat", "Zancada búlgara", "Búlgaras"],
    muscleGroup: "Pierna",
    equipment: ["dumbbells_only", "bench", "home_gym", "gym_full"],
    svgIcon: "side_squat",
  },
  {
    id: "lunges",
    name: "Zancadas / Desplantes",
    aliases: ["Lunges", "Estocadas", "Tijeras"],
    muscleGroup: "Pierna",
    equipment: ["bodyweight", "dumbbells_only", "barbell_plates", "home_gym", "gym_full"],
    svgIcon: "side_squat",
  },
  {
    id: "walking_lunges",
    name: "Zancadas Caminando",
    aliases: ["Walking Lunges", "Pasos de tijera"],
    muscleGroup: "Pierna",
    equipment: ["bodyweight", "dumbbells_only", "gym_full"],
    svgIcon: "side_squat",
  },
  {
    id: "romanian_deadlift",
    name: "Peso Muerto Rumano (RDL)",
    aliases: ["RDL", "Peso muerto rumano", "Peso muerto piernas semirrígidas"],
    muscleGroup: "Pierna",
    equipment: ["barbell_plates", "dumbbells_only", "gym_full"],
    svgIcon: "rdl",
  },
  {
    id: "stiff_leg_deadlift",
    name: "Peso Muerto Rígido",
    aliases: ["Stiff Leg Deadlift", "Peso muerto piernas rígidas"],
    muscleGroup: "Pierna",
    equipment: ["barbell_plates", "dumbbells_only", "gym_full"],
    svgIcon: "rdl",
  },
  {
    id: "leg_extension",
    name: "Extensión de Cuádriceps",
    aliases: ["Leg Extension", "Sillón de cuádriceps", "Extensiones"],
    muscleGroup: "Pierna",
    equipment: ["gym_full"],
    svgIcon: "bodyweight",
  },
  {
    id: "leg_curl_seated",
    name: "Curl Femoral Sentado",
    aliases: ["Seated Leg Curl", "Sentado femoral"],
    muscleGroup: "Pierna",
    equipment: ["gym_full"],
    svgIcon: "bodyweight",
  },
  {
    id: "leg_curl_lying",
    name: "Curl Femoral Tumbado",
    aliases: ["Lying Leg Curl", "Femoral acostado"],
    muscleGroup: "Pierna",
    equipment: ["gym_full"],
    svgIcon: "bodyweight",
  },
  {
    id: "standing_calf_raise",
    name: "Elevación de Gemelos de Pie",
    aliases: ["Standing Calf Raise", "Gemelos de pie", "Pantorrillas"],
    muscleGroup: "Pierna",
    equipment: ["bodyweight", "dumbbells_only", "machine", "gym_full"],
    svgIcon: "calf_raise_bilateral",
  },
  {
    id: "seated_calf_raise",
    name: "Elevación de Gemelos Sentado",
    aliases: ["Seated Calf Raise", "Costurera", "Pantorrilla sentado"],
    muscleGroup: "Pierna",
    equipment: ["gym_full"],
    svgIcon: "calf_raise_bilateral",
  },

  // ================= GLÚTEO =================
  {
    id: "glute_bridge",
    name: "Puente de Glúteo",
    aliases: ["Glute Bridge", "Puente pélvico"],
    muscleGroup: "Glúteo",
    equipment: ["bodyweight", "home_gym", "gym_full"],
    svgIcon: "glute_bridge",
  },
  {
    id: "hip_thrust_barbell",
    name: "Hip Thrust con Barra",
    aliases: ["Hip Thrust", "Empuje de cadera"],
    muscleGroup: "Glúteo",
    equipment: ["barbell_plates", "bench", "gym_full"],
    svgIcon: "glute_bridge",
  },
  {
    id: "hip_thrust_machine",
    name: "Hip Thrust en Máquina",
    aliases: ["Machine Hip Thrust"],
    muscleGroup: "Glúteo",
    equipment: ["gym_full"],
    svgIcon: "glute_bridge",
  },
  {
    id: "cable_kickbacks",
    name: "Patada de Glúteo en Polea",
    aliases: ["Cable Kickbacks", "Patada trasera polea"],
    muscleGroup: "Glúteo",
    equipment: ["gym_full"],
    svgIcon: "side_squat",
  },
  {
    id: "hip_abduction_machine",
    name: "Máquina de Abducción",
    aliases: ["Hip Abductor", "Aperturas glúteo máquina", "Abductor"],
    muscleGroup: "Glúteo",
    equipment: ["gym_full"],
    svgIcon: "side_squat",
  },

  // ================= HOMBRO =================
  {
    id: "overhead_press",
    name: "Press Militar (Barra)",
    aliases: ["Military Press", "Overhead Press", "OHP", "Press frontal barra"],
    muscleGroup: "Hombro",
    equipment: ["barbell_plates", "gym_full"],
    svgIcon: "shoulder_press",
  },
  {
    id: "dumbbell_shoulder_press",
    name: "Press de Hombros (Mancuernas)",
    aliases: ["Dumbbell Shoulder Press", "Press Arnold", "Press sentado mancuernas"],
    muscleGroup: "Hombro",
    equipment: ["dumbbells_only", "bench", "home_gym", "gym_full"],
    svgIcon: "shoulder_press",
  },
  {
    id: "arnold_press",
    name: "Press Arnold",
    aliases: ["Arnold Press"],
    muscleGroup: "Hombro",
    equipment: ["dumbbells_only", "bench", "home_gym", "gym_full"],
    svgIcon: "shoulder_press",
  },
  {
    id: "machine_shoulder_press",
    name: "Press de Hombros en Máquina",
    aliases: ["Machine Shoulder Press"],
    muscleGroup: "Hombro",
    equipment: ["gym_full"],
    svgIcon: "shoulder_press",
  },
  {
    id: "lateral_raises",
    name: "Elevaciones Laterales",
    aliases: ["Lateral Raises", "Vuelos laterales"],
    muscleGroup: "Hombro",
    equipment: ["dumbbells_only", "resistance_bands", "home_gym", "gym_full"],
    svgIcon: "dumbbell",
  },
  {
    id: "cable_lateral_raises",
    name: "Elevaciones Laterales (Polea)",
    aliases: ["Cable Lateral Raises", "Vuelos polea"],
    muscleGroup: "Hombro",
    equipment: ["gym_full"],
    svgIcon: "dumbbell",
  },
  {
    id: "front_raises",
    name: "Elevaciones Frontales",
    aliases: ["Front Raises", "Vuelos frontales"],
    muscleGroup: "Hombro",
    equipment: ["dumbbells_only", "barbell_plates", "home_gym", "gym_full"],
    svgIcon: "dumbbell",
  },
  {
    id: "upright_row",
    name: "Remo al Mentón",
    aliases: ["Upright Row", "Remo al cuello"],
    muscleGroup: "Hombro",
    equipment: ["barbell_plates", "dumbbells_only", "gym_full"],
    svgIcon: "barbell",
  },
  {
    id: "face_pull",
    name: "Face Pulls",
    aliases: ["Tirón a la cara", "Face pulls polea"],
    muscleGroup: "Hombro",
    equipment: ["gym_full", "resistance_bands"],
    svgIcon: "face_pull",
  },
  {
    id: "reverse_pec_deck",
    name: "Pájaros en Máquina",
    aliases: ["Reverse Pec Deck", "Reverse Machine Flyes"],
    muscleGroup: "Hombro",
    equipment: ["gym_full"],
    svgIcon: "floor_press",
  },
  {
    id: "dumbbell_rear_delt_fly",
    name: "Pájaros con Mancuernas",
    aliases: ["Rear Delt Fly", "Vuelos posteriores"],
    muscleGroup: "Hombro",
    equipment: ["dumbbells_only", "home_gym", "gym_full"],
    svgIcon: "dumbbell",
  },

  // ================= BRAZOS (BÍCEPS Y TRÍCEPS) =================
  {
    id: "barbell_bicep_curl",
    name: "Curl de Bíceps con Barra",
    aliases: ["Barbell Curl", "Curl barra recta", "Curl barra Z"],
    muscleGroup: "Brazos",
    equipment: ["barbell_plates", "gym_full"],
    svgIcon: "bicep_curl",
  },
  {
    id: "dumbbell_bicep_curl",
    name: "Curl de Bíceps con Mancuernas",
    aliases: ["Dumbbell Curl", "Curl alterno"],
    muscleGroup: "Brazos",
    equipment: ["dumbbells_only", "home_gym", "gym_full"],
    svgIcon: "bicep_curl",
  },
  {
    id: "hammer_curl",
    name: "Curl Martillo",
    aliases: ["Hammer Curl", "Martillo"],
    muscleGroup: "Brazos",
    equipment: ["dumbbells_only", "home_gym", "gym_full"],
    svgIcon: "bicep_curl",
  },
  {
    id: "preacher_curl",
    name: "Curl Predicador",
    aliases: ["Preacher Curl", "Curl Scott"],
    muscleGroup: "Brazos",
    equipment: ["barbell_plates", "dumbbells_only", "machine", "gym_full"],
    svgIcon: "bicep_curl",
  },
  {
    id: "cable_bicep_curl",
    name: "Curl de Bíceps en Polea",
    aliases: ["Cable Curl"],
    muscleGroup: "Brazos",
    equipment: ["gym_full"],
    svgIcon: "bicep_curl",
  },
  {
    id: "tricep_pushdown",
    name: "Extensión de Tríceps (Polea)",
    aliases: ["Tricep Pushdown", "Jalón tríceps", "Tríceps polea"],
    muscleGroup: "Brazos",
    equipment: ["gym_full"],
    svgIcon: "tricep_extension",
  },
  {
    id: "overhead_tricep_extension",
    name: "Extensión Tras Nuca",
    aliases: ["Overhead Tricep Extension", "Copa", "Extensión copa"],
    muscleGroup: "Brazos",
    equipment: ["dumbbells_only", "cable", "home_gym", "gym_full"],
    svgIcon: "tricep_extension",
  },
  {
    id: "skull_crushers",
    name: "Press Francés (Rompecráneos)",
    aliases: ["Skull Crushers", "Press frances barra Z", "Rompecráneos"],
    muscleGroup: "Brazos",
    equipment: ["barbell_plates", "bench", "gym_full"],
    svgIcon: "tricep_extension",
  },
  {
    id: "close_grip_bench_press",
    name: "Press de Banca Cerrado",
    aliases: ["Close Grip Bench Press"],
    muscleGroup: "Brazos",
    equipment: ["barbell_plates", "bench", "gym_full"],
    svgIcon: "barbell",
  },
  {
    id: "tricep_kickbacks",
    name: "Patada de Tríceps",
    aliases: ["Tricep Kickbacks", "Patada de burro tríceps"],
    muscleGroup: "Brazos",
    equipment: ["dumbbells_only", "home_gym", "gym_full"],
    svgIcon: "tricep_extension",
  },
  {
    id: "bench_dips",
    name: "Fondos en Banco",
    aliases: ["Bench Dips", "Fondos tríceps"],
    muscleGroup: "Brazos",
    equipment: ["bodyweight", "bench", "home_gym", "gym_full"],
    svgIcon: "tricep_extension",
  },

  // ================= ABDOMEN Y CORE =================
  {
    id: "crunch",
    name: "Crunches Abdominales",
    aliases: ["Crunches", "Encogimientos"],
    muscleGroup: "Abdomen",
    equipment: ["bodyweight", "home_gym", "gym_full"],
    svgIcon: "deadbug",
  },
  {
    id: "situps",
    name: "Sit-ups",
    aliases: ["Sit ups", "Abdominales completos"],
    muscleGroup: "Abdomen",
    equipment: ["bodyweight", "home_gym", "gym_full"],
    svgIcon: "deadbug",
  },
  {
    id: "leg_raises_floor",
    name: "Elevación de Piernas al Suelo",
    aliases: ["Lying Leg Raises", "Elevación de piernas"],
    muscleGroup: "Abdomen",
    equipment: ["bodyweight", "home_gym", "gym_full"],
    svgIcon: "leg_raise",
  },
  {
    id: "hanging_leg_raises",
    name: "Elevación de Piernas Colgado",
    aliases: ["Hanging Leg Raises", "Rodillas al pecho colgado"],
    muscleGroup: "Abdomen",
    equipment: ["pullup_bar", "gym_full"],
    svgIcon: "leg_raise",
  },
  {
    id: "plank",
    name: "Plancha Isométrica",
    aliases: ["Plank", "Planchas", "Tablón"],
    muscleGroup: "Abdomen",
    equipment: ["bodyweight", "home_gym", "gym_full"],
    svgIcon: "plank",
  },
  {
    id: "side_plank",
    name: "Plancha Lateral",
    aliases: ["Side Plank", "Plancha de lado"],
    muscleGroup: "Abdomen",
    equipment: ["bodyweight", "home_gym", "gym_full"],
    svgIcon: "plank",
  },
  {
    id: "russian_twists",
    name: "Giros Rusos",
    aliases: ["Russian Twists", "Torsiones rusas"],
    muscleGroup: "Abdomen",
    equipment: ["bodyweight", "dumbbells_only", "kettlebells", "home_gym", "gym_full"],
    svgIcon: "deadbug",
  },
  {
    id: "ab_wheel_rollout",
    name: "Rueda Abdominal",
    aliases: ["Ab Wheel", "Rollouts", "Rodillo"],
    muscleGroup: "Abdomen",
    equipment: ["home_gym", "gym_full"],
    svgIcon: "plank",
  },
  {
    id: "cable_crunch",
    name: "Crunches en Polea",
    aliases: ["Cable Crunch", "Encogimientos polea alta"],
    muscleGroup: "Abdomen",
    equipment: ["gym_full"],
    svgIcon: "deadbug",
  },
  {
    id: "deadbug",
    name: "Deadbug (Bicho Muerto)",
    aliases: ["Dead bug", "Insecto muerto"],
    muscleGroup: "Abdomen",
    equipment: ["bodyweight", "home_gym", "gym_full"],
    svgIcon: "deadbug",
  },

  // ================= CARDIO Y OTROS =================
  {
    id: "burpees",
    name: "Burpees",
    aliases: ["Burpees"],
    muscleGroup: "Cuerpo Completo",
    equipment: ["bodyweight", "home_gym", "gym_full"],
    svgIcon: "bodyweight",
  },
  {
    id: "jumping_jacks",
    name: "Jumping Jacks",
    aliases: ["Jumping Jacks", "Saltos estrella"],
    muscleGroup: "Cardio",
    equipment: ["bodyweight", "home_gym", "gym_full"],
    svgIcon: "bodyweight",
  },
  {
    id: "mountain_climbers",
    name: "Mountain Climbers",
    aliases: ["Escaladores"],
    muscleGroup: "Cardio",
    equipment: ["bodyweight", "home_gym", "gym_full"],
    svgIcon: "plank",
  },
  {
    id: "kettlebell_swing",
    name: "Kettlebell Swing",
    aliases: ["Swings", "Balanceo de pesa rusa"],
    muscleGroup: "Cuerpo Completo",
    equipment: ["kettlebells", "home_gym", "gym_full"],
    svgIcon: "rdl",
  },
  {
    id: "farmers_walk",
    name: "Paseo del Granjero",
    aliases: ["Farmers Walk"],
    muscleGroup: "Cuerpo Completo",
    equipment: ["dumbbells_only", "kettlebells", "gym_full"],
    svgIcon: "bodyweight",
  },
  {
    id: "box_jumps",
    name: "Saltos al Cajón",
    aliases: ["Box Jumps", "Saltos pliométricos"],
    muscleGroup: "Pierna",
    equipment: ["gym_full", "home_gym"],
    svgIcon: "bodyweight",
  },
];

async function runSeeder() {
  console.log(
    `🚀 Preparando inyección masiva de ${seedExercises.length} ejercicios normalizados...`,
  );
  const batch = db.batch();
  const collectionRef = db.collection("normalized_exercises");

  let count = 0;
  for (const exercise of seedExercises) {
    const docRef = collectionRef.doc(exercise.id);
    batch.set(docRef, exercise, { merge: true });
    count++;
  }

  try {
    await batch.commit();
    console.log(
      `✅ ¡Éxito! Se han inyectado de golpe ${count} ejercicios reales en la base de datos de Producción.`,
    );
  } catch (err) {
    console.error("❌ Error inyectando datos:", err);
  }
}

runSeeder().then(() => process.exit(0));
