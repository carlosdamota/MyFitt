import React, { useState } from "react";
import {
  Activity,
  Dumbbell,
  Flame,
  Zap,
  Clock,
  CheckCircle,
  Circle,
  ChevronDown,
  Info,
  Edit,
  Shield,
  Crown,
} from "lucide-react";
import ExerciseIcon from "../icons/ExerciseIcons";
import ExerciseTracker from "../tracker/ExerciseTracker";
import type { User } from "firebase/auth";
import type { Routine, WorkoutLogs, WorkoutLogEntry } from "../../types";
import { useEntitlement } from "../../hooks/useEntitlement";

interface WorkoutDayProps {
  routine: Routine;
  dayKey: string;
  completedExercises: Record<string, boolean>;
  onToggleComplete: (dayKey: string, exerciseName: string) => void;
  onEditRoutine: () => void;
  onResetTimer: (duration?: number) => void;
  onSaveLog: (exerciseName: string, entry: WorkoutLogEntry) => Promise<void>;
  onDeleteLog: (exerciseName: string, entry: WorkoutLogEntry) => Promise<void>;
  workoutLogs: WorkoutLogs;
  user: User | null;
  onRequireAuth?: () => void;
  onShowSubscription?: () => void;
  isPro?: boolean;
}

const WorkoutDay: React.FC<WorkoutDayProps> = ({
  routine,
  dayKey,
  completedExercises,
  onToggleComplete,
  onEditRoutine,
  onResetTimer,
  onSaveLog,
  onDeleteLog,
  workoutLogs,
  user,
  onRequireAuth,
  onShowSubscription,
  isPro,
}) => {
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const { plan } = useEntitlement(user);

  // Use prop if available, otherwise fall back to hook
  const effectiveIsPro = isPro !== undefined ? isPro : plan === "pro";
  const showProCta = !!user && !effectiveIsPro;

  // Calculate progress
  const totalExercises = routine.blocks
    ? routine.blocks.reduce((acc, block) => acc + block.exercises.length, 0)
    : 0;

  const completedCount = routine.blocks
    ? routine.blocks.reduce((acc, block) => {
        return (
          acc + block.exercises.filter((ex) => completedExercises[`${dayKey}-${ex.name}`]).length
        );
      }, 0)
    : 0;

  const progressPercentage =
    totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;

  return (
    <>
      {/* Sticky Progress Header */}
      {totalExercises > 0 && (
        <div className='sticky top-0 z-30 -mx-4 px-4 py-3 bg-slate-950/80 backdrop-blur-md border-b border-white/5 mb-6 transition-all duration-300'>
          <div className='flex justify-between items-end mb-1'>
            <span className='text-xs font-bold text-slate-400 uppercase tracking-wider'>
              Tu Progreso
            </span>
            <span className='text-sm font-bold text-blue-400'>{progressPercentage}%</span>
          </div>
          <div className='h-1.5 w-full bg-slate-800 rounded-full overflow-hidden'>
            <div
              className='h-full bg-linear-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out'
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Routine Header Card */}
      <div
        className={`p-6 rounded-3xl border mb-6 ${routine.bg} ${routine.border} relative overflow-hidden group`}
      >
        <div className='absolute -right-4 -top-4 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-700'>
          <Dumbbell size={120} />
        </div>
        <div className='flex justify-between items-start mb-4 relative z-10'>
          <div>
            <h2 className='text-3xl font-black text-white mb-2 leading-tight'>{routine.title}</h2>
            <div className='flex items-center gap-3 text-sm text-slate-200/80'>
              <div className='flex items-center gap-1.5'>
                <Activity
                  size={16}
                  className='text-blue-300'
                />
                <span>{routine.focus}</span>
              </div>
              <span className='w-1 h-1 rounded-full bg-slate-400/50' />
              <div className='flex items-center gap-1.5'>
                <Clock
                  size={16}
                  className='text-purple-300'
                />
                <span>~{totalExercises * 5} min</span>
              </div>
            </div>
          </div>
          <button
            onClick={onEditRoutine}
            className='p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-white transition-all hover:scale-105 active:scale-95 border border-white/10 shadow-lg'
            aria-label='Editar rutina'
          >
            <Edit size={18} />
          </button>
        </div>

        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border bg-slate-950/20 backdrop-blur-sm ${
            routine.mode === "heavy"
              ? "border-red-500/30 text-red-200"
              : "border-green-500/30 text-green-200"
          }`}
        >
          {routine.mode === "heavy" ? (
            <Flame
              size={14}
              className='text-red-400'
            />
          ) : (
            <Zap
              size={14}
              className='text-green-400'
            />
          )}
          {routine.weight}
        </div>
      </div>

      {showProCta && (
        <div className='mb-6 p-1 rounded-2xl bg-linear-to-r from-amber-500/20 via-orange-500/20 to-red-500/20'>
          <div className='bg-slate-900/90 backdrop-blur-sm rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
            <div className='flex items-center gap-4'>
              <div className='p-3 rounded-2xl bg-linear-to-br from-amber-500/20 to-orange-600/20 text-amber-400 shadow-inner border border-amber-500/10'>
                <Crown size={24} />
              </div>
              <div>
                <p className='text-base font-bold text-white mb-0.5'>Desbloquea el Modo Pro</p>
                <p className='text-xs text-slate-400'>
                  Accede a rutinas avanzadas, métricas detalladas y tu IA Coach.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                if (onShowSubscription) {
                  onShowSubscription();
                } else {
                  onRequireAuth?.();
                }
              }}
              className='px-6 py-3 rounded-xl text-sm font-bold bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-0.5'
            >
              Mejorar Plan
            </button>
          </div>
        </div>
      )}

      {/* Warmup Section */}
      {routine.warmup && (
        <div className='bg-slate-900/40 border border-slate-800 rounded-2xl p-5 mb-8 flex items-start gap-4'>
          <div className='p-2.5 bg-orange-500/10 rounded-xl text-orange-400 shrink-0 border border-orange-500/10'>
            <Flame size={20} />
          </div>
          <div>
            <h3 className='text-sm font-bold text-slate-400 uppercase tracking-wider mb-2'>
              Calentamiento
            </h3>
            <p className='text-slate-300 text-sm leading-7'>{routine.warmup.text}</p>
          </div>
        </div>
      )}

      {/* Exercise Blocks */}
      <div className='space-y-6'>
        {routine.blocks && routine.blocks.length > 0 ? (
          routine.blocks.map((block, index) => (
            <div
              key={`${block.id}-${index}`}
              className='relative'
            >
              {/* Block Header */}
              <div className='flex items-center justify-between mb-3 px-1'>
                <span className='text-xs font-bold text-blue-400/80 uppercase tracking-widest pl-2 border-l-2 border-blue-500/50'>
                  BLOQUE {block.id} • SUPERSERIE
                </span>
                <button
                  onClick={() => onResetTimer(block.rest)}
                  className='group flex items-center gap-2 bg-slate-900/80 hover:bg-blue-600 hover:text-white text-slate-400 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors border border-slate-800 hover:border-blue-500 backdrop-blur-sm'
                >
                  <Clock size={12} />
                  <span>{block.rest}s DESCANSO</span>
                </button>
              </div>

              <div className='space-y-3'>
                {block.exercises.map((ex, i) => {
                  const exerciseKey = `${dayKey}-${ex.name}`;
                  const isCompleted = completedExercises[exerciseKey];
                  const isExpanded = expandedExercise === ex.name;

                  // Clean class construction
                  const cardClasses = `relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                    isCompleted
                      ? "bg-slate-950/40 border-slate-800/50 opacity-60 grayscale"
                      : "bg-slate-900/60 border-white/5 shadow-lg hover:border-white/10 hover:bg-slate-800/80 hover:shadow-xl backdrop-blur-md"
                  }`;

                  return (
                    <div
                      key={`${ex.name}-${i}`}
                      className={cardClasses}
                    >
                      {/* Active indicator strip */}
                      {!isCompleted && (
                        <div className='absolute left-0 top-0 bottom-0 w-1 bg-blue-500/50' />
                      )}

                      <div className='p-4 sm:p-5'>
                        <div className='flex items-center gap-4'>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleComplete(dayKey, ex.name);
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
                            onClick={() => setExpandedExercise(isExpanded ? null : ex.name)}
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
                                  {ex.name}
                                </h3>
                                <div className='flex items-center gap-2'>
                                  <span className='text-sm font-mono text-blue-400 bg-blue-900/20 px-1.5 rounded border border-blue-500/20'>
                                    {ex.reps}
                                  </span>
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

                        {/* Expandable Content */}
                        {isExpanded && (
                          <div className='mt-5 pt-5 border-t border-white/5 animate-in slide-in-from-top-2 duration-300'>
                            <div className='w-full h-48 bg-slate-950/50 rounded-xl border border-white/5 mb-4 overflow-hidden relative flex items-center justify-center p-4'>
                              {ex.svg_icon ? (
                                <div
                                  className='w-full h-full flex items-center justify-center [&>svg]:max-h-full [&>svg]:w-auto [&>svg]:text-white/90 [&>svg]:stroke-current [&>svg]:drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                                  dangerouslySetInnerHTML={{ __html: ex.svg_icon }}
                                />
                              ) : (
                                <ExerciseIcon type={ex.svg} />
                              )}
                              <div className='absolute inset-0 bg-linear-to-t from-slate-900/80 via-transparent to-transparent pointer-events-none' />
                            </div>

                            {ex.note && (
                              <div className='flex items-start gap-3 bg-blue-950/30 border border-blue-500/20 p-4 rounded-xl mb-4'>
                                <Info
                                  size={18}
                                  className='text-blue-400 shrink-0 mt-0.5'
                                />
                                <p className='text-sm text-blue-100/80 leading-relaxed'>
                                  {ex.note}
                                </p>
                              </div>
                            )}

                            <ExerciseTracker
                              exerciseName={ex.name}
                              onSave={onSaveLog}
                              onDelete={onDeleteLog}
                              history={workoutLogs[ex.name] || []}
                              onTimerReset={onResetTimer}
                              restTime={block.rest}
                              user={user}
                              isLastInBlock={i === block.exercises.length - 1}
                              configuredReps={ex.reps}
                              onRequireAuth={onRequireAuth}
                              onUpgrade={onShowSubscription}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className='p-12 text-center bg-slate-900/20 rounded-3xl border border-slate-800 border-dashed'>
            <div className='w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4 text-slate-600'>
              <Dumbbell size={32} />
            </div>
            <p className='text-slate-500 font-medium'>No hay ejercicios en esta rutina.</p>
          </div>
        )}
      </div>

      {/* Cooldown Section */}
      {routine.cooldown && (
        <div className='bg-slate-900/40 border border-slate-800 rounded-2xl p-5 mt-8 flex items-start gap-4'>
          <div className='p-2.5 bg-green-500/10 rounded-xl text-green-400 shrink-0 border border-green-500/10'>
            <Shield size={20} />
          </div>
          <div>
            <h3 className='text-sm font-bold text-slate-400 uppercase tracking-wider mb-2'>
              Vuelta a la Calma
            </h3>
            <p className='text-slate-300 text-sm leading-7'>{routine.cooldown.text}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkoutDay;
