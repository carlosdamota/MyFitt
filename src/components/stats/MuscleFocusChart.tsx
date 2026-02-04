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

const MuscleFocusChart: React.FC<MuscleFocusChartProps> = ({ logs, routines }) => {
  const muscleVol: MuscleVolume = {};
  let totalVol = 0;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Crear mapa de ejercicio -> musculo combinando datos estáticos y del usuario
  const exerciseToMuscle: Record<string, string> = {};

  // Primero procesar rutinas estáticas (defaults)
  Object.values(defaultRoutines).forEach((day: Routine) => {
    day.blocks.forEach((block) => {
      block.exercises.forEach((ex) => {
        exerciseToMuscle[ex.name] = ex.muscleGroup || "Otros";
      });
    });
  });

  // Luego procesar rutinas del usuario (sobrescribe o añade)
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
      <div className='bg-slate-900 rounded-2xl border border-slate-800 p-4'>
        <h3 className='text-sm text-slate-400 font-bold uppercase flex items-center gap-2 mb-4'>
          <Dumbbell size={14} /> Enfoque Muscular (Últimos 30 días)
        </h3>
        <p className='text-xs text-slate-500 italic text-center py-4'>
          Registra entrenamientos para ver tu enfoque.
        </p>
      </div>
    );
  }

  return (
    <div className='bg-slate-900 rounded-2xl border border-slate-800 p-4'>
      <h3 className='text-sm text-slate-400 font-bold uppercase flex items-center gap-2 mb-4'>
        <Dumbbell size={14} /> Enfoque Muscular (Últimos 30 días)
      </h3>
      <div className='space-y-4'>
        {sortedMuscles.map(([muscle, vol]) => {
          const percentage = Math.round((vol / totalVol) * 100);
          return (
            <div
              key={muscle}
              className='space-y-1.5'
            >
              <div className='flex justify-between text-xs'>
                <span className='text-slate-200 font-bold tracking-wide'>{muscle}</span>
                <span className='text-blue-400 font-mono font-bold'>{percentage}%</span>
              </div>
              <div className='h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50 shadow-inner'>
                <div
                  className='h-full bg-linear-to-r from-blue-600 via-blue-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                  style={{ width: `${percentage}%` }}
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
