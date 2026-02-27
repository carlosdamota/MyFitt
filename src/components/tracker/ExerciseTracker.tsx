import React, { useState, useMemo } from "react";
import { History, Trophy, Play } from "lucide-react";

import { calculatePersonalBests, isNewRecord, isBodyweightExercise } from "../../utils/stats";
import { useProfile } from "../../hooks/useProfile";
import type { User } from "firebase/auth";
import type { WorkoutLogEntry, UserStats } from "../../types";

// Sub-components
import SmartSuggestion from "./SmartSuggestion";
import SetEntryForm from "./SetEntryForm";
import ExerciseAIAssistant from "./ExerciseAIAssistant";
import RecentLogsList from "./RecentLogsList";

interface ExerciseTrackerProps {
  exerciseName: string;
  onSave: (exerciseName: string, entry: WorkoutLogEntry) => Promise<void>;
  onDelete: (exerciseName: string, entry: WorkoutLogEntry) => Promise<void>;
  history: WorkoutLogEntry[];
  stats: UserStats | null;
  onTimerReset: (duration?: number) => void;
  restTime?: number;
  user: User | null;
  isLastInBlock: boolean;
  configuredReps?: string;
  configuredSets?: string;
  intensity?: string;
  instructions?: string[];
  onMarkComplete?: () => void;
  onUnmarkComplete?: () => void;
  onRequireAuth?: () => void;
  isTimerRunning?: boolean;
}

