import React, { useState, useCallback } from "react";
import { BarChart2, Cloud, Loader, Sparkles } from "lucide-react";
import SimpleChart from "./SimpleChart";
import { callAI, AiError } from "../../api/ai";

interface DailyVolumeChartProps {
  data: { date: string; val: number; count: number }[];
  onRequireAuth?: () => void;
}

const DailyVolumeChart: React.FC<DailyVolumeChartProps> = ({ data, onRequireAuth }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [quotaMessage, setQuotaMessage] = useState<string | null>(null);

  const handleAnalysis = useCallback(async () => {
    if (data.length < 3) {
      setAnalysis("Necesitas al menos 3 sesiones para un análisis de tendencia.");
      return;
    }

    setLoading(true);
    setAnalysis(null);
    setQuotaMessage(null);

    try {
      const trendData = data.map((d) => ({ fecha: d.date, volumen: d.val }));
      const resp = await callAI("volume_trend", { trendData });
      setAnalysis(resp.text);
    } catch (e) {
      if (e instanceof AiError && e.code === "quota_exceeded") {
        setQuotaMessage(e.message);
      } else if (e instanceof AiError && e.code === "auth_required") {
        setAnalysis(e.message);
        onRequireAuth?.();
      } else {
        setAnalysis("Error al realizar el análisis.");
      }
    } finally {
      setLoading(false);
    }
  }, [data, onRequireAuth]);

  return (
    <div className='bg-slate-900/80 rounded-2xl border border-slate-800/50 overflow-hidden'>
      {/* Header */}
      <div className='flex items-center justify-between p-4 pb-0'>
        <h3 className='text-xs text-slate-400 font-bold uppercase flex items-center gap-2 tracking-wider'>
          <BarChart2
            size={14}
            className='text-blue-400'
          />
          Volumen Diario
        </h3>
        <button
          onClick={handleAnalysis}
          disabled={loading || data.length < 3}
          className='text-[10px] bg-indigo-600/80 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600/80 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all active:scale-95'
        >
          {loading ? (
            <Loader
              size={12}
              className='animate-spin'
            />
          ) : (
            <>
              <Cloud size={12} /> Análisis IA
            </>
          )}
        </button>
      </div>

      {/* Chart */}
      <div className='h-44 w-full p-3'>
        <div className='h-full w-full bg-slate-950/40 rounded-xl border border-slate-800/30 p-2'>
          <SimpleChart
            points={data}
            height={200}
            width={500}
            color='#3b82f6'
          />
        </div>
      </div>
      <p className='text-[10px] text-center text-slate-600 pb-3 font-medium'>
        (Peso × Reps × Series) sumado por día
      </p>

      {/* AI Analysis */}
      {analysis && (
        <div className='mx-4 mb-4 p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/40 text-xs animate-in fade-in zoom-in-95 duration-200'>
          <h4 className='font-bold text-indigo-300 mb-2 flex items-center gap-2 text-[11px] uppercase tracking-wider'>
            <Sparkles size={12} />
            Veredicto IA
          </h4>
          <div className='text-slate-300 whitespace-pre-wrap leading-relaxed text-[11px]'>
            {analysis}
          </div>
        </div>
      )}
      {quotaMessage && (
        <p className='text-[10px] text-amber-400 px-4 pb-3 font-semibold'>{quotaMessage}</p>
      )}
    </div>
  );
};

export default DailyVolumeChart;
