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

/** Extrae el subtítulo de la rutina: quita prefijos de programa y se queda solo con lo que está después del último ':' o ' - ' */
export const getDisplayTitle = (title?: string): string | undefined => {
  if (!title) return undefined;
  
  let t = title;
  
  // Dividir por ':' o ' - ' y quedarse con el último fragmento útil
  const separatorRegex = /:|(\s-\s)/;
  if (separatorRegex.test(title)) {
    // split() con grupo de captura incluye el separador en el array, lo filtramos
    const parts = title.split(separatorRegex).filter(p => p && p.trim() !== '-' && p.trim() !== '');
    if (parts.length > 0) {
      t = parts[parts.length - 1].trim();
    }
  }

  // Por las dudas limpiamos cualquier "Día X" o "Day X" que haya quedado suelto al principio
  t = t.replace(/^(D[íi]a|Day)\s*\d+[:\s-]*/i, "").trim();
  
  return t || title;
};
