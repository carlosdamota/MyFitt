import React, { useState } from "react";
import { Flame, Dumbbell, Shield } from "lucide-react";
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
import RoutineTimer from "./RoutineTimer";
import { SocialShareModal } from "../common/SocialShareModal";
import RestTimer from "../common/RestTimer";

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
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  // Timer & Sharing Logic
  const { time, isRunning, toggle, stop, formatTime, reset } = useStopwatch();
  const { plan } = useEntitlement(user);
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);
  const [showSocialShare, setShowSocialShare] = useState(false);

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
      alert("¡Completa al menos un ejercicio antes de terminar!");
      return;
    }
    stop();
    setShowConfirmFinish(true);
  };

  const handleConfirmFinish = () => {
    setShowConfirmFinish(false);
    setShowSocialShare(true);
  };

  const handleCancelFinish = () => {
    setShowConfirmFinish(false);
    // If they cancel, do we resume? Or just stay stopped?
    // Let's stay stopped for now.
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

      {showProCta && (
        <ProUpgradeCta
          onRequireAuth={onRequireAuth}
          onShowSubscription={onShowSubscription}
        />
      )}

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
              onToggleComplete={onToggleComplete}
              onSaveLog={onSaveLog}
              onDeleteLog={onDeleteLog}
              onResetTimer={handleStartRest}
              onRequireAuth={onRequireAuth}
              onShowSubscription={onShowSubscription}
            />
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
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200'>
          <div className='bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4'>
            <h3 className='text-xl font-bold text-white'>¿Terminar entrenamiento?</h3>
            <p className='text-slate-400 text-sm'>
              Has entrenado durante{" "}
              <span className='text-blue-400 font-bold'>{formatTime(time)}</span>. ¿Quieres
              finalizar y guardar tu progreso?
            </p>
            <div className='flex gap-3 pt-2'>
              <button
                onClick={handleCancelFinish}
                className='flex-1 py-3 text-slate-400 hover:bg-slate-800 rounded-xl font-medium transition-colors'
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmFinish}
                className='flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors'
              >
                Terminar
              </button>
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
      {showRestTimer && restTimer > 0 && (
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
