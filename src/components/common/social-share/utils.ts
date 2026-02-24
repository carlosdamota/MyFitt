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
