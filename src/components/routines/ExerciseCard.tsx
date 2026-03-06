import React, { useMemo } from "react";
import { CheckCircle, ChevronDown, Circle, Info } from "lucide-react";
import type { User } from "firebase/auth";
import type { Exercise, WorkoutLogEntry, WorkoutLogs, UserStats } from "../../types";
import ExerciseTracker from "../tracker/ExerciseTracker";
import ExerciseVisual from "./ExerciseVisual";
import { useNormalizedExercises } from "../../hooks/useNormalizedExercises";
import { findExerciseByName } from "../../utils/exerciseMatcher";

interface ExerciseCardProps {
  dayKey: string;
  exercise: Exercise;
  restTime: number;
  isLastInBlock: boolean;
  isCompleted: boolean;
  isExpanded: boolean;
  workoutLogs: WorkoutLogs;
  stats: UserStats | null;
  user: User | null;
  onToggleComplete: (dayKey: string, exerciseName: string, isManual?: boolean) => void;
  onToggleExpanded: () => void;
  onSaveLog: (exerciseName: string, entry: WorkoutLogEntry) => Promise<void>;
  onDeleteLog: (exerciseName: string, entry: WorkoutLogEntry) => Promise<void>;
  onResetTimer: (duration?: number) => void;
  onRequireAuth?: () => void;
  isTimerRunning?: boolean;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  dayKey,
  exercise,
  restTime,
  isLastInBlock,
  isCompleted,
  isExpanded,
  workoutLogs,
  stats,
  user,
  onToggleComplete,
  onToggleExpanded,
  onSaveLog,
  onDeleteLog,
  onResetTimer,
  onRequireAuth,
  isTimerRunning,
}) => {
  const { data: normalizedExercises } = useNormalizedExercises();

  // Priority: exerciseId → normalizedId → fuzzy name match
  const normalizedData = useMemo(() => {
    if (!normalizedExercises) return undefined;
    const lookupId = exercise.exerciseId || exercise.normalizedId;
    if (lookupId && normalizedExercises[lookupId]) {
      return normalizedExercises[lookupId];
    }
    // Fallback: fuzzy match by exercise name
    return findExerciseByName(exercise.name, normalizedExercises);
  }, [normalizedExercises, exercise.exerciseId, exercise.normalizedId, exercise.name]);

  const displayName = normalizedData?.name || exercise.name;
  const displaySvg = normalizedData?.svgIcon || exercise.svg;
  const displayImageUrl = normalizedData?.gifUrl || normalizedData?.imageUrl || undefined;

  const cardClasses = `relative overflow-hidden rounded-3xl border transition-all duration-300 ${
    isCompleted
      ? "bg-slate-50 dark:bg-surface-950/40 border-slate-200 dark:border-surface-800/50 opacity-60 grayscale"
      : "bg-white dark:bg-surface-900 border-slate-200 dark:border-surface-800 shadow-sm dark:shadow-xl hover:bg-slate-50 hover:border-slate-300 dark:hover:bg-surface-800/80 dark:hover:border-surface-700/80"
  }`;

  return (
    <div className={cardClasses}>
      {!isCompleted && (
        <div className='absolute left-0 top-0 bottom-0 w-1 bg-blue-500 dark:bg-blue-500/50 transition-colors' />
      )}

      <div className='p-3 sm:p-4'>
        <div className='flex items-center gap-3'>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(dayKey, exercise.name, true);
            }}
            className={`shrink-0 transition-transform duration-200 active:scale-90 ${
              isCompleted
                ? "text-success-500"
                : "text-slate-400 dark:text-slate-600 hover:text-blue-500 dark:hover:text-primary-500 transition-colors"
            }`}
          >
            {isCompleted ? (
              <CheckCircle
                size={32}
                className='fill-success-500/20'
              />
            ) : (
              <Circle
                size={32}
                strokeWidth={1.5}
              />
            )}
          </button>

          <div
            className='flex-1 cursor-pointer'
            onClick={onToggleExpanded}
          >
            <div className='flex justify-between items-center'>
              <div>
                <h3
                  className={`font-bold text-base sm:text-lg leading-tight mb-0.5 transition-colors ${
                    isCompleted
                      ? "text-slate-400 dark:text-slate-500 line-through decoration-2 decoration-slate-300 dark:decoration-slate-700"
                      : "text-slate-900 dark:text-slate-100"
                  }`}
                >
                  {displayName}
                </h3>
                <div className='flex items-center gap-1.5 mt-1.5 flex-wrap'>
                  {exercise.sets && (
                    <span className='text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-surface-800/50 px-2 py-0.5 rounded-full border border-slate-200 dark:border-surface-700 transition-colors uppercase tracking-tight'>
                      {exercise.sets} Ser.
                    </span>
                  )}
                  {(() => {
                    const repsValue = exercise.reps.toLowerCase();
                    const isTime =
                      repsValue.includes("seg") ||
                      repsValue.includes("min") ||
                      /\d+\s*s\b/.test(repsValue);
                    return (
                      <span className='text-[10px] font-bold text-blue-600 dark:text-primary-400 bg-blue-50 dark:bg-primary-950/30 px-2 py-0.5 rounded-full border border-blue-200 dark:border-primary-500/20 transition-colors uppercase tracking-tight'>
                        {exercise.reps} {!isTime && "Reps"}
                      </span>
                    );
                  })()}
                  {exercise.intensity && (
                    <span className='text-[10px] font-bold text-amber-600 dark:text-warning-500/80 bg-amber-50 dark:bg-warning-900/10 px-2 py-0.5 rounded-full border border-amber-200 dark:border-warning-500/20 transition-colors uppercase tracking-tight'>
                      {exercise.intensity}
                    </span>
                  )}
                </div>
              </div>
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-surface-800/50 text-slate-500 dark:text-slate-400 transition-all duration-300 ${
                  isExpanded
                    ? "rotate-180 bg-slate-200 dark:bg-surface-700 text-slate-900 dark:text-white"
                    : "hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-surface-800 dark:hover:text-white"
                }`}
              >
                <ChevronDown size={18} />
              </div>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className='mt-3 pt-3 border-t border-slate-200 dark:border-white/5 animate-in slide-in-from-top-2 duration-300 transition-colors'>
            <div className='flex gap-3 mb-3 items-center'>
              <div className='w-24 h-24 sm:w-28 sm:h-28 bg-slate-100 dark:bg-surface-950 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden relative flex items-center justify-center p-1 shrink-0 transition-colors'>
                <ExerciseVisual
                  name={displayName}
                  svg={displaySvg}
                  svgIcon={exercise.svg_icon}
                  imageUrl={displayImageUrl}
                />
              </div>

              {exercise.note && (
                <div className='flex-1 flex items-start gap-2 py-1.5 px-1 border-l-2 border-primary-500/30 dark:border-primary-500/50 transition-colors'>
                  <Info
                    size={14}
                    className='text-primary-500 dark:text-primary-400 shrink-0 mt-0.5 transition-colors'
                  />
                  <p className='text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed transition-colors'>
                    {exercise.note}
                  </p>
                </div>
              )}
            </div>

            <ExerciseTracker
              exerciseName={exercise.name}
              onSave={onSaveLog}
              onDelete={onDeleteLog}
              history={workoutLogs[exercise.name] || []}
              stats={stats}
              onTimerReset={onResetTimer}
              restTime={restTime}
              user={user}
              isLastInBlock={isLastInBlock}
              configuredReps={exercise.reps}
              configuredSets={exercise.sets?.toString()}
              intensity={exercise.intensity}
              instructions={exercise.instructions}
              isTimerRunning={isTimerRunning}
              onMarkComplete={() => {
                if (!isCompleted) onToggleComplete(dayKey, exercise.name);
              }}
              onUnmarkComplete={() => {
                if (isCompleted) onToggleComplete(dayKey, exercise.name);
              }}
              onRequireAuth={onRequireAuth}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseCard;
