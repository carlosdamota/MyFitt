import React, { useState } from "react";
import { Sparkles, Loader, BrainCircuit } from "lucide-react";
import { getWeeklyStats } from "../../utils/stats";
import { callAI, AiError } from "../../api/ai";
import type { WorkoutLogs, RoutineData } from "../../types";
import { Button } from "../ui/Button";

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
      {/* CTA Card */}
      <div className='relative overflow-hidden bg-surface-900/80 border border-purple-500/20 rounded-2xl p-6 text-center'>
        {/* Background decoration */}
        <div className='absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none' />
        <div className='absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none' />

        <div className='relative'>
          <div className='inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/20 mb-4'>
            <BrainCircuit
              size={28}
              className='text-purple-400'
            />
          </div>

          <h3 className='text-lg font-bold text-white mb-1'>Coach Personal IA</h3>
          <p className='text-sm text-slate-400 mb-6 max-w-xs mx-auto'>
            Análisis crítico de tu frecuencia, cargas y progreso semanal.
          </p>

          {!report && (
            <Button
              variant='primary'
              size='md'
              onClick={handleGenerateReport}
              disabled={loading}
              className='inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-purple-900/30 from-transparent to-transparent'
            >
              {loading ? (
                <Loader
                  className='animate-spin'
                  size={18}
                />
              ) : (
                <>
                  <Sparkles size={18} /> Analizar mi Semana
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Report */}
      {report && (
        <div className='bg-surface-900/80 rounded-2xl border border-surface-800/50 p-5 animate-in fade-in slide-in-from-bottom-4 duration-300'>
          <div className='flex items-center gap-2 mb-4'>
            <Sparkles
              size={14}
              className='text-purple-400'
            />
            <span className='text-[11px] font-bold text-purple-300 uppercase tracking-wider'>
              Reporte de Inteligencia
            </span>
          </div>
          <div className='text-sm text-slate-200 whitespace-pre-wrap leading-relaxed'>{report}</div>
          <div className='mt-5 pt-3 border-t border-surface-800/50 flex justify-between text-[9px] text-slate-600 font-bold uppercase tracking-wider'>
            <span>Gemini AI</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      )}

      {quotaMessage && (
        <div className='bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3'>
          <p className='text-xs text-amber-400 font-semibold'>{quotaMessage}</p>
        </div>
      )}
    </div>
  );
};

export default WeeklyCoach;
