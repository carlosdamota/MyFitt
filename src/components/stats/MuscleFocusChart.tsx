import React from "react";
import { Dumbbell } from "lucide-react";
import { routineData as defaultRoutines } from "../../data/routines";
import { isBodyweightExercise } from "../../utils/stats";
import type { WorkoutLogs, Routine, RoutineData } from "../../types";

interface MuscleFocusChartProps {
  logs: WorkoutLogs;
  routines: RoutineData;
}

interface MuscleVolume {
  [muscle: string]: number;
}

const MUSCLE_COLORS: Record<string, string> = {
  Pecho: "#3b82f6",
  Espalda: "#8b5cf6",
  Hombro: "#f59e0b",
  Piernas: "#10b981",
  Bíceps: "#ef4444",
  Tríceps: "#ec4899",
  Core: "#06b6d4",
  Glúteo: "#f97316",
  Otros: "#64748b",
};

const getBarColor = (muscle: string): string => {
  for (const [key, color] of Object.entries(MUSCLE_COLORS)) {
    if (muscle.toLowerCase().includes(key.toLowerCase())) return color;
  }
  return MUSCLE_COLORS.Otros;
};

const MuscleFocusChart: React.FC<MuscleFocusChartProps> = ({ logs, routines }) => {
  const muscleVol: MuscleVolume = {};
  let totalVol = 0;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const exerciseToMuscle: Record<string, string> = {};

  Object.values(defaultRoutines).forEach((day: Routine) => {
    day.blocks.forEach((block) => {
      block.exercises.forEach((ex) => {
        exerciseToMuscle[ex.name] = ex.muscleGroup || "Otros";
      });
    });
  });

  Object.values(routines).forEach((day: Routine) => {
    day.blocks.forEach((block) => {
      block.exercises.forEach((ex) => {
        exerciseToMuscle[ex.name] = ex.muscleGroup || "Otros";
      });
    });
  });

  Object.entries(logs).forEach(([exName, exLogs]) => {
    const recentLogs = exLogs.filter((l) => new Date(l.date) >= thirtyDaysAgo);
    if (recentLogs.length === 0) return;

    const exVol = recentLogs.reduce((acc, curr) => {
      const weight = parseFloat(String(curr.weight)) || 0;
      const effectiveWeight = weight === 0 && isBodyweightExercise(exName) ? 1 : weight;
      return acc + effectiveWeight * (curr.reps || 0) * (curr.sets || 0);
    }, 0);
    const muscle = exerciseToMuscle[exName] || "Otros";

    muscleVol[muscle] = (muscleVol[muscle] || 0) + exVol;
    totalVol += exVol;
  });

  const sortedMuscles = Object.entries(muscleVol).sort((a, b) => b[1] - a[1]);

  if (sortedMuscles.length === 0) {
    return (
      <div className='bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-800 rounded-3xl p-6 shadow-lg dark:shadow-xl relative overflow-hidden transition-colors'>
        <h3 className='text-xs text-slate-600 dark:text-slate-300 font-bold uppercase flex items-center gap-2 tracking-widest mb-4 transition-colors'>
          <Dumbbell
            size={16}
            className='text-primary-400'
          />{" "}
          Enfoque Muscular
        </h3>
        <p className='text-xs text-slate-500 italic text-center py-6'>
          Registra entrenamientos para ver tu enfoque.
        </p>
      </div>
    );
  }

  return (
    <div className='bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-800 rounded-3xl p-6 shadow-lg dark:shadow-xl relative overflow-hidden transition-colors'>
      {/* Background glow similar to other cards */}
      <div className='absolute -top-24 -right-24 w-48 h-48 bg-primary-500/5 rounded-full blur-3xl pointer-events-none' />
      <h3 className='text-xs text-slate-600 dark:text-slate-300 font-bold uppercase flex items-center gap-2 tracking-widest mb-6 transition-colors'>
        <Dumbbell
          size={16}
          className='text-primary-400'
        />{" "}
        Enfoque Muscular
        <span className='text-[10px] text-slate-500 font-medium normal-case ml-auto'>
          Últimos 30d
        </span>
      </h3>
      <div className='space-y-3'>
        {sortedMuscles.map(([muscle, vol]) => {
          const percentage = Math.round((vol / totalVol) * 100);
          const color = getBarColor(muscle);
          return (
            <div
              key={muscle}
              className='space-y-1'
            >
              <div className='flex justify-between items-center text-xs'>
                <span className='text-slate-700 dark:text-slate-300 font-medium tracking-wide flex items-center gap-2 transition-colors'>
                  <span
                    className='w-2 h-2 rounded-full shrink-0'
                    style={{ backgroundColor: color }}
                  />
                  {muscle}
                </span>
                <span
                  className='font-mono font-bold text-sm'
                  style={{ color }}
                >
                  {percentage}%
                </span>
              </div>
              <div className='h-2 bg-slate-100 dark:bg-surface-950/50 rounded-full overflow-hidden border border-slate-200 dark:border-white/5 transition-colors'>
                <div
                  className='h-full rounded-full transition-all duration-1000 ease-out'
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: color,
                    boxShadow: `0 0 8px ${color}40`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MuscleFocusChart;
