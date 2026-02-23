import React, { useState, useMemo, useEffect } from "react";
import { Flame, Dumbbell, Shield, Trophy } from "lucide-react";
import WorkoutProgressHeader from "./WorkoutProgressHeader";
import RoutineHeroCard from "./RoutineHeroCard";
import ProUpgradeCta from "./ProUpgradeCta";
import RoutineInfoSection from "./RoutineInfoSection";
import WorkoutBlock from "./WorkoutBlock";
import type { User } from "firebase/auth";
import type { Routine, WorkoutLogs, WorkoutLogEntry } from "../../types";
import { useEntitlement } from "../../hooks/useEntitlement";
import { useStopwatch } from "../../hooks/useStopwatch";
import { useTimer } from "../../hooks/useTimer";
import { useToast } from "../../hooks/useToast";
import RoutineTimer from "./RoutineTimer";
import { SocialShareModal } from "../common/SocialShareModal";
import RestTimer from "../common/RestTimer";
import { Button } from "../ui/Button";

interface WorkoutDayProps {
  routine: Routine;
  dayKey: string;
  onEditRoutine: () => void;
  onResetTimer: (duration?: number) => void;
  onSaveLog: (exerciseName: string, entry: WorkoutLogEntry) => Promise<void>;
  onDeleteLog: (exerciseName: string, entry: WorkoutLogEntry) => Promise<void>;
  workoutLogs: WorkoutLogs;
  user: User | null;
  onRequireAuth?: () => void;
  isPro?: boolean;
  onFlushSession?: (metadata: { duration?: string; routineTitle?: string }) => Promise<void>;
  onClearSession?: () => void;
}

