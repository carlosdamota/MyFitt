import React, { useState, useCallback } from "react";
import { BarChart2, Cloud, Loader, ZapOff } from "lucide-react";
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
    <div className='bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-xl'>
      <div className='flex justify-between items-center mb-4'>
        <h3 className='text-sm text-slate-400 font-bold uppercase flex items-center gap-2 tracking-wider'>
          <BarChart2
            size={14}
            className='text-blue-400'
          />{" "}
          Volumen Diario
        </h3>
        <button
          onClick={handleAnalysis}
          disabled={loading || data.length < 3}
          className='text-[10px] bg-indigo-600/90 hover:bg-indigo-500 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 font-bold transition-all active:scale-95 shadow-lg shadow-indigo-900/20'
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

      <div className='h-48 w-full bg-slate-950/50 rounded-xl border border-slate-800/50 p-2 shadow-inner'>
        <SimpleChart
          points={data}
          height={200}
          width={500}
          color='#3b82f6'
        />
      </div>
      <p className='text-[10px] text-center text-slate-500 mt-2 font-medium italic mb-2'>
        (Peso × Reps × Series) sumado por día
      </p>

      {analysis && (
        <div className='mt-4 p-4 rounded-xl border border-indigo-700/50 bg-indigo-900/30 text-xs animate-in zoom-in-95 duration-200 shadow-xl'>
          <h4 className='font-bold text-white mb-2 flex items-center gap-2 uppercase tracking-widest'>
            <ZapOff
              size={14}
              className='text-indigo-400'
            />{" "}
            Veredicto IA
          </h4>
          <div className='text-slate-200 whitespace-pre-wrap leading-relaxed'>{analysis}</div>
        </div>
      )}
      {quotaMessage && (
        <p className='text-[10px] text-amber-400 mt-3 font-semibold'>{quotaMessage}</p>
      )}
    </div>
  );
};

export default DailyVolumeChart;
