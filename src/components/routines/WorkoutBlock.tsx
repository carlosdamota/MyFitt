import React from "react";
import { Clock } from "lucide-react";
import type { User } from "firebase/auth";
import type { RoutineBlock, WorkoutLogEntry, WorkoutLogs, UserStats } from "../../types";
import ExerciseCard from "./ExerciseCard";

interface WorkoutBlockProps {
  block: RoutineBlock;
  blockIndex: number;
  dayKey: string;
  completedExercises: Record<string, boolean>;
  expandedExerciseId: string | null;
  onSetExpandedExerciseId: (id: string | null) => void;
  workoutLogs: WorkoutLogs;
  stats: UserStats | null;
  user: User | null;
  onToggleComplete: (dayKey: string, exerciseName: string) => void;
  onSaveLog: (exerciseName: string, entry: WorkoutLogEntry) => Promise<void>;
  onDeleteLog: (exerciseName: string, entry: WorkoutLogEntry) => Promise<void>;
  onResetTimer: (duration?: number) => void;
  onRequireAuth?: () => void;
  isTimerRunning?: boolean;
}

const WorkoutBlock: React.FC<WorkoutBlockProps> = ({
  block,
  blockIndex,
  dayKey,
  completedExercises,
  expandedExerciseId,
  onSetExpandedExerciseId,
  workoutLogs,
  stats,
  user,
  onToggleComplete,
  onSaveLog,
  onDeleteLog,
  onResetTimer,
  onRequireAuth,
  isTimerRunning,
}) => {
  return (
    <div className='relative'>
      <div className='flex items-center justify-between mb-3 px-1 transition-colors'>
        <span className='text-xs font-bold text-blue-600 dark:text-blue-400/80 uppercase tracking-widest pl-2 border-l-2 border-blue-500/30 dark:border-blue-500/50 transition-colors'>
          BLOQUE {block.id} • {block.exercises.length > 1 ? "SUPERSERIE" : "SERIE"}
        </span>
        <div className='flex items-center gap-2 bg-blue-50 dark:bg-surface-900/80 text-blue-700 dark:text-slate-400 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-blue-200 dark:border-surface-800 backdrop-blur-sm transition-colors'>
          <Clock size={12} />
          <span>{block.rest}s DESCANSO</span>
        </div>
      </div>

      <div className='space-y-3'>
        {block.exercises.map((exercise, exerciseIndex) => {
          const completionKey = `${dayKey}-${exercise.name}`;
          const expandedId = `${block.id}-${blockIndex}-${exerciseIndex}-${exercise.name}`;
          const isExpanded = expandedExerciseId === expandedId;

          return (
            <ExerciseCard
              key={`${exercise.name}-${exerciseIndex}`}
              dayKey={dayKey}
              exercise={exercise}
              restTime={block.rest}
              isLastInBlock={exerciseIndex === block.exercises.length - 1}
              isCompleted={!!completedExercises[completionKey]}
              isExpanded={isExpanded}
              workoutLogs={workoutLogs}
              stats={stats}
              user={user}
              onToggleComplete={onToggleComplete}
              onToggleExpanded={() => onSetExpandedExerciseId(isExpanded ? null : expandedId)}
              onSaveLog={onSaveLog}
              onDeleteLog={onDeleteLog}
              onResetTimer={onResetTimer}
              onRequireAuth={onRequireAuth}
              isTimerRunning={isTimerRunning}
            />
          );
        })}
      </div>
    </div>
  );
};

export default WorkoutBlock;
