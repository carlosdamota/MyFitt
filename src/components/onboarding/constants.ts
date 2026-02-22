import { ProfileFormData, EquipmentOption, FocusArea } from "../../types";

export const TOTAL_STEPS = 5;
export const FREE_MAX_DAYS = 2;

export const goalOptions: {
  value: ProfileFormData["goal"];
  label: string;
  emoji: string;
  desc: string;
}[] = [
  { value: "muscle_gain", label: "Ganar Músculo", emoji: "💪", desc: "Hipertrofia y volumen" },
  { value: "strength", label: "Ganar Fuerza", emoji: "🏋️", desc: "Potencia y PRs" },
  { value: "fat_loss", label: "Perder Grasa", emoji: "🔥", desc: "Definición y recorte" },
  { value: "endurance", label: "Resistencia", emoji: "🏃", desc: "Salud general y cardio" },
];

export const levelOptions: {
  value: ProfileFormData["experienceLevel"];
  label: string;
  years: string;
}[] = [
  { value: "beginner", label: "Principiante", years: "0-1 años" },
  { value: "intermediate", label: "Intermedio", years: "1-3 años" },
  { value: "advanced", label: "Avanzado", years: "3+ años" },
];

export const equipmentOptions: { value: EquipmentOption; label: string; description: string }[] = [
  { value: "gym_full", label: "Gimnasio completo", description: "Máquinas + libres" },
  { value: "home_gym", label: "Home gym", description: "Barra + jaula" },
  { value: "dumbbells_only", label: "Solo mancuernas", description: "Ajustables o fijas" },
  { value: "bodyweight", label: "Peso corporal", description: "Calistenia" },
  { value: "barbell_plates", label: "Barra y discos", description: "Peso libre" },
  { value: "pullup_bar", label: "Barra de dominadas", description: "Pared o puerta" },
  { value: "resistance_bands", label: "Bandas elásticas", description: "Ligeras/medias" },
  { value: "bench", label: "Banco", description: "Plano/inclinado" },
  { value: "kettlebells", label: "Kettlebells", description: "Balones rusos" },
];

export const equipmentLabels: Record<string, string> = Object.fromEntries(
  equipmentOptions.map((o) => [o.value, o.label]),
);

export const splitOptions: {
  value: ProfileFormData["trainingSplit"];
  label: string;
  desc: string;
}[] = [
  { value: "full_body", label: "Cuerpo Completo", desc: "Todo el cuerpo en cada sesión" },
  { value: "push_pull_legs", label: "Push / Pull / Legs", desc: "Empuje, Tracción y Piernas" },
  { value: "upper_lower", label: "Tren Superior / Inferior", desc: "Divide arriba y abajo" },
  { value: "body_part", label: "Por Zonas", desc: "Enfoque en grupos específicos" },
];

export const focusAreaOptions: { value: FocusArea; label: string; emoji: string }[] = [
  { value: "chest", label: "Pecho", emoji: "👕" },
  { value: "back", label: "Espalda", emoji: "🦅" },
  { value: "legs", label: "Piernas", emoji: "🦵" },
  { value: "shoulders", label: "Hombros", emoji: "🛡️" },
  { value: "arms", label: "Brazos", emoji: "💪" },
  { value: "core", label: "Core", emoji: "🦾" },
];

export const formatEquipment = (equipment: EquipmentOption[]): string => {
  if (!equipment || equipment.length === 0) return "Peso corporal";
  return equipment.map((v) => equipmentLabels[v] ?? v).join(", ");
};

export const MOTIVATIONAL_PHRASES = [
  "Preparando tu entrenamiento personalizado... 💪",
  "Analizando tu perfil de atleta...",
  "Los campeones se forjan en el gimnasio 🏆",
  "Diseñando ejercicios perfectos para ti...",
  "El dolor de hoy es la fuerza del mañana 🔥",
  "Calculando las mejores series y repeticiones...",
  "Cada repetición cuenta, cada día suma 📈",
  "Tu mejor versión está a punto de nacer ⭐",
];