interface SuggestionData {
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
  stats,
  onTimerReset,
  restTime,
  user,
  isLastInBlock,
  configuredReps,
  configuredSets,
  intensity,
  instructions,
  onMarkComplete,
  onUnmarkComplete,
  onRequireAuth,
  isTimerRunning,
}) => {
  const [weight, setWeight] = useState<string>("");
  const [reps, setReps] = useState<string>("");
  const [sets, setSets] = useState<string>("3");
  const [rpe, setRpe] = useState<string>("");
  const { profile } = useProfile(user);
  const userWeight = parseFloat(profile?.weight as string) || 70;
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [newRecordAlert, setNewRecordAlert] = useState<string | null>(null);

  // Calcular PBs históricos
  const personalBests = useMemo(() => {
    // Si tenemos stats del backend para este ejercicio, las usamos.
    if (stats?.personalBests?.[exerciseName]) {
      return stats.personalBests[exerciseName];
    }
    // Fallback: calcularlas localmente (necesario para los récords que ganes hoy antes de que el backend procese)
    return calculatePersonalBests(history);
  }, [history, stats, exerciseName]);

  // Detectar si el ejercicio es por tiempo (basado en el objetivo de la rutina)
  const isTimeBased = useMemo(() => {
    if (!configuredReps) return false;
    const lowerReps = configuredReps.toLowerCase();
    return lowerReps.includes("seg") || lowerReps.includes("min") || /\d+\s*s\b/.test(lowerReps);
  }, [configuredReps]);

  // Lógica de Sobrecarga Progresiva o Sugerencia Inicial
  const smartSuggestion = useMemo((): SuggestionData | null => {
    // CASO 1: No hay historial - Sugerir basado en objetivos de la rutina
    if (!history || history.length === 0) {
      if (!configuredReps) return null;

      // Intentar extraer el número máximo de reps si es un rango (ej. "10-12" -> 12)
      const repsMatch = configuredReps.match(/(\d+)(?!.*\d)/);
      const suggestedReps = repsMatch ? parseInt(repsMatch[1]) : 12;

      // Detectar si es peso corporal para sugerir 0kg
      const isBW = isBodyweightExercise(exerciseName);
      const suggestedWeight = isBW ? 0 : 0; // Por ahora 0 si no hay historial, pero marcamos la intención

      const unit = isTimeBased ? "Segs" : "Reps";
      let text = `Objetivo: ${suggestedReps} ${unit}`;
      if (intensity) text += ` (${intensity})`;
      if (isBW) text += " • Peso corporal";

      return {
        weight: suggestedWeight,
        reps: suggestedReps,
        text: text,
        type: "steady",
      };
    }

    // CASO 2: Hay historial - Lógica de Sobrecarga Progresiva
    const lastLog = [...history].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )[0];
    if (!lastLog) return null;

    const lastWeight = parseFloat(String(lastLog.weight)) || 0;
    const lastReps = parseFloat(String(lastLog.reps)) || 0;
    const lastRpe = parseFloat(String(lastLog.rpe)) || 8;

    if (lastRpe <= 7)
      return {
        weight: lastWeight + 2.5,
        reps: Math.max(6, lastReps - 2),
        text: `¡Muy fácil! Sube a ${lastWeight + 2.5}kg`,
        type: "increase",
      };
    if (lastRpe <= 8.5)
      return {
        weight: lastWeight,
        reps: lastReps + 1,
        text: `Buen ritmo. Busca ${lastReps + 1} ${isTimeBased ? "segs" : "reps"}`,
        type: "reps",
      };
    if (lastRpe >= 9.5)
      return {
        weight: lastWeight,
        reps: lastReps,
        text: `Exigente. Consolida técnica con ${lastWeight}kg`,
        type: "steady",
      };
    return { weight: lastWeight, reps: lastReps, text: "Mantén el ritmo actual", type: "steady" };
  }, [history, configuredReps, intensity, exerciseName]);

  const handleApplySuggestion = (): void => {
    if (!smartSuggestion) return;
    setWeight(smartSuggestion.weight.toString());
    setReps(smartSuggestion.reps.toString());
    setRpe(smartSuggestion.type === "steady" ? "8" : "");
  };

  const wrappedOnDelete = async (exercise: string, entry: WorkoutLogEntry) => {
    await onDelete(exercise, entry);
    // If the history length was 1, it means we just deleted the last log
    if (history.length === 1 && onUnmarkComplete) {
      onUnmarkComplete();
    }
  };

  const handleSave = async (): Promise<void> => {
    if (!weight || !reps) return;
    setIsSaving(true);
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

    // Auto-mark exercise as completed
    if (onMarkComplete) onMarkComplete();

    setIsSaving(false);
    setWeight("");
    setReps("");
    setRpe("");
  };

  const chartData = useMemo(
    () =>
      history.map((h) => {
        const w = parseFloat(String(h.weight)) || 0;
        const effectiveWeight = w === 0 && isBodyweightExercise(exerciseName) ? userWeight : w;
        return { date: h.date, val: effectiveWeight * (h.reps || 0) * (h.sets || 0) };
      }),
    [history, exerciseName, userWeight],
  );

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

  const [customRestTime, setCustomRestTime] = useState(getSuggestedRestTime());

  // Sync state if props change significantly, but allows user override
  React.useEffect(() => {
    setCustomRestTime(getSuggestedRestTime());
  }, [restTime, configuredReps, isLastInBlock]);

  return (
    <div className='mt-4 bg-white/90 dark:bg-surface-950/90 backdrop-blur-xl p-5 rounded-3xl border border-slate-200 dark:border-surface-800 shadow-sm dark:shadow-2xl relative overflow-hidden transition-colors'>
      <div className='absolute top-0 left-0 w-1 h-12 bg-linear-to-b from-blue-500 dark:from-cyan-400 to-transparent' />
      <div className='flex items-center justify-between mb-4'>
        <span className='text-xs text-slate-500 dark:text-slate-300 font-bold uppercase tracking-widest flex items-center gap-2 transition-colors'>
          <History
            size={16}
            className='text-blue-500 dark:text-primary-400'
          />
          Registrar Serie
        </span>

        {personalBests && (
          <div className='flex gap-2 transition-colors'>
            {personalBests.low && (
              <span className='text-[10px] bg-red-50 text-red-600 dark:bg-danger-500/10 dark:text-danger-300 px-2 py-0.5 rounded-lg border border-red-200 dark:border-danger-500/20'>
                🏆 {personalBests.low.weight}kg
              </span>
            )}
            {personalBests.mid && (
              <span className='text-[10px] bg-blue-50 text-blue-600 dark:bg-primary-500/10 dark:text-primary-300 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-primary-500/20'>
                🏅 {personalBests.mid.weight}kg
              </span>
            )}
          </div>
        )}
      </div>

      <SmartSuggestion
        suggestion={smartSuggestion}
        onApply={handleApplySuggestion}
      />

      {newRecordAlert && (
        <div className='mb-3 bg-amber-50 dark:bg-warning-500/10 border border-amber-200 dark:border-warning-500/20 p-2.5 rounded-xl flex items-center justify-center gap-2 animate-in zoom-in duration-300 shadow-sm dark:shadow-warning-900/10 transition-colors'>
          <Trophy
            size={16}
            className='text-amber-500 dark:text-warning-400 animate-bounce'
          />
          <span className='text-xs text-amber-600 dark:text-warning-200 font-bold uppercase tracking-wide'>
            {newRecordAlert}
          </span>
        </div>
      )}

      {isTimerRunning === false ? (
        <div className='relative'>
          <div className='opacity-30 pointer-events-none'>
            <SetEntryForm
              weight={weight}
              setWeight={setWeight}
              reps={reps}
              setReps={setReps}
              sets={sets}
              setSets={setSets}
              rpe={rpe}
              setRpe={setRpe}
              onSave={handleSave}
              isSaving={isSaving}
              isTimeBased={isTimeBased}
            />
          </div>
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='flex items-center gap-2 px-4 py-2.5 bg-white/95 dark:bg-surface-900/95 border border-slate-200 dark:border-primary-500/30 rounded-xl shadow-lg backdrop-blur-sm transition-colors'>
              <Play
                size={14}
                className='text-blue-500 dark:text-primary-400'
              />
              <span className='text-xs font-bold text-slate-600 dark:text-slate-300'>
                Pulsa Play para registrar
              </span>
            </div>
          </div>
        </div>
      ) : (
        <SetEntryForm
          weight={weight}
          setWeight={setWeight}
          reps={reps}
          setReps={setReps}
          sets={sets}
          setSets={setSets}
          rpe={rpe}
          setRpe={setRpe}
          onSave={handleSave}
          isSaving={isSaving}
          isTimeBased={isTimeBased}
        />
      )}

      <ExerciseAIAssistant
        user={user}
        exerciseName={exerciseName}
        history={history}
        instructions={instructions}
        onRequireAuth={onRequireAuth}
        actionSlot={
          <div className='p-2 sm:p-2 bg-slate-50 dark:bg-surface-950/80 rounded-xl border border-slate-200 dark:border-surface-800 flex items-center justify-between gap-2 h-full shadow-inner transition-colors'>
            <div className='hidden sm:flex items-center gap-1 pl-1'>
              <History
                size={14}
                className='text-blue-500 dark:text-primary-400'
              />
            </div>

            <div className='flex items-center gap-2 sm:gap-2 flex-1 justify-center sm:justify-start w-full px-2'>
              <button
                onClick={() => setCustomRestTime((prev) => Math.max(0, prev - 10))}
                className='w-8 h-8 sm:w-7 sm:h-7 rounded-lg bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-800 hover:border-slate-300 dark:hover:border-surface-700 flex items-center justify-center transition-all text-xs sm:text-[10px] shadow-sm'
              >
                -10
              </button>

              <div className='text-sm sm:text-sm font-mono font-bold text-slate-900 dark:text-white w-8 text-center transition-colors'>
                {customRestTime}
              </div>

              <button
                onClick={() => setCustomRestTime((prev) => prev + 10)}
                className='w-8 h-8 sm:w-7 sm:h-7 rounded-lg bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-800 hover:border-slate-300 dark:hover:border-surface-700 flex items-center justify-center transition-all text-xs sm:text-[10px] shadow-sm'
              >
                +10
              </button>

              <div className='h-4 w-px bg-slate-200 dark:bg-surface-800 mx-2 hidden sm:block transition-colors'></div>

              <button
                onClick={() => onTimerReset(customRestTime)}
                className='flex-1 sm:flex-none sm:ml-1 px-4 py-2 sm:px-3 sm:py-1.5 bg-linear-to-r from-blue-600 to-indigo-600 dark:from-primary-500 dark:to-indigo-500 hover:from-blue-500 hover:to-indigo-500 dark:hover:from-primary-400 dark:hover:to-indigo-400 text-white text-xs sm:text-[11px] font-bold uppercase rounded-lg shadow-sm dark:shadow-md dark:shadow-primary-500/20 transition-all active:scale-95 text-center border-none'
              >
                Inicio
              </button>
            </div>
          </div>
        }
      />

      <RecentLogsList
        logs={recentLogs}
        exerciseName={exerciseName}
        onDelete={wrappedOnDelete}
      />
    </div>
  );
};

export default ExerciseTracker;
