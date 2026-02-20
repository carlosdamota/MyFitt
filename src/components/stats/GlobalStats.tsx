import React, { useState, useMemo } from "react";
import { TrendingUp, ArrowLeft, Trophy, Dumbbell, Flame } from "lucide-react";
import LogViewer from "./LogViewer";
import { isBodyweightExercise } from "../../utils/stats";
import type { WorkoutLogs, RoutineData } from "../../types";
import { Button } from "../ui/Button";

// Sub-components
import DailyVolumeChart from "./DailyVolumeChart";
import MuscleFocusChart from "./MuscleFocusChart";
import WeeklyCoach from "./WeeklyCoach";

interface GlobalStatsProps {
  logs: WorkoutLogs;
  onClose: () => void;
  coachHistory: string;
  onSaveAdvice: (advice: string) => void;
  userWeight: string | number;
  routines: RoutineData;
  onRequireAuth?: () => void;
}

interface AggregatedDataPoint {
  date: string;
  val: number;
  count: number;
}

const GlobalStats: React.FC<GlobalStatsProps> = ({
  logs,
  onClose,
  coachHistory,
  onSaveAdvice,
  userWeight,
  routines,
  onRequireAuth,
}) => {
  const [viewMode, setViewMode] = useState<"charts" | "logs" | "weekly">("charts");

  const aggregatedData = useMemo(() => {
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
  }, [logs]);

  const totalSessions = aggregatedData.length;
  const totalVolumeAllTime = aggregatedData.reduce((acc, curr) => acc + curr.val, 0);
  const totalExercises = Object.keys(logs).length;

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
        <div className='p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20'>
          <TrendingUp
            size={24}
            className='text-blue-400'
          />
        </div>
        <div>
          <h1 className='text-2xl font-bold text-white'>Rendimiento</h1>
          <p className='text-sm text-slate-400'>Analiza tu progreso y estadísticas históricas</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className='bg-surface-900 rounded-3xl border border-surface-800 flex divide-x divide-surface-800 overflow-hidden shadow-xl relative'>
        <div className='absolute -left-20 -top-20 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl pointer-events-none' />
        <div className='flex-1 py-5 px-3 text-center relative z-10'>
          <Trophy
            size={20}
            className='text-amber-400 mx-auto mb-2'
          />
          <p className='text-3xl font-black text-white font-mono leading-none'>{totalSessions}</p>
          <span className='text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-2 block'>
            Sesiones
          </span>
        </div>
        <div className='flex-1 py-5 px-3 text-center relative z-10'>
          <Dumbbell
            size={20}
            className='text-blue-400 mx-auto mb-2'
          />
          <p className='text-3xl font-black text-white font-mono leading-none'>
            {totalVolumeAllTime >= 1000
              ? `${(totalVolumeAllTime / 1000).toFixed(1)}k`
              : totalVolumeAllTime}
          </p>
          <span className='text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-2 block'>
            Tonelaje
          </span>
        </div>
        <div className='flex-1 py-5 px-3 text-center relative z-10'>
          <Flame
            size={20}
            className='text-orange-400 mx-auto mb-2'
          />
          <p className='text-3xl font-black text-white font-mono leading-none'>{totalExercises}</p>
          <span className='text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-2 block'>
            Ejercicios
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className='flex p-1.5 bg-surface-900 rounded-full border border-surface-800 gap-1 overflow-x-auto shadow-xl'>
        {tabs.map(({ key, label, activeClass }) => (
          <button
            key={key}
            onClick={() => setViewMode(key)}
            className={`flex-1 min-w-[100px] py-3 rounded-full text-sm font-bold transition-all active:scale-[0.98] border ${
              viewMode === key
                ? activeClass
                : "bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-surface-800/50"
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
          <div className='bg-surface-900 border border-surface-800 rounded-3xl p-4 overflow-hidden'>
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
          <div className='bg-surface-900 border border-surface-800 rounded-3xl p-4 overflow-hidden'>
            <LogViewer
              logs={logs}
              userWeight={userWeight}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalStats;
