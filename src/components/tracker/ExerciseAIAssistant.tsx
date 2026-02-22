import React, { useState, useCallback } from "react";
import { Loader, BookOpen, X } from "lucide-react";
import { callAI, AiError } from "../../api/ai";
import { logEvent } from "../../utils/analytics";
import RateLimitError from "../errors/RateLimitError";
import type { WorkoutLogEntry } from "../../types";
import type { User as FirebaseUser } from "firebase/auth";
import { useEntitlement } from "../../hooks/useEntitlement";
import { Button } from "../ui/Button";

interface ExerciseAIAssistantProps {
  user: FirebaseUser | null;
  exerciseName: string;
  history: WorkoutLogEntry[];
  instructions?: string[];
  onRequireAuth?: () => void;
  actionSlot?: React.ReactNode;
}

const ExerciseAIAssistant: React.FC<ExerciseAIAssistantProps> = ({
  user,
  exerciseName,
  history,
  instructions,
  onRequireAuth,
  actionSlot,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<string | string[] | null>(null);
  const [responseType, setResponseType] = useState<"instructions" | null>(null);
  const [showRateLimitError, setShowRateLimitError] = useState<boolean>(false);
  const [quotaResetAt, setQuotaResetAt] = useState<string | null>(null);
  const [quotaMessage, setQuotaMessage] = useState<string>("Límite de IA alcanzado");
  const { plan } = useEntitlement(user);
  const isPro = plan === "pro";

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

  return (
    <div className='mt-4'>
      {showRateLimitError && (
        <RateLimitError
          message={quotaMessage}
          resetAt={quotaResetAt}
          onClose={() => setShowRateLimitError(false)}
          isPro={isPro}
        />
      )}

      <div className='flex flex-col sm:flex-row gap-3 pt-4 items-stretch'>
        <div className='flex-1 min-w-0'>{actionSlot}</div>
        <Button
          variant='secondary'
          onClick={handleShowInstructions}
          disabled={loading}
          className='flex-1 py-3 text-xs w-full bg-surface-950/80 border-surface-800 hover:bg-surface-900 hover:border-surface-700 shadow-inner'
          leftIcon={
            loading && responseType === "instructions" ? (
              <Loader
                size={14}
                className='animate-spin'
              />
            ) : (
              <BookOpen size={14} />
            )
          }
        >
          {loading && responseType === "instructions" ? "Cargando..." : "Instrucciones de Técnica"}
        </Button>
      </div>

      {response && (
        <div className='mt-4 p-4 rounded-2xl border text-sm animate-in zoom-in-95 duration-200 shadow-2xl backdrop-blur-xl bg-surface-950/90 border-surface-800'>
          <div className='flex justify-between items-start mb-3 border-b border-white/5 pb-2'>
            <h4 className='font-bold flex items-center gap-2 text-slate-200'>
              <BookOpen size={16} />
              Técnica Correcta
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
