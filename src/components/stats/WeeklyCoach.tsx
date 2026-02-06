import React, { useState } from "react";
import { ZapOff, Loader, Cloud } from "lucide-react";
import { getWeeklyStats } from "../../utils/stats";
import { callAI, AiError } from "../../api/ai";
import type { WorkoutLogs, RoutineData } from "../../types";

interface WeeklyCoachProps {
  logs: WorkoutLogs;
  routines: RoutineData;
  userWeight: string | number;
  coachHistory: string;
  onSaveAdvice: (advice: string) => void;
  onRequireAuth?: () => void;
}

const WeeklyCoach: React.FC<WeeklyCoachProps> = ({
  logs,
  routines,
  userWeight,
  coachHistory,
  onSaveAdvice,
  onRequireAuth,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [report, setReport] = useState<string | null>(null);
  const [quotaMessage, setQuotaMessage] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    setLoading(true);
    setQuotaMessage(null);
    const stats = getWeeklyStats(logs, routines, userWeight);

    try {
      const response = await callAI("weekly_coach", {
        stats: {
          daysTrained: stats.daysTrained,
          trainingDates: stats.trainingDates,
          totalVolume: stats.totalVolume,
          previousWeekVolume: stats.previousWeekVolume,
          musclesWorked: stats.musclesWorked,
          currentWeekExercises: stats.currentWeekExercises,
          coachHistory: coachHistory || "Ninguno",
        },
      });
      setReport(response.text);
      onSaveAdvice(response.text);
    } catch (e) {
      if (e instanceof AiError && e.code === "quota_exceeded") {
        setQuotaMessage(e.message);
      } else if (e instanceof AiError && e.code === "auth_required") {
        setReport(e.message);
        onRequireAuth?.();
      } else {
        setReport("Error al generar el reporte.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='space-y-4'>
      <div className='bg-linear-to-br from-purple-900/40 to-slate-900 border border-purple-500/30 p-6 rounded-2xl text-center shadow-xl'>
        <div className='flex justify-center mb-4'>
          <div className='bg-purple-500/20 p-3 rounded-full border border-purple-500/30'>
            <Cloud
              size={32}
              className='text-purple-400'
            />
          </div>
        </div>
        <h3 className='text-xl font-bold text-white mb-2'>Tu Coach Personal AI</h3>
        <p className='text-sm text-slate-400 mb-6'>
          Análisis crítico de tu frecuencia, cargas y progreso semanal.
        </p>

        {!report && (
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className='bg-white text-purple-900 hover:bg-purple-100 disabled:opacity-50 px-8 py-3.5 rounded-full font-bold shadow-lg shadow-purple-900/50 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 mx-auto'
          >
            {loading ? (
              <Loader
                className='animate-spin'
                size={20}
              />
            ) : (
              <>
                <ZapOff size={20} /> Analizar mi Semana
              </>
            )}
          </button>
        )}
      </div>

      {report && (
        <div className='bg-slate-900 rounded-2xl border border-slate-800 p-6 animate-in fade-in slide-in-from-bottom-4 shadow-2xl'>
          <div className='flex items-center gap-2 mb-4 text-purple-400 font-bold text-xs uppercase tracking-widest'>
            <ZapOff size={14} /> Reporte de Inteligencia
          </div>
          <div className='text-slate-200 whitespace-pre-wrap leading-relaxed'>{report}</div>
          <div className='mt-6 pt-4 border-t border-slate-800/50 flex justify-between text-[10px] text-slate-500 font-bold'>
            <span>AUDITORÍA GEMINI AI</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      )}
      {quotaMessage && (
        <p className='text-[10px] text-amber-400 font-semibold'>{quotaMessage}</p>
      )}
    </div>
  );
};

export default WeeklyCoach;
