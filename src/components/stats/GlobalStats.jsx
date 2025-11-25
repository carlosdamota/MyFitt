import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { TrendingUp, X, BarChart2, Cloud, Loader, ZapOff, Trophy, Dumbbell } from 'lucide-react';
import { callGeminiAPI } from '../../api/gemini';
import SimpleChart from './SimpleChart';
import LogViewer from './LogViewer';
import { routineData } from '../../data/routines';

const GlobalStats = ({ logs, onClose }) => {
  const [viewMode, setViewMode] = useState('charts'); // 'charts' or 'logs'
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [globalAnalysis, setGlobalAnalysis] = useState(null);

  const aggregatedData = useMemo(() => {
    const dateMap = {};
    Object.values(logs).forEach(exerciseLogs => {
      exerciseLogs.forEach(log => {
        const dateKey = new Date(log.date).toISOString().split('T')[0]; // Usar formato YYYY-MM-DD para ordenar
        const volume = log.weight * log.reps * log.sets;
        if (!dateMap[dateKey]) dateMap[dateKey] = { date: dateKey, val: 0, count: 0 };
        dateMap[dateKey].val += volume;
        dateMap[dateKey].count += 1;
      });
    });
    // Ordenar cronológicamente
    return Object.values(dateMap).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [logs]);

  const totalSessions = aggregatedData.length;
  const totalVolumeAllTime = aggregatedData.reduce((acc, curr) => acc + curr.val, 0);

  /**
   * Gemini Feature 3: Análisis Global de Tendencia de Entrenamiento
   */
  const handleGlobalAnalysis = useCallback(async () => {
    if (aggregatedData.length < 3) {
      setGlobalAnalysis("Necesitas al menos 3 sesiones registradas para un análisis de tendencia global.");
      return;
    }

    setGeminiLoading(true);
    setGlobalAnalysis(null);

    // Formatear los datos de volumen total por día para enviarlos al modelo
    const trendData = aggregatedData.map(d => ({
      fecha: d.date,
      volumen: d.val
    }));
    
    const systemPrompt = "Eres un coach de entrenamiento experto. Analiza la serie temporal de volumen total de entrenamiento diario. Identifica la tendencia principal (progreso constante, estancamiento, tendencia a la baja o progreso reciente fuerte). Ofrece un análisis conciso de 2-3 frases y una frase motivacional de cierre. NO uses markdown (ej. **).";
    const userPrompt = `Analiza la tendencia del volumen total de entrenamiento (Peso x Reps x Series) a lo largo del tiempo. Datos de Volumen Diario (JSON): ${JSON.stringify(trendData)}`;
    
    try {
      const response = await callGeminiAPI(userPrompt, systemPrompt);
      setGlobalAnalysis(response);
    } catch (e) {
      setGlobalAnalysis("Error al realizar el análisis global. Intenta de nuevo.");
      console.error(e);
    } finally {
      setGeminiLoading(false);
    }
  }, [aggregatedData]);

  // Limpiar el análisis al cambiar de logs
  useEffect(() => {
    setGlobalAnalysis(null);
  }, [logs]);


  return (
    <div className="fixed inset-0 z-50 bg-slate-950 animate-in slide-in-from-bottom duration-300 flex flex-col">
      <div className="bg-slate-900 p-4 flex justify-between items-center border-b border-slate-800">
        <h2 className="text-lg font-bold text-white flex items-center gap-2"><TrendingUp size={20} className="text-blue-400"/> Rendimiento</h2>
        <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><X size={20} /></button>
      </div>
      
      {/* Pestañas */}
      <div className="flex p-2 bg-slate-900 gap-2">
        <button 
          onClick={() => setViewMode('charts')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${viewMode === 'charts' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
        >
          GRÁFICAS
        </button>
        <button 
          onClick={() => setViewMode('logs')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${viewMode === 'logs' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
        >
          DIARIO / EXCEL
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {viewMode === 'charts' ? (
          <>
            {/* Botón de Análisis Global de Gemini */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm text-slate-400 font-bold uppercase flex items-center gap-2"><BarChart2 size={14} /> Volumen Diario</h3>
                  <button 
                      onClick={handleGlobalAnalysis} 
                      disabled={geminiLoading || aggregatedData.length < 3}
                      className="text-xs bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 font-bold transition-colors"
                  >
                      {geminiLoading ? <Loader size={12} className="animate-spin" /> : <><Cloud size={12} /> Análisis Global IA</>}
                  </button>
                </div>
                
                <div className="h-48 w-full bg-slate-950/50 rounded-xl border border-slate-800 p-2"><SimpleChart points={aggregatedData} height={200} width={500} color="#f472b6" /></div>
                <p className="text-xs text-center text-slate-500 mt-2 italic">(Peso × Reps × Series) sumado por día</p>

                {globalAnalysis && (
                    <div className="mt-4 p-3 rounded-lg border border-indigo-700/50 bg-indigo-900/30 text-sm animate-in fade-in">
                        <h4 className="font-bold text-white mb-2 flex items-center gap-2"><ZapOff size={16} className="text-indigo-400" /> Veredicto de Rendimiento:</h4>
                        <div className="text-slate-300 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: globalAnalysis.replace(/\n/g, '<br/>') }} />
                    </div>
                )}
            </div>

            {/* Distribución Muscular */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4">
                <h3 className="text-sm text-slate-400 font-bold uppercase flex items-center gap-2 mb-4"><Dumbbell size={14} /> Enfoque Muscular (Últimos 30 días)</h3>
                <div className="space-y-3">
                    {(() => {
                        const muscleVol = {};
                        let totalVol = 0;
                        const thirtyDaysAgo = new Date();
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                        // Crear mapa de ejercicio -> musculo
                        const exerciseToMuscle = {};
                        Object.values(routineData).forEach(day => {
                            day.blocks.forEach(block => {
                                block.exercises.forEach(ex => {
                                    exerciseToMuscle[ex.name] = ex.muscleGroup || "Otros";
                                });
                            });
                        });

                        Object.entries(logs).forEach(([exName, exLogs]) => {
                            const recentLogs = exLogs.filter(l => new Date(l.date) >= thirtyDaysAgo);
                            if (recentLogs.length === 0) return;

                            const exVol = recentLogs.reduce((acc, curr) => acc + (curr.weight * curr.reps * curr.sets), 0);
                            const muscle = exerciseToMuscle[exName] || "Otros";
                            
                            muscleVol[muscle] = (muscleVol[muscle] || 0) + exVol;
                            totalVol += exVol;
                        });

                        const sortedMuscles = Object.entries(muscleVol).sort((a, b) => b[1] - a[1]);

                        if (sortedMuscles.length === 0) return <p className="text-xs text-slate-500 italic text-center py-4">Registra entrenamientos para ver tu enfoque.</p>;

                        return sortedMuscles.map(([muscle, vol]) => {
                            const percentage = Math.round((vol / totalVol) * 100);
                            return (
                                <div key={muscle} className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-300 font-bold">{muscle}</span>
                                        <span className="text-slate-500">{percentage}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out" 
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        });
                    })()}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 text-blue-400 mb-2"><Trophy size={18} /><span className="text-xs font-bold uppercase">Sesiones</span></div>
                <p className="text-3xl font-mono font-bold text-white">{totalSessions}</p>
              </div>
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 text-purple-400 mb-2"><Dumbbell size={18} /><span className="text-xs font-bold uppercase">Tonelaje</span></div>
                <p className="text-2xl font-mono font-bold text-white">{(totalVolumeAllTime/1000).toFixed(1)}k</p>
              </div>
            </div>
          </>
        ) : (
          <LogViewer logs={logs} />
        )}
        
      </div>
    </div>
  );
};

export default GlobalStats;
