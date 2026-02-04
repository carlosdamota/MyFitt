import React, { useState, useMemo } from "react";
import { History, Trophy } from "lucide-react";
import SimpleChart from "../stats/SimpleChart";
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

  const applySuggestion = (): void => {
    if (!smartSuggestion) return;
    setWeight(smartSuggestion.weight.toString());
    setReps(smartSuggestion.reps.toString());
    setRpe(smartSuggestion.type === "steady" ? "8" : "");
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

  return (
    <div className='mt-4 bg-slate-800/50 p-3 rounded-xl border border-slate-700 shadow-xl'>
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
              <span className='text-[10px] bg-red-900/30 text-red-300 px-2 py-0.5 rounded-lg border border-red-800/30'>
                🏆 {personalBests.low.weight}kg
              </span>
            )}
            {personalBests.mid && (
              <span className='text-[10px] bg-blue-900/30 text-blue-300 px-2 py-0.5 rounded-lg border border-blue-800/30'>
                🏅 {personalBests.mid.weight}kg
              </span>
            )}
          </div>
        )}
      </div>

      <SmartSuggestion
        suggestion={smartSuggestion}
        onApply={applySuggestion}
      />

      {newRecordAlert && (
        <div className='mb-3 bg-yellow-500/10 border border-yellow-500/30 p-2.5 rounded-xl flex items-center justify-center gap-2 animate-in zoom-in duration-300 shadow-lg shadow-yellow-900/10'>
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

      <div className='mt-4 p-3 bg-slate-900/40 rounded-xl border border-slate-700/50'>
        <div className='flex items-center justify-between mb-3'>
          <span className='text-[10px] text-slate-500 font-bold uppercase'>Descanso</span>
          <span className='text-[10px] text-blue-400 font-bold'>
            Sug: {getSuggestedRestTime()}s
          </span>
        </div>
        <div className='flex gap-2'>
          {[30, 60, 90, 120, 180].map((s) => (
            <button
              key={s}
              onClick={() => onTimerReset(s)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${s === getSuggestedRestTime() ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"}`}
            >
              {s}s
            </button>
          ))}
        </div>
      </div>

      <ExerciseAIAssistant
        user={user}
        exerciseName={exerciseName}
        history={history}
      />

      <RecentLogsList
        logs={recentLogs}
        exerciseName={exerciseName}
        onDelete={onDelete}
      />

      {chartData.length > 0 && (
        <div className='mt-4 h-24 bg-slate-900/50 rounded-xl border border-slate-800 p-2'>
          <SimpleChart
            points={chartData}
            height={80}
            width={300}
          />
        </div>
      )}
    </div>
  );
};

export default ExerciseTracker;
