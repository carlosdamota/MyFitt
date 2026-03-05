export function buildHashtags(logs: { exercise: string }[], n: number): string {
  const tags = new Set(["#FITTWIZ", "#workout", "#fitness"]);
  const names = logs.map((l) => l.exercise.toLowerCase());
  (
    [
      [["press", "pecho", "bench", "chest"], "#chestday"],
      [["sentadilla", "squat", "pierna", "leg"], "#legday"],
      [["espalda", "remo", "pull", "dorsal", "back"], "#backday"],
      [["hombro", "shoulder", "militar"], "#shoulderday"],
      [["bicep", "curl", "brazo", "arm", "tricep"], "#armday"],
      [["peso muerto", "deadlift", "hip thrust"], "#glutes"],
    ] as [string[], string][]
  ).forEach(([t, tag]) => {
    if (names.some((n) => t.some((k) => n.includes(k)))) tags.add(tag);
  });
  if (n >= 6) tags.add("#fullbody");
  return [...tags].join(" ");
}

/** Extrae el subtítulo de la rutina: quita prefijos de programa y "Día X" */
export const getDisplayTitle = (title?: string): string | undefined => {
  if (!title) return undefined;
  // Quitar prefijo de programa seguido de ":" o " - "
  let t = title.replace(/^[^:\-]+[:\-]\s*/i, "").trim();
  // Quitar "Día X:" o "Day X:"
  t = t.replace(/^(D[íi]a|Day)\s*\d+[:\s-]*/i, "").trim();
  return t || title;
};
