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
    <div className='sticky top-0 z-30 -mx-4 px-4 py-3 bg-surface-950/80 backdrop-blur-md border-b border-white/5 mb-6 transition-all duration-300'>
      <div className='flex justify-between items-end mb-1'>
        <span className='text-xs font-bold text-slate-400 uppercase tracking-wider'>
          Tu Progreso
        </span>
        <span className='text-sm font-bold text-blue-400'>{progressPercentage}%</span>
      </div>
      <div className='h-1.5 w-full bg-surface-800 rounded-full overflow-hidden'>
        <div
          className='h-full bg-linear-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out'
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default WorkoutProgressHeader;
