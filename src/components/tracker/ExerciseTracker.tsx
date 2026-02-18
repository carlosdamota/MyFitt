import React, { useState, useMemo } from "react";
import { History, Trophy } from "lucide-react";

import { calculatePersonalBests, isNewRecord, isBodyweightExercise } from "../../utils/stats";
import { useProfile } from "../../hooks/useProfile";
import type { User } from "firebase/auth";
import type { WorkoutLogEntry } from "../../types";

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
  onTimerReset: (duration?: number) => void;
  restTime?: number;
  user: User | null;
  isLastInBlock: boolean;
  configuredReps?: string;
  instructions?: string[];
  onMarkComplete?: () => void;
  onUnmarkComplete?: () => void;
  onRequireAuth?: () => void;
  onUpgrade?: () => void;
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
  onTimerReset,
  restTime,
  user,
  isLastInBlock,
  configuredReps,
  instructions,
  onMarkComplete,
  onUnmarkComplete,
  onRequireAuth,
  onUpgrade,
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
  const personalBests = useMemo(() => calculatePersonalBests(history), [history]);

  // Lógica de Sobrecarga Progresiva
  const smartSuggestion = useMemo((): SuggestionData | null => {
    if (!history || history.length === 0) return null;
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
        text: `Buen ritmo. Busca ${lastReps + 1} reps`,
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
  }, [history]);

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
    <div className='mt-4 bg-slate-900/40 backdrop-blur-md p-4 rounded-2xl border border-white/5 shadow-xl'>
      <div className='flex items-center justify-between mb-3'>
        <span className='text-xs text-slate-400 font-bold uppercase flex items-center gap-1.5'>
          <History
            size={14}
            className='text-blue-400'
          />{" "}
          Registrar Serie
        </span>

        {personalBests && (
          <div className='flex gap-2'>
            {personalBests.low && (
              <span className='text-[10px] bg-red-500/10 text-red-300 px-2 py-0.5 rounded-lg border border-red-500/20'>
                🏆 {personalBests.low.weight}kg
              </span>
            )}
            {personalBests.mid && (
              <span className='text-[10px] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded-lg border border-blue-500/20'>
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
        <div className='mb-3 bg-yellow-500/10 border border-yellow-500/20 p-2.5 rounded-xl flex items-center justify-center gap-2 animate-in zoom-in duration-300 shadow-lg shadow-yellow-900/10'>
          <Trophy
            size={16}
            className='text-yellow-400 animate-bounce'
          />
          <span className='text-xs text-yellow-200 font-bold uppercase tracking-wide'>
            {newRecordAlert}
          </span>
        </div>
      )}

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
      />

      <ExerciseAIAssistant
        user={user}
        exerciseName={exerciseName}
        history={history}
        instructions={instructions}
        onRequireAuth={onRequireAuth}
        onUpgrade={onUpgrade}
        actionSlot={
          <div className='p-2 sm:p-1.5 bg-slate-900/60 rounded-xl border border-white/5 flex items-center justify-between gap-2 h-full'>
            <div className='hidden sm:flex items-center gap-1 pl-1'>
              <History
                size={12}
                className='text-blue-400'
              />
            </div>

            <div className='flex items-center gap-2 sm:gap-1 flex-1 justify-center sm:justify-end w-full'>
              <button
                onClick={() => setCustomRestTime((prev) => Math.max(0, prev - 10))}
                className='w-8 h-8 sm:w-6 sm:h-6 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors text-xs sm:text-[10px]'
              >
                -10
              </button>

              <div className='text-sm sm:text-xs font-mono font-bold text-white w-8 text-center'>
                {customRestTime}
              </div>

              <button
                onClick={() => setCustomRestTime((prev) => prev + 10)}
                className='w-8 h-8 sm:w-6 sm:h-6 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors text-xs sm:text-[10px]'
              >
                +10
              </button>

              <div className='h-4 w-px bg-white/10 mx-1 hidden sm:block'></div>

              <button
                onClick={() => onTimerReset(customRestTime)}
                className='flex-1 sm:flex-none sm:ml-1 px-3 py-1.5 sm:px-2 sm:py-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white text-xs sm:text-[10px] font-bold uppercase rounded-lg border border-blue-500/30 transition-all active:scale-95 text-center'
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
