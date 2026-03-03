import type { NormalizedExercise } from "../types";

/**
 * Normalize a string for fuzzy comparison:
 * lowercase, remove accents, strip common filler words.
 */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9\s]/g, "") // strip punctuation
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Find the best matching exercise from a catalog by name.
 * Uses progressive matching: exact → alias → token overlap.
 * Returns the matched exercise or undefined.
 */
export function findExerciseByName(
  name: string,
  catalog: Record<string, NormalizedExercise>,
): NormalizedExercise | undefined {
  if (!name || !catalog) return undefined;

  const normalizedName = normalize(name);
  const entries = Object.values(catalog);

  // Pass 1: Exact name match
  for (const ex of entries) {
    if (normalize(ex.name) === normalizedName) return ex;
  }

  // Pass 2: Alias match
  for (const ex of entries) {
    for (const alias of ex.aliases) {
      if (normalize(alias) === normalizedName) return ex;
    }
  }

  // Pass 3: Token overlap (at least 60% of tokens match)
  const nameTokens = normalizedName.split(" ").filter((t) => t.length > 2);
  if (nameTokens.length === 0) return undefined;

  let bestMatch: NormalizedExercise | undefined;
  let bestScore = 0;

  for (const ex of entries) {
    const exTokens = normalize(ex.name)
      .split(" ")
      .filter((t) => t.length > 2);
    const allExTokens = [
      ...exTokens,
      ...ex.aliases.flatMap((a) =>
        normalize(a)
          .split(" ")
          .filter((t) => t.length > 2),
      ),
    ];
    const uniqueExTokens = [...new Set(allExTokens)];

    let matches = 0;
    for (const token of nameTokens) {
      if (uniqueExTokens.some((et) => et.includes(token) || token.includes(et))) {
        matches++;
      }
    }

    const score = matches / nameTokens.length;
    if (score > bestScore && score >= 0.6) {
      bestScore = score;
      bestMatch = ex;
    }
  }

  return bestMatch;
}
