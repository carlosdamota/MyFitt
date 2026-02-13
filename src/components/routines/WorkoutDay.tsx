import React, { useState } from "react";
import {
  Flame,
  Dumbbell,
  Shield,
} from "lucide-react";
import WorkoutProgressHeader from "./WorkoutProgressHeader";
import RoutineHeroCard from "./RoutineHeroCard";
import ProUpgradeCta from "./ProUpgradeCta";
import RoutineInfoSection from "./RoutineInfoSection";
import WorkoutBlock from "./WorkoutBlock";
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
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
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
      <WorkoutProgressHeader
        totalExercises={totalExercises}
        progressPercentage={progressPercentage}
      />

      <RoutineHeroCard
        routine={routine}
        totalExercises={totalExercises}
        onEditRoutine={onEditRoutine}
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
              onResetTimer={onResetTimer}
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
          className='mt-8'
        />
      )}
    </>
  );
};

export default WorkoutDay;
