import React, { useState, useMemo, useCallback, ChangeEvent } from "react";
import { History, Trophy, Save, Loader, ZapOff, X, Trash2, Clock } from "lucide-react";
import { callGeminiAPI } from "../../api/gemini";
import SimpleChart from "../stats/SimpleChart";
import { calculatePersonalBests, isNewRecord, isBodyweightExercise } from "../../utils/stats";
import { useProfile } from "../../hooks/useProfile";
import { useRateLimit } from "../../hooks/useRateLimit";
import RateLimitError from "../errors/RateLimitError";
import { logEvent } from "../../utils/analytics";
import type { User } from "firebase/auth";
import type { WorkoutLogEntry } from "../../types";

interface ExerciseTrackerProps {
  exerciseName: string;
  onSave: (exerciseName: string, entry: WorkoutLogEntry) => Promise<void>;
  onDelete: (exerciseName: string, entry: WorkoutLogEntry) => Promise<void>;
  history: WorkoutLogEntry[];
  onTimerReset: (duration?: number) => void;
  restTime?: number;
  user: User | null;
  isLastInBlock: boolean;
  configuredReps?: string;
}

interface SmartSuggestion {
  weight: number;
  reps: number;
  text: string;
  type: "increase" | "reps" | "steady";
}

const ExerciseTracker: React.FC<ExerciseTrackerProps> = ({
  exerciseName,
  onSave,
  onDelete,
  history,
  onTimerReset,
  restTime,
  user,
  isLastInBlock,
  configuredReps,
}) => {
  const [weight, setWeight] = useState<string>("");
  const [reps, setReps] = useState<string>("");
  const [sets, setSets] = useState<string>("3");
  const [rpe, setRpe] = useState<string>("");
  const { profile } = useProfile(user);
  const userWeight = parseFloat(profile?.weight as string) || 70;
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [geminiLoading, setGeminiLoading] = useState<boolean>(false);
  const [geminiResponse, setGeminiResponse] = useState<string | null>(null);
  const [geminiResponseType, setGeminiResponseType] = useState<"variants" | "analysis" | null>(
    null,
  );
  const [newRecordAlert, setNewRecordAlert] = useState<string | null>(null);
  const [showRateLimitError, setShowRateLimitError] = useState<boolean>(false);

  // Rate limiting: 20 análisis de ejercicios con IA por día
  const rateLimitExercise = useRateLimit(user, "analyze_exercise", 20);

  // Calcular PBs históricos
  const personalBests = useMemo(() => calculatePersonalBests(history), [history]);

  // Lógica de Sobrecarga Progresiva Avanzada
  const smartSuggestion = useMemo((): SmartSuggestion | null => {
    if (!history || history.length === 0) return null;

    // Obtener el último log válido
    const lastLog = [...history].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )[0];
    if (!lastLog) return null;

    const lastWeight = parseFloat(String(lastLog.weight)) || 0;
    const lastReps = parseFloat(String(lastLog.reps)) || 0;
    const lastRpe = parseFloat(String(lastLog.rpe)) || 8;

    let suggestion: SmartSuggestion = {
      weight: lastWeight,
      reps: lastReps,
      text: "",
      type: "steady",
    };

    if (lastRpe <= 7) {
      suggestion.weight = lastWeight + 2.5;
      suggestion.reps = Math.max(6, lastReps - 2);
      suggestion.text = `¡Muy fácil! Sube a ${suggestion.weight}kg`;
      suggestion.type = "increase";
    } else if (lastRpe <= 8.5) {
      suggestion.reps = lastReps + 1;
      suggestion.text = `Buen ritmo. Busca ${suggestion.reps} reps`;
      suggestion.type = "reps";
    } else if (lastRpe >= 9.5) {
      suggestion.text = `Exigente. Consolida técnica con ${lastWeight}kg`;
      suggestion.type = "steady";
    } else {
      suggestion.text = "Mantén el ritmo actual";
    }

    return suggestion;
  }, [history]);

  const applySuggestion = (): void => {
    if (!smartSuggestion) return;
    setWeight(smartSuggestion.weight.toString());
    setReps(smartSuggestion.reps.toString());
    if (smartSuggestion.type === "steady") setRpe("8");
    else setRpe("");
  };

  const handleSave = async (): Promise<void> => {
    if (!weight || !reps) return;
    setIsSaving(true);
    setNewRecordAlert(null);

    const newSet = { weight: parseFloat(weight), reps: parseFloat(reps) };
    const isRecord = isNewRecord(newSet, personalBests);

    await onSave(exerciseName, {
      date: new Date().toISOString(),
      weight: parseFloat(weight),
      reps: parseFloat(reps),
      sets: parseFloat(sets),
      rpe: rpe ? parseFloat(rpe) : null,
    });

    if (isRecord) {
      setNewRecordAlert(`¡NUEVO RÉCORD! ${weight}kg x ${reps}`);
      setTimeout(() => setNewRecordAlert(null), 5000);
    }

    setIsSaving(false);
    setWeight("");
    setReps("");
    setRpe("");
    setGeminiResponse(null);
  };

  const handleGenerateVariants = useCallback(async (): Promise<void> => {
    const canAnalyze = await rateLimitExercise.checkAndIncrement();
    if (!canAnalyze) {
      setShowRateLimitError(true);
      return;
    }

    setGeminiLoading(true);
    setGeminiResponse(null);
    setGeminiResponseType("variants");
    logEvent("Exercise", "Generate Variants", exerciseName);
    const systemPrompt =
      "Eres un entrenador de fuerza experto. Proporciona 3 variantes de progresión o regresión (más fáciles o más difíciles) para el ejercicio solicitado. Describe brevemente cómo se realiza cada variante. Usa un formato de lista numerada.";
    const userPrompt = `Sugiere 3 variantes para el ejercicio: ${exerciseName}.`;

    try {
      const response = await callGeminiAPI(userPrompt, systemPrompt);
      setGeminiResponse(response);
    } catch (e) {
      setGeminiResponse("Error al generar las variantes. Intenta de nuevo.");
      console.error(e);
    } finally {
      setGeminiLoading(false);
    }
  }, [exerciseName, rateLimitExercise]);

  const handleAnalyzeHistory = useCallback(async (): Promise<void> => {
    if (history.length === 0) {
      setGeminiResponse(
        "Aún no tienes suficiente historial para realizar un análisis de tu récord personal. ¡Registra al menos una serie!",
      );
      setGeminiResponseType("analysis");
      return;
    }

    const canAnalyze = await rateLimitExercise.checkAndIncrement();
    if (!canAnalyze) {
      setShowRateLimitError(true);
      return;
    }

    setGeminiLoading(true);
    setGeminiResponse(null);
    setGeminiResponseType("analysis");
    logEvent("Exercise", "Analyze History", exerciseName);

    const formattedHistory = history.map((h) => {
      const weight = parseFloat(String(h.weight)) || 0;
      const effectiveWeight = weight === 0 ? 1 : weight;
      return {
        fecha: new Date(h.date).toLocaleDateString(),
        peso: h.weight,
        reps: h.reps || 0,
        series: h.sets || 0,
        volumen: effectiveWeight * (h.reps || 0) * (h.sets || 0),
      };
    });

    const systemPrompt =
      "Eres un coach de entrenamiento motivacional y analítico. Basado en el historial proporcionado, identifica el mayor volumen total (peso x reps x series) logrado en una sola sesión. Proporciona una frase motivacional/analítica concisa y amigable, incluyendo los valores del récord (peso x reps x series). Responde directamente y conciso. NO uses markdown (ej. **).";
    const userPrompt = `Analiza el historial de entrenamiento para el ejercicio: ${exerciseName}. Historial de Logs (JSON): ${JSON.stringify(formattedHistory)}`;

    try {
      const response = await callGeminiAPI(userPrompt, systemPrompt);
      setGeminiResponse(response);
    } catch (e) {
      setGeminiResponse("Error al analizar el historial. Revisa tu conexión o intenta más tarde.");
      console.error(e);
    } finally {
      setGeminiLoading(false);
    }
  }, [exerciseName, history, userWeight, rateLimitExercise]);

  const chartData = history.map((h) => {
    const weight = parseFloat(String(h.weight)) || 0;
    const effectiveWeight =
      weight === 0 && isBodyweightExercise(exerciseName) ? userWeight : weight;
    return { date: h.date, val: effectiveWeight * (h.reps || 0) * (h.sets || 0) };
  });
  const recentLogs = [...history]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const getSuggestedRestTime = (): number => {
    if (!isLastInBlock) return 30;
    if (restTime) return restTime;
    const r = parseInt(configuredReps || "0");
    if (r < 6) return 180;
    if (r < 10) return 90;
    return 60;
  };

  return (
    <div className='mt-4 bg-slate-800/50 p-3 rounded-lg border border-slate-700'>
      {/* Rate Limit Error Modal */}
      {showRateLimitError && (
        <RateLimitError
          message={
            rateLimitExercise.error ||
            "Has alcanzado el límite de 20 análisis de ejercicios con IA por día"
          }
          resetAt={rateLimitExercise.resetAt}
          onClose={() => setShowRateLimitError(false)}
        />
      )}

      <div className='flex items-center justify-between mb-3'>
        <span className='text-xs text-slate-400 font-bold uppercase flex items-center gap-1'>
          <History size={12} /> Registrar Serie
        </span>

        {/* Mostrar PBs actuales */}
        {personalBests && (
          <div className='flex gap-2'>
            {personalBests.low && (
              <span
                className='text-[10px] bg-red-900/40 text-red-300 px-1.5 py-0.5 rounded border border-red-800/50'
                title='Fuerza (1-5 reps)'
              >
                🏆 {personalBests.low.weight}kg
              </span>
            )}
            {personalBests.mid && (
              <span
                className='text-[10px] bg-blue-900/40 text-blue-300 px-1.5 py-0.5 rounded border border-blue-800/50'
                title='Hipertrofia (6-12 reps)'
              >
                🏅 {personalBests.mid.weight}kg
              </span>
            )}
          </div>
        )}
      </div>

      {smartSuggestion && (
        <button
          onClick={applySuggestion}
          className='mb-4 w-full group relative overflow-hidden bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 p-2.5 rounded-xl flex items-center justify-between hover:border-blue-400/60 transition-all active:scale-[0.98]'
          title='Toca para aplicar esta sugerencia automáticamente'
        >
          <div className='flex items-center gap-3'>
            <div className='bg-blue-500/20 p-2 rounded-lg group-hover:bg-blue-500/30 transition-colors'>
              <ZapOff
                size={16}
                className='text-blue-400'
              />
            </div>
            <div className='flex flex-col items-start'>
              <span className='text-[10px] text-blue-300 font-bold uppercase tracking-wider'>
                Siguiente Paso Sugerido
              </span>
              <span className='text-sm text-white font-medium'>{smartSuggestion.text}</span>
            </div>
          </div>
          <div className='flex items-center gap-2 bg-blue-500/20 px-2 py-1 rounded-md border border-blue-500/30 text-[10px] font-bold text-blue-300 group-hover:bg-blue-500/40 transition-colors'>
            AUTO-LLENAR
          </div>

          <div className='absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/5 to-transparent -translate-x-full group-hover:animate-shimmer' />
        </button>
      )}

      {/* Alerta de Nuevo Récord */}
      {newRecordAlert && (
        <div className='mb-3 bg-yellow-500/20 border border-yellow-500/50 p-2 rounded flex items-center justify-center gap-2 animate-in zoom-in duration-300'>
          <Trophy
            size={16}
            className='text-yellow-400 animate-bounce'
          />
          <span className='text-xs text-yellow-200 font-bold uppercase tracking-wide'>
            {newRecordAlert}
          </span>
        </div>
      )}

      <div className='grid grid-cols-4 gap-2 mb-3'>
        <div className='col-span-1'>
          <label className='block text-[10px] text-slate-500 mb-1'>PESO</label>
          <input
            type='number'
            value={weight}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setWeight(e.target.value)}
            className='w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none'
            placeholder='kg'
          />
        </div>
        <div className='col-span-1'>
          <label className='block text-[10px] text-slate-500 mb-1'>REPS</label>
          <input
            type='number'
            value={reps}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setReps(e.target.value)}
            className='w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none'
            placeholder='0'
          />
        </div>
        <div className='col-span-1'>
          <label className='block text-[10px] text-slate-500 mb-1'>SETS</label>
          <input
            type='number'
            value={sets}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSets(e.target.value)}
            className='w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none'
          />
        </div>
        <div className='col-span-1'>
          <label className='block text-[10px] text-slate-500 mb-1'>RPE</label>
          <input
            type='number'
            value={rpe}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setRpe(e.target.value)}
            className='w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none'
            placeholder='1-10'
          />
        </div>
      </div>
      <button
        onClick={handleSave}
        disabled={isSaving}
        className='w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-xs font-bold py-2 rounded flex items-center justify-center gap-2 transition-colors'
      >
        {isSaving ? (
          "GUARDANDO..."
        ) : (
          <>
            <Save size={14} /> GUARDAR SERIE
          </>
        )}
      </button>

      {/* Sección de Temporizador Manual */}
      <div className='mt-4 p-3 bg-slate-900/40 rounded-xl border border-slate-700/50 shadow-inner'>
        <div className='flex items-center justify-between mb-3'>
          <div className='flex flex-col'>
            <span className='text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1.5'>
              <Clock
                size={12}
                className='text-blue-400'
              />{" "}
              Iniciar Descanso
            </span>
            <span className='text-[9px] text-slate-400'>
              {isLastInBlock
                ? configuredReps?.toLowerCase().includes("fallo") ||
                  parseInt(configuredReps || "0") < 8
                  ? "Ejercicio exigente: Descanso completo"
                  : "Fin de serie: Descanso estándar"
                : "Entre ejercicios de superserie: Descanso corto"}
            </span>
          </div>
          <div className='bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20'>
            <span className='text-[10px] text-blue-400 font-bold'>
              Sug: {getSuggestedRestTime()}s
            </span>
          </div>
        </div>

        <div className='flex gap-2'>
          {[30, 60, 90, 120, 180].map((seconds) => {
            const suggestedValue = getSuggestedRestTime();
            const isSuggested = seconds === suggestedValue;

            return (
              <button
                key={seconds}
                onClick={() => onTimerReset(seconds)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  isSuggested
                    ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20 scale-105 z-10"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-300"
                }`}
              >
                {seconds}s
              </button>
            );
          })}
        </div>
      </div>

      {/* Botones y Respuesta de GEMINI */}
      <div className='flex gap-2 mt-4 pt-4 border-t border-slate-700'>
        <button
          onClick={handleGenerateVariants}
          disabled={geminiLoading}
          className='flex-1 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white text-xs font-bold py-2 rounded flex items-center justify-center gap-2 transition-colors'
        >
          {geminiLoading && geminiResponseType === "variants" ? (
            <Loader
              size={14}
              className='animate-spin'
            />
          ) : (
            <>✨ Sugerir Variantes</>
          )}
        </button>
        <button
          onClick={handleAnalyzeHistory}
          disabled={geminiLoading || history.length === 0}
          className='flex-1 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 text-white text-xs font-bold py-2 rounded flex items-center justify-center gap-2 transition-colors'
        >
          {geminiLoading && geminiResponseType === "analysis" ? (
            <Loader
              size={14}
              className='animate-spin'
            />
          ) : (
            <>✨ Analizar Historial</>
          )}
        </button>
      </div>

      {geminiResponse && (
        <div
          className={`mt-4 p-3 rounded-lg border text-sm animate-in fade-in ${geminiResponseType === "variants" ? "bg-purple-900/30 border-purple-700/50" : "bg-amber-900/30 border-amber-700/50"}`}
        >
          <div className='flex justify-between items-start mb-2'>
            <h4 className='font-bold text-white flex items-center gap-2'>
              {geminiResponseType === "variants" ? (
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
              Asistente AI:
            </h4>
            <button
              onClick={() => setGeminiResponse(null)}
              className='text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded'
              aria-label='Cerrar'
            >
              <X size={16} />
            </button>
          </div>
          <div
            className='text-slate-300 whitespace-pre-wrap'
            dangerouslySetInnerHTML={{ __html: geminiResponse.replace(/\n/g, "<br/>") }}
          />
        </div>
      )}

      {recentLogs.length > 0 && (
        <div className='mt-4 border-t border-slate-700 pt-3'>
          <p className='text-[10px] text-slate-500 uppercase font-bold mb-2'>
            Últimos registros (Borrar)
          </p>
          <div className='space-y-2'>
            {recentLogs.map((log, idx) => (
              <div
                key={idx}
                className='flex justify-between items-center bg-slate-900/50 p-2 rounded border border-slate-800'
              >
                <span className='text-xs text-slate-300 font-mono'>
                  {new Date(log.date).toLocaleDateString()} -{" "}
                  <span className='text-white font-bold'>
                    {log.weight}kg x {log.reps}
                  </span>{" "}
                  x {log.sets}
                </span>
                <button
                  onClick={() => onDelete(exerciseName, log)}
                  className='text-red-400 hover:text-red-300 p-1 hover:bg-red-900/20 rounded'
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className='mt-4 h-24 bg-slate-900 rounded border border-slate-800 p-1'>
        <SimpleChart
          points={chartData}
          height={80}
          width={300}
        />
      </div>
    </div>
  );
};

export default ExerciseTracker;
