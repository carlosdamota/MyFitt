import React, { useState, useMemo } from "react";
import { TrendingUp, ArrowLeft, Trophy, Dumbbell, Flame } from "lucide-react";
import LogViewer from "./LogViewer";
import { isBodyweightExercise } from "../../utils/stats";
import type { WorkoutLogs, RoutineData, UserStats } from "../../types";
import { Button } from "../ui/Button";

// Sub-components
import DailyVolumeChart from "./DailyVolumeChart";
import MuscleFocusChart from "./MuscleFocusChart";
import WeeklyCoach from "./WeeklyCoach";

interface GlobalStatsProps {
  logs: WorkoutLogs;
  stats: UserStats | null;
  onClose: () => void;
  userWeight: string | number;
  routines: RoutineData;
  coachHistory: string;
  onSaveAdvice: (advice: string) => void;
  onRequireAuth?: () => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

interface AggregatedDataPoint {
  date: string;
  val: number;
  count: number;
}

const GlobalStats: React.FC<GlobalStatsProps> = ({
  logs,
  stats,
  onClose,
  coachHistory,
  onSaveAdvice,
  userWeight,
  routines,
  onRequireAuth,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}) => {
  const [viewMode, setViewMode] = useState<"charts" | "logs" | "weekly">("charts");

  const aggregatedData = useMemo(() => {
    // Si tenemos las estadísticas pre-calculadas del backend, las usamos directamente.
    // Esto ahorra procesar miles de logs en el cliente.
    if (stats?.dailyVolume && stats.dailyVolume.length > 0) {
      return stats.dailyVolume.map((d) => ({
        date: d.date,
        val: d.volume,
        count: 0, // No se usa actualmente en la UI de gráficas
      }));
    }

    const dateMap: Record<string, AggregatedDataPoint> = {};
    Object.entries(logs).forEach(([exName, exerciseLogs]) => {
      exerciseLogs.forEach((log) => {
        const dateKey = new Date(log.date).toISOString().split("T")[0];
        const w = parseFloat(String(log.weight)) || 0;
        const effectiveWeight = w === 0 && isBodyweightExercise(exName) ? 1 : w;
        const volume = effectiveWeight * (log.reps || 0) * (log.sets || 0);
        if (!dateMap[dateKey]) dateMap[dateKey] = { date: dateKey, val: 0, count: 0 };
        dateMap[dateKey].val += volume;
        dateMap[dateKey].count += 1;
      });
    });
    return Object.values(dateMap).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }, [logs, stats]);

  const totalSessions = stats?.totalSessions ?? aggregatedData.length;
  const totalVolumeAllTime =
    stats?.totalVolume ?? aggregatedData.reduce((acc, curr) => acc + curr.val, 0);
  const totalExercises = stats?.totalExercises ?? Object.keys(logs).length;

  const tabs = [
    {
      key: "charts" as const,
      label: "Gráficas",
      activeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    {
      key: "weekly" as const,
      label: "Coach IA",
      activeClass: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    },
    {
      key: "logs" as const,
      label: "Diario",
      activeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
  ];

  return (
    <div className='flex flex-col space-y-6 w-full animate-in fade-in duration-300'>
      {/* Page Title */}
      <div className='flex items-center gap-3 mb-2'>
        <div className='p-3 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-200 dark:border-blue-500/20 transition-colors'>
          <TrendingUp
            size={24}
            className='text-blue-400'
          />
        </div>
        <div>
          <h1 className='text-2xl font-bold text-slate-900 dark:text-white transition-colors'>
            Rendimiento
          </h1>
          <p className='text-sm text-slate-500 dark:text-slate-400 transition-colors'>
            Analiza tu progreso y estadísticas históricas
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className='bg-white dark:bg-surface-900 rounded-3xl border border-slate-200 dark:border-surface-800 flex divide-x divide-slate-200 dark:divide-surface-800 overflow-hidden shadow-lg dark:shadow-xl relative transition-colors'>
        <div className='absolute -left-20 -top-20 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl pointer-events-none' />
        <div className='flex-1 py-5 px-3 text-center relative z-10'>
          <Trophy
            size={20}
            className='text-amber-400 mx-auto mb-2'
          />
          <p className='text-3xl font-black text-slate-900 dark:text-white font-mono leading-none transition-colors'>
            {totalSessions}
          </p>
          <span className='text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-2 block transition-colors'>
            Sesiones
          </span>
        </div>
        <div className='flex-1 py-5 px-3 text-center relative z-10'>
          <Dumbbell
            size={20}
            className='text-blue-400 mx-auto mb-2'
          />
          <p className='text-3xl font-black text-slate-900 dark:text-white font-mono leading-none transition-colors'>
            {totalVolumeAllTime >= 1000
              ? `${(totalVolumeAllTime / 1000).toFixed(1)}k`
              : totalVolumeAllTime}
          </p>
          <span className='text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-2 block transition-colors'>
            Tonelaje
          </span>
        </div>
        <div className='flex-1 py-5 px-3 text-center relative z-10'>
          <Flame
            size={20}
            className='text-orange-400 mx-auto mb-2'
          />
          <p className='text-3xl font-black text-slate-900 dark:text-white font-mono leading-none transition-colors'>
            {totalExercises}
          </p>
          <span className='text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-2 block transition-colors'>
            Ejercicios
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className='flex p-1.5 bg-white dark:bg-surface-900 rounded-full border border-slate-200 dark:border-surface-800 gap-1 overflow-x-auto shadow-lg dark:shadow-xl transition-colors'>
        {tabs.map(({ key, label, activeClass }) => (
          <button
            key={key}
            onClick={() => setViewMode(key)}
            className={`flex-1 min-w-[100px] py-3 rounded-full text-sm font-bold transition-all active:scale-[0.98] border ${
              viewMode === key
                ? activeClass
                : "bg-transparent border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-800/50 transition-colors"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className='flex flex-col space-y-6'>
        {viewMode === "charts" ? (
          <>
            <DailyVolumeChart
              data={aggregatedData}
              onRequireAuth={onRequireAuth}
            />
            <MuscleFocusChart
              logs={logs}
              routines={routines}
            />
          </>
        ) : viewMode === "weekly" ? (
          <div className='bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-800 rounded-3xl p-4 overflow-hidden transition-colors'>
            <WeeklyCoach
              logs={logs}
              routines={routines}
              userWeight={userWeight}
              coachHistory={coachHistory}
              onSaveAdvice={onSaveAdvice}
              onRequireAuth={onRequireAuth}
            />
          </div>
        ) : (
          <div className='bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-800 rounded-3xl p-4 overflow-hidden transition-colors'>
            <LogViewer
              logs={logs}
              userWeight={userWeight}
              fetchNextPage={fetchNextPage}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalStats;
