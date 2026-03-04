import { buildPrompt } from "../functions/src/prompts.js";

const mockPayload = {
  stats: {
    daysTrained: 0,
    trainingDates: [],
    totalVolume: 0,
    previousWeekVolume: 4326,
    musclesWorked: [],
    currentWeekExercises: [],
    coachHistory: "Ninguno",
    personality: "sargento",
    availableDays: 2,
  },
};

console.log("--- Testing Weekly Coach with Sargent personality ---");
const result = buildPrompt("weekly_coach", mockPayload);
console.log("System Instruction (first 200 chars):");
console.log(result.system.substring(0, 200) + "...");

if (
  result.system.includes("instrucción militar") ||
  result.system.includes("militar extremadamente estricto")
) {
  console.log("SUCCESS: Sargent personality detected in prompt.");
} else {
  console.log("FAILURE: Prompt does not look like a sargento.");
}

const mockPayloadMotivador = {
  stats: {
    ...mockPayload.stats,
    personality: "motivador",
  },
};

console.log("\n--- Testing Weekly Coach with Motivador personality ---");
const resultMotivador = buildPrompt("weekly_coach", mockPayloadMotivador);
console.log("System Instruction (first 200 chars):");
console.log(resultMotivador.system.substring(0, 200) + "...");

if (resultMotivador.system.includes("amigable, positivo")) {
  console.log("SUCCESS: Motivador personality detected in prompt.");
} else {
  console.log("FAILURE: Prompt does not look like a motivador.");
}
