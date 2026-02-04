import React, { useState, useMemo } from "react";
import { TrendingUp, X, Trophy, Dumbbell } from "lucide-react";
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

  return (
    <div className='fixed inset-0 z-50 bg-slate-950 animate-in slide-in-from-bottom duration-300 flex flex-col'>
      {/* Header */}
      <div className='bg-slate-900 p-4 flex justify-between items-center border-b border-slate-800 shadow-lg'>
        <h2 className='text-lg font-bold text-white flex items-center gap-2'>
          <TrendingUp
            size={20}
            className='text-blue-400'
          />{" "}
          Rendimiento
        </h2>
        <button
          onClick={onClose}
          className='p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors'
        >
          <X size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className='flex p-2 bg-slate-900 gap-2 border-b border-slate-800'>
        <button
          onClick={() => setViewMode("charts")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${viewMode === "charts" ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300"}`}
        >
          GRÁFICAS
        </button>
        <button
          onClick={() => setViewMode("weekly")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${viewMode === "weekly" ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40" : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300"}`}
        >
          COACH SEMANAL
        </button>
        <button
          onClick={() => setViewMode("logs")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${viewMode === "logs" ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300"}`}
        >
          DIARIO
        </button>
      </div>

      <div className='flex-1 overflow-y-auto p-4 space-y-6 bg-linear-to-b from-slate-900 to-slate-950'>
        {viewMode === "charts" ? (
          <>
            <DailyVolumeChart data={aggregatedData} />
            <MuscleFocusChart
              logs={logs}
              routines={routines}
            />

            <div className='grid grid-cols-2 gap-4'>
              <div className='bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm'>
                <div className='flex items-center gap-2 text-blue-400 mb-2'>
                  <Trophy size={18} />
                  <span className='text-[10px] font-bold uppercase tracking-wider'>Sesiones</span>
                </div>
                <p className='text-3xl font-mono font-bold text-white'>{totalSessions}</p>
              </div>
              <div className='bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm'>
                <div className='flex items-center gap-2 text-purple-400 mb-2'>
                  <Dumbbell size={18} />
                  <span className='text-[10px] font-bold uppercase tracking-wider'>Tonelaje</span>
                </div>
                <p className='text-2xl font-mono font-bold text-white'>
                  {(totalVolumeAllTime / 1000).toFixed(1)}k
                </p>
              </div>
            </div>
          </>
        ) : viewMode === "weekly" ? (
          <WeeklyCoach
            logs={logs}
            routines={routines}
            userWeight={userWeight}
            coachHistory={coachHistory}
            onSaveAdvice={onSaveAdvice}
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
