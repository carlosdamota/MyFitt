import React from "react";

interface WorkoutProgressHeaderProps {
  totalExercises: number;
  progressPercentage: number;
}

const WorkoutProgressHeader: React.FC<WorkoutProgressHeaderProps> = ({
  totalExercises,
  progressPercentage,
}) => {
  if (totalExercises <= 0) return null;

  return (
    <div className='sticky top-0 z-30 -mx-4 px-4 py-3 bg-white/80 dark:bg-surface-950/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 mb-6 transition-all duration-300'>
      <div className='flex justify-between items-end mb-1'>
        <span className='text-xs font-bold text-slate-400 uppercase tracking-wider'>
          Tu Progreso
        </span>
        <span className='text-sm font-bold text-blue-400'>{progressPercentage}%</span>
      </div>
      <div className='h-1.5 w-full bg-slate-200 dark:bg-surface-800 rounded-full overflow-hidden transition-colors'>
        <div
          className='h-full bg-linear-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out'
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default WorkoutProgressHeader;
