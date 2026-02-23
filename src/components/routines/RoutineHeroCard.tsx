import React from "react";
import { Activity, Clock, Dumbbell, Edit, Flame, Zap } from "lucide-react";
import type { Routine } from "../../types";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

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
    <div className='p-6 rounded-3xl border mb-6 bg-white dark:bg-surface-900 border-slate-200 dark:border-surface-800 relative overflow-hidden group shadow-sm dark:shadow-xl transition-colors'>
      {/* Background Glows */}
      <div className='absolute -top-24 -right-24 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl pointer-events-none' />
      <div className='absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none' />

      <div className='absolute -right-4 -top-4 p-4 text-slate-900/5 dark:text-white/5 group-hover:text-slate-900/10 dark:group-hover:text-white/10 transition-colors duration-700 pointer-events-none'>
        <Dumbbell size={120} />
      </div>

      <div className='flex justify-between items-start mb-4 relative z-10'>
        <div>
          <h2 className='text-3xl font-black text-slate-900 dark:text-white mb-2 leading-tight tracking-tight transition-colors'>
            {routine.title}
          </h2>
          <div className='flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-400 font-medium'>
            <div className='flex items-center gap-1.5'>
              <Activity
                size={14}
                className='text-blue-400'
              />
              <span>{routine.focus}</span>
            </div>
            <span className='hidden sm:block w-1 h-1 rounded-full bg-slate-300 dark:bg-surface-700 transition-colors' />
            <div className='flex items-center gap-1.5'>
              <Clock
                size={14}
                className='text-purple-400'
              />
              <span>~{totalExercises * 5} min</span>
            </div>
            {routine.estimatedCalories && (
              <>
                <span className='hidden sm:block w-1 h-1 rounded-full bg-slate-300 dark:bg-surface-700 transition-colors' />
                <div className='flex items-center gap-1.5'>
                  <Flame
                    size={14}
                    className='text-orange-400'
                  />
                  <span>~{routine.estimatedCalories} kcal</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className='flex items-center gap-2 relative z-10'>
        <Badge
          variant={routine.mode === "heavy" ? "danger" : "default"}
          className='bg-slate-100 dark:bg-surface-800/80 border-slate-200 dark:border-surface-700/50 backdrop-blur-md shadow-sm dark:shadow-inner text-slate-700 dark:text-slate-300 transition-colors'
        >
          {routine.mode === "heavy" ? (
            <Flame
              size={12}
              className='mr-1 text-red-400'
            />
          ) : (
            <Zap
              size={12}
              className='mr-1 text-primary-400'
            />
          )}
          {routine.weight}
        </Badge>

        {/* 
        <Button
          variant='secondary'
          size='sm'
          onClick={onEditRoutine}
          leftIcon={<Edit size={14} />}
          className='bg-surface-800/80 backdrop-blur-md border-surface-700/50 text-slate-300 hover:bg-surface-700 hover:text-white transition-colors shadow-inner'
        >
          Editar
        </Button>
        */}
      </div>
    </div>
  );
};

export default RoutineHeroCard;
