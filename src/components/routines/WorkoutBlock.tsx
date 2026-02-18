import React from "react";
import { Clock } from "lucide-react";
import type { User } from "firebase/auth";
import type { RoutineBlock, WorkoutLogEntry, WorkoutLogs } from "../../types";
import ExerciseCard from "./ExerciseCard";

interface WorkoutBlockProps {
  block: RoutineBlock;
  blockIndex: number;
  dayKey: string;
  completedExercises: Record<string, boolean>;
  expandedExerciseId: string | null;
  onSetExpandedExerciseId: (id: string | null) => void;
  workoutLogs: WorkoutLogs;
  user: User | null;
  onToggleComplete: (dayKey: string, exerciseName: string) => void;
  onSaveLog: (exerciseName: string, entry: WorkoutLogEntry) => Promise<void>;
  onDeleteLog: (exerciseName: string, entry: WorkoutLogEntry) => Promise<void>;
  onResetTimer: (duration?: number) => void;
  onRequireAuth?: () => void;
}

const WorkoutBlock: React.FC<WorkoutBlockProps> = ({
  block,
  blockIndex,
  dayKey,
  completedExercises,
  expandedExerciseId,
  onSetExpandedExerciseId,
  workoutLogs,
  user,
  onToggleComplete,
  onSaveLog,
  onDeleteLog,
  onResetTimer,
  onRequireAuth,
}) => {
  return (
    <div className='relative'>
      <div className='flex items-center justify-between mb-3 px-1'>
        <span className='text-xs font-bold text-blue-400/80 uppercase tracking-widest pl-2 border-l-2 border-blue-500/50'>
          BLOQUE {block.id} • {block.exercises.length > 1 ? "SUPERSERIE" : "SERIE"}
        </span>
        <div className='flex items-center gap-2 bg-slate-900/80 text-slate-400 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-slate-800 backdrop-blur-sm'>
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
              user={user}
              onToggleComplete={onToggleComplete}
              onToggleExpanded={() => onSetExpandedExerciseId(isExpanded ? null : expandedId)}
              onSaveLog={onSaveLog}
              onDeleteLog={onDeleteLog}
              onResetTimer={onResetTimer}
              onRequireAuth={onRequireAuth}
            />
          );
        })}
      </div>
    </div>
  );
};

export default WorkoutBlock;
