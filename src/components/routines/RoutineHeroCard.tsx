import React from "react";
import { Activity, Clock, Dumbbell, Edit, Flame, Zap } from "lucide-react";
import type { Routine } from "../../types";

interface RoutineHeroCardProps {
  routine: Routine;
  totalExercises: number;
  onEditRoutine: () => void;
}

const RoutineHeroCard: React.FC<RoutineHeroCardProps> = ({
  routine,
  totalExercises,
  onEditRoutine,
}) => {
  return (
    <div
      className={`p-6 rounded-3xl border mb-6 ${routine.bg} ${routine.border} relative overflow-hidden group`}
    >
      <div className='absolute -right-4 -top-4 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-700'>
        <Dumbbell size={120} />
      </div>
      <div className='flex justify-between items-start mb-4 relative z-10'>
        <div>
          <h2 className='text-3xl font-black text-white mb-2 leading-tight'>{routine.title}</h2>
          <div className='flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-200/80'>
            <div className='flex items-center gap-1.5'>
              <Activity
                size={14}
                className='text-blue-300'
              />
              <span>{routine.focus}</span>
            </div>
            <span className='hidden sm:block w-1 h-1 rounded-full bg-slate-400/50' />
            <div className='flex items-center gap-1.5'>
              <Clock
                size={14}
                className='text-purple-300'
              />
              <span>~{totalExercises * 5} min</span>
            </div>
          </div>
        </div>
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
  );
};

export default RoutineHeroCard;
