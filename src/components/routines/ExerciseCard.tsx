import React from "react";
import { CheckCircle, ChevronDown, Circle, Info } from "lucide-react";
import type { User } from "firebase/auth";
import type { Exercise, WorkoutLogEntry, WorkoutLogs } from "../../types";
import ExerciseTracker from "../tracker/ExerciseTracker";
import ExerciseVisual from "./ExerciseVisual";

interface ExerciseCardProps {
  dayKey: string;
  exercise: Exercise;
  restTime: number;
  isLastInBlock: boolean;
  isCompleted: boolean;
  isExpanded: boolean;
  workoutLogs: WorkoutLogs;
  user: User | null;
  onToggleComplete: (dayKey: string, exerciseName: string) => void;
  onToggleExpanded: () => void;
  onSaveLog: (exerciseName: string, entry: WorkoutLogEntry) => Promise<void>;
  onDeleteLog: (exerciseName: string, entry: WorkoutLogEntry) => Promise<void>;
  onResetTimer: (duration?: number) => void;
  onRequireAuth?: () => void;
  onShowSubscription?: () => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  dayKey,
  exercise,
  restTime,
  isLastInBlock,
  isCompleted,
  isExpanded,
  workoutLogs,
  user,
  onToggleComplete,
  onToggleExpanded,
  onSaveLog,
  onDeleteLog,
  onResetTimer,
  onRequireAuth,
  onShowSubscription,
}) => {
  const cardClasses = `relative overflow-hidden rounded-2xl border transition-all duration-300 ${
    isCompleted
      ? "bg-slate-950/40 border-slate-800/50 opacity-60 grayscale"
      : "bg-slate-900/60 border-white/5 shadow-lg hover:border-white/10 hover:bg-slate-800/80 hover:shadow-xl backdrop-blur-md"
  }`;

  return (
    <div className={cardClasses}>
      {!isCompleted && <div className='absolute left-0 top-0 bottom-0 w-1 bg-blue-500/50' />}

      <div className='p-4 sm:p-5'>
        <div className='flex items-center gap-4'>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(dayKey, exercise.name);
            }}
            className={`shrink-0 transition-transform duration-200 active:scale-90 ${
              isCompleted ? "text-green-500" : "text-slate-600 hover:text-blue-500"
            }`}
          >
            {isCompleted ? (
              <CheckCircle
                size={32}
                className='fill-green-500/20'
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
                  className={`font-bold text-lg leading-tight mb-1 ${
                    isCompleted
                      ? "text-slate-500 line-through decoration-2 decoration-slate-700"
                      : "text-white"
                  }`}
                >
                  {exercise.name}
                </h3>
                <div className='flex items-center gap-2 mt-1'>
                  {exercise.sets && (
                    <span className='text-xs font-bold text-slate-300 bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700'>
                      {exercise.sets} SERIES
                    </span>
                  )}
                  <span className='text-xs font-mono text-blue-400 bg-blue-900/20 px-2 py-0.5 rounded border border-blue-500/20'>
                    {exercise.reps} REPS
                  </span>
                  {exercise.intensity && (
                    <span className='text-[10px] font-bold text-amber-500/80 bg-amber-900/10 px-1.5 py-0.5 rounded border border-amber-500/20'>
                      {exercise.intensity}
                    </span>
                  )}
                </div>
              </div>
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full bg-slate-800/50 text-slate-400 transition-all duration-300 ${
                  isExpanded
                    ? "rotate-180 bg-slate-700 text-white"
                    : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                <ChevronDown size={18} />
              </div>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className='mt-5 pt-5 border-t border-white/5 animate-in slide-in-from-top-2 duration-300'>
            <div className='w-full h-48 bg-slate-950/50 rounded-xl border border-white/5 mb-4 overflow-hidden relative flex items-center justify-center p-4'>
              <ExerciseVisual
                name={exercise.name}
                svg={exercise.svg}
                svgIcon={exercise.svg_icon}
              />
              <div className='absolute inset-0 bg-linear-to-t from-slate-900/80 via-transparent to-transparent pointer-events-none' />
            </div>

            {exercise.note && (
              <div className='flex items-start gap-3 bg-blue-950/30 border border-blue-500/20 p-4 rounded-xl mb-4'>
                <Info
                  size={18}
                  className='text-blue-400 shrink-0 mt-0.5'
                />
                <p className='text-sm text-blue-100/80 leading-relaxed'>{exercise.note}</p>
              </div>
            )}

            <ExerciseTracker
              exerciseName={exercise.name}
              onSave={onSaveLog}
              onDelete={onDeleteLog}
              history={workoutLogs[exercise.name] || []}
              onTimerReset={onResetTimer}
              restTime={restTime}
              user={user}
              isLastInBlock={isLastInBlock}
              configuredReps={exercise.reps}
              instructions={exercise.instructions}
              onMarkComplete={() => {
                if (!isCompleted) onToggleComplete(dayKey, exercise.name);
              }}
              onUnmarkComplete={() => {
                if (isCompleted) onToggleComplete(dayKey, exercise.name);
              }}
              onRequireAuth={onRequireAuth}
              onUpgrade={onShowSubscription}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseCard;
