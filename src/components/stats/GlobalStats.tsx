import React, { useState, useMemo } from "react";
import { TrendingUp, ArrowLeft, Trophy, Dumbbell, Flame } from "lucide-react";
import LogViewer from "./LogViewer";
import { isBodyweightExercise } from "../../utils/stats";
import type { WorkoutLogs, RoutineData } from "../../types";

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
    { key: "charts" as const, label: "Gráficas", color: "blue" },
    { key: "weekly" as const, label: "Coach IA", color: "purple" },
    { key: "logs" as const, label: "Diario", color: "emerald" },
  ];

  return (
    <div className='fixed inset-0 z-50 bg-slate-950 animate-in slide-in-from-bottom duration-300 flex flex-col'>
      {/* Header */}
      <div className='bg-slate-900/80 backdrop-blur-xl px-4 py-3 flex items-center gap-3 border-b border-slate-800/50'>
        <button
          onClick={onClose}
          className='p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors active:scale-95'
        >
          <ArrowLeft size={18} />
        </button>
        <div className='flex-1 min-w-0'>
          <h2 className='text-base font-bold text-white flex items-center gap-2'>
            <TrendingUp
              size={18}
              className='text-blue-400'
            />
            Rendimiento
          </h2>
        </div>
      </div>

      {/* Summary Cards */}
      <div className='px-4 py-3 border-b border-slate-800/50'>
        <div className='bg-slate-800/40 rounded-2xl border border-slate-700/30 flex divide-x divide-slate-700/30'>
          <div className='flex-1 py-3 px-2 text-center'>
            <Trophy
              size={14}
              className='text-amber-400 mx-auto mb-1'
            />
            <p className='text-lg font-bold text-white font-mono leading-none'>{totalSessions}</p>
            <span className='text-[9px] text-slate-500 font-bold uppercase'>Sesiones</span>
          </div>
          <div className='flex-1 py-3 px-2 text-center'>
            <Dumbbell
              size={14}
              className='text-blue-400 mx-auto mb-1'
            />
            <p className='text-lg font-bold text-white font-mono leading-none'>
              {totalVolumeAllTime >= 1000
                ? `${(totalVolumeAllTime / 1000).toFixed(1)}k`
                : totalVolumeAllTime}
            </p>
            <span className='text-[9px] text-slate-500 font-bold uppercase'>Tonelaje</span>
          </div>
          <div className='flex-1 py-3 px-2 text-center'>
            <Flame
              size={14}
              className='text-orange-400 mx-auto mb-1'
            />
            <p className='text-lg font-bold text-white font-mono leading-none'>{totalExercises}</p>
            <span className='text-[9px] text-slate-500 font-bold uppercase'>Ejercicios</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className='flex px-4 py-2 bg-slate-900/40 gap-1.5 border-b border-slate-800/50'>
        {tabs.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setViewMode(key)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.97] ${
              viewMode === key
                ? `bg-${color}-600 text-white shadow-lg shadow-${color}-900/40`
                : "bg-slate-800/60 text-slate-400 hover:bg-slate-700/80 hover:text-slate-300"
            }`}
            style={
              viewMode === key
                ? {
                    backgroundColor:
                      color === "blue" ? "#2563eb" : color === "purple" ? "#9333ea" : "#059669",
                    boxShadow:
                      color === "blue"
                        ? "0 10px 15px -3px rgba(37,99,235,0.3)"
                        : color === "purple"
                          ? "0 10px 15px -3px rgba(147,51,234,0.3)"
                          : "0 10px 15px -3px rgba(5,150,105,0.3)",
                  }
                : {}
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4 bg-linear-to-b from-slate-900/50 to-slate-950'>
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
          <WeeklyCoach
            logs={logs}
            routines={routines}
            userWeight={userWeight}
            coachHistory={coachHistory}
            onSaveAdvice={onSaveAdvice}
            onRequireAuth={onRequireAuth}
          />
        ) : (
          <LogViewer
            logs={logs}
            userWeight={userWeight}
          />
        )}
      </div>
    </div>
  );
};

export default GlobalStats;
