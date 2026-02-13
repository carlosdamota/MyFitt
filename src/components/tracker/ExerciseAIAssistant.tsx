import React, { useState, useCallback } from "react";
import { Loader, BookOpen, Trophy, X } from "lucide-react";
import { callAI, AiError } from "../../api/ai";
import { logEvent } from "../../utils/analytics";
import RateLimitError from "../errors/RateLimitError";
import type { WorkoutLogEntry } from "../../types";
import type { User as FirebaseUser } from "firebase/auth";

interface ExerciseAIAssistantProps {
  user: FirebaseUser | null;
  exerciseName: string;
  history: WorkoutLogEntry[];
  instructions?: string[];
  onRequireAuth?: () => void;
  onUpgrade?: () => void;
}

const ExerciseAIAssistant: React.FC<ExerciseAIAssistantProps> = ({
  user,
  exerciseName,
  history,
  instructions,
  onRequireAuth,
  onUpgrade,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<string | string[] | null>(null);
  const [responseType, setResponseType] = useState<"instructions" | "analysis" | null>(null);
  const [showRateLimitError, setShowRateLimitError] = useState<boolean>(false);
  const [quotaResetAt, setQuotaResetAt] = useState<string | null>(null);
  const [quotaMessage, setQuotaMessage] = useState<string>("Límite de IA alcanzado");

  const handleShowInstructions = useCallback(async (): Promise<void> => {
    setLoading(true);
    setResponse(null);
    setResponseType("instructions");
    setQuotaMessage("Límite de IA alcanzado");
    setQuotaResetAt(null);
    logEvent("Exercise", "View Instructions", exerciseName);

    // 1. Static Instructions (Instant)
    if (instructions && instructions.length > 0) {
      setResponse(instructions);
      setLoading(false);
      return;
    }

    // 2. AI Generated Instructions (Fallback)
    if (!user) {
      setResponse("Inicia sesión para generar instrucciones con IA.");
      onRequireAuth?.();
      setLoading(false);
      return;
    }

    try {
      const resp = await callAI("exercise_instructions", { exerciseName });
      try {
        const parsed = JSON.parse(resp.text);
        if (Array.isArray(parsed)) {
          setResponse(parsed);
        } else {
          setResponse(String(resp.text));
        }
      } catch {
        setResponse(resp.text); // Fallback if not JSON
      }
    } catch (e) {
      if (e instanceof AiError && e.code === "quota_exceeded") {
        setQuotaMessage(e.message);
        setQuotaResetAt(e.resetAt ?? null);
        setShowRateLimitError(true);
      } else if (e instanceof AiError && e.code === "auth_required") {
        setResponse(e.message);
        onRequireAuth?.();
      } else {
        setResponse("Error al obtener las instrucciones. Intenta de nuevo.");
      }
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [exerciseName, instructions, onRequireAuth, user]);

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
          onClick={handleShowInstructions}
          disabled={loading}
          className='flex-1 bg-slate-700/80 hover:bg-slate-600 disabled:opacity-50 text-slate-200 text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 border border-slate-600'
        >
          {loading && responseType === "instructions" ? (
            <Loader
              size={14}
              className='animate-spin'
            />
          ) : (
            <>
              <BookOpen size={14} /> Instrucciones
            </>
          )}
        </button>
        <button
          onClick={handleAnalyzeHistory}
          disabled={loading || history.length === 0}
          className='flex-1 bg-amber-600/90 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-amber-900/20'
        >
          {loading && responseType === "analysis" ? (
            <Loader
              size={14}
              className='animate-spin'
            />
          ) : (
            <>
              <Trophy size={14} /> Analizar
            </>
          )}
        </button>
      </div>

      {response && (
        <div
          className={`mt-4 p-4 rounded-xl border text-sm animate-in zoom-in-95 duration-200 shadow-xl ${
            responseType === "instructions"
              ? "bg-slate-800/90 border-slate-600 backdrop-blur-md"
              : "bg-amber-900/40 border-amber-700/50 backdrop-blur-md"
          }`}
        >
          <div className='flex justify-between items-start mb-3 border-b border-white/5 pb-2'>
            <h4
              className={`font-bold flex items-center gap-2 ${
                responseType === "instructions" ? "text-slate-200" : "text-amber-400"
              }`}
            >
              {responseType === "instructions" ? <BookOpen size={16} /> : <Trophy size={16} />}
              {responseType === "instructions" ? "Técnica Correcta" : "AI Coach"}
            </h4>
            <button
              onClick={() => setResponse(null)}
              className='text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full'
            >
              <X size={16} />
            </button>
          </div>

          <div className='text-slate-300 leading-relaxed'>
            {Array.isArray(response) ? (
              <ol className='list-decimal pl-4 space-y-2 marker:text-slate-500 marker:font-bold'>
                {response.map((step, i) => (
                  <li
                    key={i}
                    className='pl-1'
                  >
                    {step}
                  </li>
                ))}
              </ol>
            ) : (
              <div className='whitespace-pre-wrap'>{response}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseAIAssistant;
