import React, { useState, useCallback } from "react";
import { Loader, ZapOff, Trophy, X } from "lucide-react";
import { callAI, AiError } from "../../api/ai";
import { logEvent } from "../../utils/analytics";
import RateLimitError from "../errors/RateLimitError";
import type { WorkoutLogEntry } from "../../types";
import type { User as FirebaseUser } from "firebase/auth";

interface ExerciseAIAssistantProps {
  user: FirebaseUser | null;
  exerciseName: string;
  history: WorkoutLogEntry[];
  onRequireAuth?: () => void;
  onUpgrade?: () => void;
}

const ExerciseAIAssistant: React.FC<ExerciseAIAssistantProps> = ({
  user,
  exerciseName,
  history,
  onRequireAuth,
  onUpgrade,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<string | null>(null);
  const [responseType, setResponseType] = useState<"variants" | "analysis" | null>(null);
  const [showRateLimitError, setShowRateLimitError] = useState<boolean>(false);
  const [quotaResetAt, setQuotaResetAt] = useState<string | null>(null);
  const [quotaMessage, setQuotaMessage] = useState<string>("Límite de IA alcanzado");

  const handleGenerateVariants = useCallback(async (): Promise<void> => {
    if (!user) {
      setResponse("Inicia sesión para usar el coach de IA.");
      onRequireAuth?.();
      return;
    }

    setLoading(true);
    setResponse(null);
    setResponseType("variants");
    setQuotaMessage("Límite de IA alcanzado");
    setQuotaResetAt(null);
    logEvent("Exercise", "Generate Variants", exerciseName);

    try {
      const resp = await callAI("exercise_variants", { exerciseName });
      setResponse(resp.text);
    } catch (e) {
      if (e instanceof AiError && e.code === "quota_exceeded") {
        setQuotaMessage(e.message);
        setQuotaResetAt(e.resetAt ?? null);
        setShowRateLimitError(true);
      } else if (e instanceof AiError && e.code === "auth_required") {
        setResponse(e.message);
        onRequireAuth?.();
      } else {
        setResponse("Error al generar las variantes. Intenta de nuevo.");
      }
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [exerciseName, onRequireAuth, user]);

  const handleAnalyzeHistory = useCallback(async (): Promise<void> => {
    if (history.length === 0) {
      setResponse("Registra al menos una serie para recibir un análisis.");
      setResponseType("analysis");
      return;
    }

    if (!user) {
      setResponse("Inicia sesión para usar el coach de IA.");
      onRequireAuth?.();
      return;
    }

    setLoading(true);
    setResponse(null);
    setResponseType("analysis");
    setQuotaMessage("Límite de IA alcanzado");
    setQuotaResetAt(null);
    logEvent("Exercise", "Analyze History", exerciseName);

    const formattedHistory = history.map((h) => ({
      fecha: new Date(h.date).toLocaleDateString(),
      peso: h.weight,
      reps: h.reps || 0,
      series: h.sets || 0,
    }));

    try {
      const resp = await callAI("exercise_analysis", {
        exerciseName,
        history: formattedHistory,
      });
      setResponse(resp.text);
    } catch (e) {
      if (e instanceof AiError && e.code === "quota_exceeded") {
        setQuotaMessage(e.message);
        setQuotaResetAt(e.resetAt ?? null);
        setShowRateLimitError(true);
      } else if (e instanceof AiError && e.code === "auth_required") {
        setResponse(e.message);
        onRequireAuth?.();
      } else {
        setResponse("Error al analizar el historial.");
      }
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [exerciseName, history, onRequireAuth, user]);

  return (
    <div className='mt-4'>
      {showRateLimitError && (
        <RateLimitError
          message={quotaMessage}
          resetAt={quotaResetAt}
          onClose={() => setShowRateLimitError(false)}
          onUpgrade={onUpgrade}
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
          <div className='text-slate-200 leading-relaxed whitespace-pre-wrap'>{response}</div>
        </div>
      )}
    </div>
  );
};

export default ExerciseAIAssistant;