const WorkoutDay: React.FC<WorkoutDayProps> = ({
  routine,
  dayKey,
  onEditRoutine,
  onResetTimer,
  onSaveLog,
  onDeleteLog,
  workoutLogs,
  user,
  onRequireAuth,
  isPro,
  onFlushSession,
  onClearSession,
}) => {
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const { error, info, success } = useToast();

  // Derivar ejercicios completados desde los logs de hoy
  const completedExercises = useMemo(() => {
    const today = new Date().toDateString();
    const completed: Record<string, boolean> = {};

    if (routine.blocks) {
      routine.blocks.forEach((block) => {
        block.exercises.forEach((ex) => {
          const logs = workoutLogs[ex.name] || [];
          const hasLogToday = logs.some((l) => new Date(l.date).toDateString() === today);
          if (hasLogToday) {
            completed[`${dayKey}-${ex.name}`] = true;
          }
        });
      });
    }
    return completed;
  }, [routine, workoutLogs, dayKey]);

  const handleToggleComplete = (dk: string, exName: string, isManual: boolean = true) => {
    const isActuallyCompleted = completedExercises[`${dk}-${exName}`];
    if (isManual) {
      if (!isActuallyCompleted) {
        info("Registra al menos una serie para marcar este ejercicio como completado.");
      } else {
        info("El ejercicio está completado porque tiene series registradas hoy.");
      }
    }
  };
  // Timer & Sharing Logic
  const { time, isRunning, toggle, stop, formatTime, reset } = useStopwatch();
  const { plan } = useEntitlement(user);
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);
  const [showSocialShare, setShowSocialShare] = useState(false);
  const flushTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Rest Timer Logic
  const {
    timer: restTimer,
    isTimerRunning: isRestTimerRunning,
    resetTimer: resetRestTimer,
    toggleTimer: toggleRestTimer,
    setTimer: setRestTimer,
  } = useTimer(0);
  const [showRestTimer, setShowRestTimer] = useState(false);

  const handleStartRest = (duration: number = 60) => {
    const validDuration = duration || 60;
    resetRestTimer(validDuration);
    setShowRestTimer(true);
  };

  const handleCloseRestTimer = () => {
    setShowRestTimer(false);
    resetRestTimer(0);
  };

  // Validation: Can only stop if at least one exercise is done
  const handleStopTimer = () => {
    // We need to calculate completedCount first, or access it from the render scope.
    // Since completedCount is derived below, let's use a ref or just move the derivation up?
    // Better to move the derivation up.
    if (completedCount === 0) {
      error("¡Completa al menos un ejercicio antes de terminar!");
      return;
    }
    stop();
    setShowConfirmFinish(true);
  };

  const handleConfirmFinish = async () => {
    setShowConfirmFinish(false);

    if (!onFlushSession) {
      setShowSocialShare(true);
      return;
    }

    // Delayed flush with undo capability
    let cancelled = false;

    success("✅ Sesión guardada", {
      label: "Deshacer",
      onClick: () => {
        cancelled = true;
        if (flushTimerRef.current) {
          clearTimeout(flushTimerRef.current);
          flushTimerRef.current = null;
        }
        info("Sesión restaurada. Puedes seguir editando.");
      },
    });

    // Flush after 5 seconds unless undone
    flushTimerRef.current = setTimeout(async () => {
      if (cancelled) return;
      try {
        await onFlushSession({
          duration: formatTime(time),
          routineTitle: routine?.title,
        });
      } catch (e) {
        error("Error guardando la sesión. Tus datos están seguros localmente.");
        return;
      }
      setShowSocialShare(true);
      reset();
    }, 5000);
  };

  const handleCancelFinish = () => {
    setShowConfirmFinish(false);
    // Stay stopped, don't clear session — user may resume later
  };

  // Use prop if available, otherwise fall back to hook
  const effectiveIsPro = isPro !== undefined ? isPro : plan === "pro";
  const showProCta = !!user && !effectiveIsPro;

  // Calculate progress (Moved up for validation)
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
      <WorkoutProgressHeader
        totalExercises={totalExercises}
        progressPercentage={progressPercentage}
      />

      <RoutineHeroCard
        routine={routine}
        totalExercises={totalExercises}
        onEditRoutine={onEditRoutine}
      />

      <RoutineTimer
        timeFormatted={formatTime(time)}
        isRunning={isRunning}
        onToggle={toggle}
        onStop={handleStopTimer}
        className='mb-8'
      />

      {showProCta && <ProUpgradeCta />}

      {/* Warmup Section */}
      {routine.warmup && (
        <RoutineInfoSection
          title='Calentamiento'
          text={routine.warmup.text}
          icon={<Flame size={20} />}
          tone='warmup'
          className='mb-8'
        />
      )}

      {/* Exercise Blocks */}
      <div className='space-y-6'>
        {routine.blocks && routine.blocks.length > 0 ? (
          routine.blocks.map((block, index) => (
            <WorkoutBlock
              key={`${block.id}-${index}`}
              block={block}
              blockIndex={index}
              dayKey={dayKey}
              completedExercises={completedExercises}
              expandedExerciseId={expandedExerciseId}
              onSetExpandedExerciseId={setExpandedExerciseId}
              workoutLogs={workoutLogs}
              user={user}
              onToggleComplete={handleToggleComplete}
              onSaveLog={onSaveLog}
              onDeleteLog={onDeleteLog}
              onResetTimer={handleStartRest}
              onRequireAuth={onRequireAuth}
              isTimerRunning={isRunning}
            />
          ))
        ) : (
          <div className='p-12 text-center bg-slate-50/50 dark:bg-surface-900/20 rounded-3xl border border-slate-200 dark:border-surface-800 border-dashed transition-colors'>
            <div className='w-16 h-16 rounded-full bg-slate-100 dark:bg-surface-800/50 flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-slate-600 transition-colors'>
              <Dumbbell size={32} />
            </div>
            <p className='text-slate-500 dark:text-slate-500 font-medium transition-colors'>
              No hay ejercicios en esta rutina.
            </p>
          </div>
        )}
      </div>

      {/* Cooldown Section */}
      {routine.cooldown && (
        <RoutineInfoSection
          title='Vuelta a la Calma'
          text={routine.cooldown.text}
          icon={<Shield size={20} />}
          tone='cooldown'
          className='mt-8 mb-8'
        />
      )}

      {/* Timer at the bottom as well */}
      <RoutineTimer
        timeFormatted={formatTime(time)}
        isRunning={isRunning}
        onToggle={toggle}
        onStop={handleStopTimer}
        className='mb-8'
      />

      {/* Rest Timer Overlay */}

      {/* Confirmation Dialog */}
      {showConfirmFinish && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 dark:bg-surface-950/80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200 transition-colors'>
          <div className='relative bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-700/50 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-xl dark:shadow-2xl overflow-hidden transition-colors'>
            {/* Background Glows */}
            <div className='absolute -top-24 -right-24 w-48 h-48 bg-primary-500/20 rounded-full blur-3xl pointer-events-none' />
            <div className='absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none' />

            <div className='relative z-10'>
              <div className='w-14 h-14 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mb-6 shadow-inner'>
                <Trophy
                  size={28}
                  className='text-primary-400'
                />
              </div>
              <h3 className='text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight transition-colors'>
                ¿Terminar entrenamiento?
              </h3>
              <p className='text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-8 transition-colors'>
                Has entrenado durante{" "}
                <span className='inline-block px-2 py-0.5 bg-slate-100 dark:bg-surface-800 rounded-lg text-blue-600 dark:text-primary-400 font-bold border border-slate-200 dark:border-surface-700/50 transition-colors'>
                  {formatTime(time)}
                </span>
                . ¿Quieres finalizar y guardar tu progreso?
              </p>

              <div className='flex gap-3'>
                <Button
                  variant='ghost'
                  onClick={handleCancelFinish}
                  className='flex-1 py-3 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-surface-800/50 hover:bg-slate-200 dark:hover:bg-surface-700 hover:text-slate-900 dark:hover:text-white rounded-xl font-bold transition-all border border-slate-200 dark:border-surface-700/50'
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmFinish}
                  className='flex-1 py-3 bg-linear-to-r from-blue-600 to-indigo-600 dark:from-primary-500 dark:to-indigo-500 hover:from-blue-500 hover:to-indigo-500 dark:hover:from-primary-400 dark:hover:to-indigo-400 text-white rounded-xl font-bold shadow-md dark:shadow-shadow-lg shadow-blue-500/25 dark:shadow-primary-500/25 transition-all outline-none border-none'
                >
                  Terminar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Social Share Modal */}
      <SocialShareModal
        isOpen={showSocialShare}
        onClose={() => setShowSocialShare(false)}
        date={new Date().toISOString()} // Or just use current date
        duration={formatTime(time)}
        logs={(() => {
          // Gather logs for *this routine's exercises* for *today*
          // We need to look at workoutLogs[dayKey]? But wait, workoutLogs structure is Record<exerciseName, WorkoutLogEntry[]>
          // We want the logs meant for display.
          const today = new Date().toDateString();
          const entries: (WorkoutLogEntry & { exercise: string; volume: number })[] = [];

          if (routine.blocks) {
            routine.blocks.forEach((block) => {
              block.exercises.forEach((ex) => {
                const logs = workoutLogs[ex.name] || [];
                // Find logs from today? Or just the last one?
                // Usually social share shows the metrics of what you JUST did.
                // Assuming the user logged data *today*.
                const todayLogs = logs.filter((l) => new Date(l.date).toDateString() === today);

                // If multiple sets, maybe aggregate? The SocialShareCard expects one entry per exercise usually?
                // Or maybe it Lists sets x reps.
                // Let's summarize: Max weight used? Total Reps?
                // Providing the "best" set or valid sets.
                // For simplicity, let's take the last log entry if exists, or aggregate volume.

                todayLogs.forEach((log) => {
                  entries.push({
                    ...log,
                    exercise: ex.name,
                    volume: (log.weight || 0) * (log.sets || 0) * (log.reps || 0),
                  });
                });
              });
            });
          }

          // Deduplicate? If users logged multiple times for same exercise?
          // Let's just take the most recent one per exercise for the card to keep it clean,
          // OR let the card handle the list. The card map shows all logs passed.
          // Limit to unique exercises for cleaner card?
          // Let's group by exercise name and take the one with highest volume.
          const uniqueEntriesMap = new Map<
            string,
            WorkoutLogEntry & { exercise: string; volume: number }
          >();
          entries.forEach((e) => {
            const existing = uniqueEntriesMap.get(e.exercise);
            if (!existing || e.volume > existing.volume) {
              uniqueEntriesMap.set(e.exercise, e);
            }
          });

          return Array.from(uniqueEntriesMap.values());
        })()}
      />

      {/* Rest Timer Overlay */}
      {showRestTimer && (
        <RestTimer
          timeLeft={restTimer}
          isRunning={isRestTimerRunning}
          onToggle={toggleRestTimer}
          onAdd={(secs) => setRestTimer((prev) => Math.max(0, prev + secs))}
          onSkip={handleCloseRestTimer}
          onClose={handleCloseRestTimer}
          timeFormatted={formatTime(restTimer)} // Reusing formatTime from stopwatch
        />
      )}
    </>
  );
};

export default WorkoutDay;
