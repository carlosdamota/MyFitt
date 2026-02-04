import React, { useState, useCallback } from "react";
import { BarChart2, Cloud, Loader, ZapOff } from "lucide-react";
import SimpleChart from "./SimpleChart";
import { callGeminiAPI } from "../../api/gemini";

interface DailyVolumeChartProps {
  data: { date: string; val: number; count: number }[];
}

const DailyVolumeChart: React.FC<DailyVolumeChartProps> = ({ data }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const handleAnalysis = useCallback(async () => {
    if (data.length < 3) {
      setAnalysis("Necesitas al menos 3 sesiones para un análisis de tendencia.");
      return;
    }

    setLoading(true);
    setAnalysis(null);

    const trendData = data.map((d) => ({ fecha: d.date, volumen: d.val }));
    const systemPrompt =
      "Eres un coach de entrenamiento experto. Analiza la tendencia del volumen diario. Ofrece un análisis conciso de 2-3 frases y una frase motivacional. SIN markdown.";
    const userPrompt = `Analiza la tendencia de este volumen diario: ${JSON.stringify(trendData)}`;

    try {
      const resp = await callGeminiAPI(userPrompt, systemPrompt);
      setAnalysis(resp);
    } catch (e) {
      setAnalysis("Error al realizar el análisis.");
    } finally {
      setLoading(false);
    }
  }, [data]);

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
          <div
            className='text-slate-200 whitespace-pre-wrap leading-relaxed'
            dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, "<br/>") }}
          />
        </div>
      )}
    </div>
  );
};

export default DailyVolumeChart;
