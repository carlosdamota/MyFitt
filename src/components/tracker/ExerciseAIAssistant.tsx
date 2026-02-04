import React, { useState, useCallback } from "react";
import { Loader, ZapOff, Trophy, X } from "lucide-react";
import { useRateLimit } from "../../hooks/useRateLimit";
import { callGeminiAPI } from "../../api/gemini";
import { logEvent } from "../../utils/analytics";
import RateLimitError from "../errors/RateLimitError";
import type { WorkoutLogEntry } from "../../types";
import type { User as FirebaseUser } from "firebase/auth";

interface ExerciseAIAssistantProps {
  user: FirebaseUser | null;
  exerciseName: string;
  history: WorkoutLogEntry[];
}

const ExerciseAIAssistant: React.FC<ExerciseAIAssistantProps> = ({
  user,
  exerciseName,
  history,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<string | null>(null);
  const [responseType, setResponseType] = useState<"variants" | "analysis" | null>(null);
  const [showRateLimitError, setShowRateLimitError] = useState<boolean>(false);

  // Rate limiting: 20 análisis de ejercicios con IA por día
  const rateLimitExercise = useRateLimit(user, "analyze_exercise", 20);

  const handleGenerateVariants = useCallback(async (): Promise<void> => {
    const canAnalyze = await rateLimitExercise.checkAndIncrement();
    if (!canAnalyze) {
      setShowRateLimitError(true);
      return;
    }

    setLoading(true);
    setResponse(null);
    setResponseType("variants");
    logEvent("Exercise", "Generate Variants", exerciseName);

    const systemPrompt =
      "Eres un entrenador de fuerza experto. Proporciona 3 variantes de progresión o regresión (más fáciles o más difíciles) para el ejercicio solicitado. Describe brevemente cómo se realiza cada variante. Usa un formato de lista numerada.";
    const userPrompt = `Sugiere 3 variantes para el ejercicio: ${exerciseName}.`;

    try {
      const resp = await callGeminiAPI(userPrompt, systemPrompt);
      setResponse(resp);
    } catch (e) {
      setResponse("Error al generar las variantes. Intenta de nuevo.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [exerciseName, rateLimitExercise]);

  const handleAnalyzeHistory = useCallback(async (): Promise<void> => {
    if (history.length === 0) {
      setResponse("Registra al menos una serie para recibir un análisis.");
      setResponseType("analysis");
      return;
    }

    const canAnalyze = await rateLimitExercise.checkAndIncrement();
    if (!canAnalyze) {
      setShowRateLimitError(true);
      return;
    }

    setLoading(true);
    setResponse(null);
    setResponseType("analysis");
    logEvent("Exercise", "Analyze History", exerciseName);

    const formattedHistory = history.map((h) => ({
      fecha: new Date(h.date).toLocaleDateString(),
      peso: h.weight,
      reps: h.reps || 0,
      series: h.sets || 0,
    }));

    const systemPrompt =
      "Eres un coach de entrenamiento motivacional y analítico. Identifica el mayor logro en el historial. Proporciona una frase motivacional concisa y amigable. NO uses markdown (ej. **).";
    const userPrompt = `Analiza el historial de: ${exerciseName}. Logs: ${JSON.stringify(formattedHistory)}`;

    try {
      const resp = await callGeminiAPI(userPrompt, systemPrompt);
      setResponse(resp);
    } catch (e) {
      setResponse("Error al analizar el historial.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [exerciseName, history, rateLimitExercise]);

  return (
    <div className='mt-4'>
      {showRateLimitError && (
        <RateLimitError
          message={rateLimitExercise.error || "Límite de IA alcanzado"}
          resetAt={rateLimitExercise.resetAt}
          onClose={() => setShowRateLimitError(false)}
        />
      )}

      <div className='flex gap-2 pt-4 border-t border-slate-700'>
        <button
          onClick={handleGenerateVariants}
          disabled={loading}
          className='flex-1 bg-purple-600/90 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95'
        >
          {loading && responseType === "variants" ? (
            <Loader
              size={14}
              className='animate-spin'
            />
          ) : (
            <>✨ Variantes</>
          )}
        </button>
        <button
          onClick={handleAnalyzeHistory}
          disabled={loading || history.length === 0}
          className='flex-1 bg-amber-600/90 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95'
        >
          {loading && responseType === "analysis" ? (
            <Loader
              size={14}
              className='animate-spin'
            />
          ) : (
            <>✨ Analizar</>
          )}
        </button>
      </div>

      {response && (
        <div
          className={`mt-4 p-3 rounded-xl border text-sm animate-in zoom-in-95 duration-200 shadow-lg ${
            responseType === "variants"
              ? "bg-purple-900/40 border-purple-700/50"
              : "bg-amber-900/40 border-amber-700/50"
          }`}
        >
          <div className='flex justify-between items-start mb-2'>
            <h4 className='font-bold text-white flex items-center gap-2'>
              {responseType === "variants" ? (
                <ZapOff
                  size={16}
                  className='text-purple-400'
                />
              ) : (
                <Trophy
                  size={16}
                  className='text-amber-400'
                />
              )}
              AI Coach
            </h4>
            <button
              onClick={() => setResponse(null)}
              className='text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full'
            >
              <X size={14} />
            </button>
          </div>
          <div
            className='text-slate-200 leading-relaxed'
            dangerouslySetInnerHTML={{ __html: response.replace(/\n/g, "<br/>") }}
          />
        </div>
      )}
    </div>
  );
};

export default ExerciseAIAssistant;
