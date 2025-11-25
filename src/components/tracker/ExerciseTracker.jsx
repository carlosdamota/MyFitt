import React, { useState, useCallback, useMemo } from 'react';
import { Save, ZapOff, Trophy, Loader, Trash2, History } from 'lucide-react';
import { callGeminiAPI } from '../../api/gemini';
import SimpleChart from '../stats/SimpleChart';

const ExerciseTracker = ({ exerciseName, onSave, onDelete, history, onTimerReset, restTime }) => {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [sets, setSets] = useState('3');
  const [isSaving, setIsSaving] = useState(false);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiResponse, setGeminiResponse] = useState(null);
  const [geminiResponseType, setGeminiResponseType] = useState(null); // 'variants' or 'analysis'

  // Lógica de Sobrecarga Progresiva (Fase 1)
  const suggestion = useMemo(() => {
    if (!history || history.length === 0) return null;

    // Calcular 1RM estimado de cada log y encontrar el mejor
    const bestLog = history.reduce((max, log) => {
      const e1rm = log.weight * (1 + log.reps / 30);
      return e1rm > max.e1rm ? { ...log, e1rm } : max;
    }, { e1rm: 0 });

    if (bestLog.e1rm === 0) return null;

    // Sugerencia simple: Si hizo más de 8 reps, subir peso. Si no, subir reps.
    if (bestLog.reps >= 8) {
      return {
        text: `Intenta subir peso: ${bestLog.weight + 2.5}kg x ${Math.max(6, bestLog.reps - 2)}`,
        type: 'weight'
      };
    } else {
      return {
        text: `Intenta más reps: ${bestLog.weight}kg x ${bestLog.reps + 1}`,
        type: 'reps'
      };
    }
  }, [history]);

  const handleSave = async () => {
    if (!weight || !reps) return;
    setIsSaving(true);
    await onSave(exerciseName, { 
      date: new Date().toISOString(), 
      weight: parseFloat(weight), 
      reps: parseFloat(reps), 
      sets: parseFloat(sets) 
    });
    setIsSaving(false);
    setWeight('');
    setReps('');
    setGeminiResponse(null); // Limpiar análisis al guardar un nuevo log
    
    // Activar timer automáticamente si se proporcionan las props
    if (onTimerReset && restTime) {
      onTimerReset(restTime);
    }
  };

  /**
   * Gemini Feature 1: Generar Variantes de Progresión/Regresión
   */
  const handleGenerateVariants = useCallback(async () => {
    setGeminiLoading(true);
    setGeminiResponse(null);
    setGeminiResponseType('variants');
    const systemPrompt = "Eres un entrenador de fuerza experto. Proporciona 3 variantes de progresión o regresión (más fáciles o más difíciles) para el ejercicio solicitado. Describe brevemente cómo se realiza cada variante. Usa un formato de lista numerada.";
    const userPrompt = `Sugiere 3 variantes para el ejercicio: ${exerciseName}.`;
    
    try {
      const response = await callGeminiAPI(userPrompt, systemPrompt);
      setGeminiResponse(response);
    } catch (e) {
      setGeminiResponse("Error al generar las variantes. Intenta de nuevo.");
      console.error(e);
    } finally {
      setGeminiLoading(false);
    }
  }, [exerciseName]);

  /**
   * Gemini Feature 2: Analizar Historial de Entrenamiento para Récord Personal (PB)
   */
  const handleAnalyzeHistory = useCallback(async () => {
    if (history.length === 0) {
      setGeminiResponse("Aún no tienes suficiente historial para realizar un análisis de tu récord personal. ¡Registra al menos una serie!");
      setGeminiResponseType('analysis');
      return;
    }

    setGeminiLoading(true);
    setGeminiResponse(null);
    setGeminiResponseType('analysis');

    const formattedHistory = history.map(h => ({
      fecha: new Date(h.date).toLocaleDateString(),
      peso: h.weight,
      reps: h.reps,
      series: h.sets,
      volumen: h.weight * h.reps * h.sets
    }));
    
    const systemPrompt = "Eres un coach de entrenamiento motivacional y analítico. Basado en el historial proporcionado, identifica el mayor volumen total (peso x reps x series) logrado en una sola sesión. Proporciona una frase motivacional/analítica concisa y amigable, incluyendo los valores del récord (peso x reps x series). Responde directamente y conciso. NO uses markdown (ej. **).";
    const userPrompt = `Analiza el historial de entrenamiento para el ejercicio: ${exerciseName}. Historial de Logs (JSON): ${JSON.stringify(formattedHistory)}`;
    
    try {
      const response = await callGeminiAPI(userPrompt, systemPrompt);
      setGeminiResponse(response);
    } catch (e) {
      setGeminiResponse("Error al analizar el historial. Revisa tu conexión o intenta más tarde.");
      console.error(e);
    } finally {
      setGeminiLoading(false);
    }
  }, [exerciseName, history]);


  const chartData = history.map(h => ({ date: h.date, val: h.weight * h.reps * h.sets }));
  const recentLogs = [...history].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);

  return (
    <div className="mt-4 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
      <div className="flex items-center justify-between mb-3"><span className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1"><History size={12} /> Registrar Serie</span></div>
      
      {suggestion && (
        <div className="mb-3 bg-indigo-900/30 border border-indigo-500/30 p-2 rounded flex items-center gap-2 animate-in slide-in-from-left-2">
          <Trophy size={14} className="text-indigo-400" />
          <span className="text-xs text-indigo-200 font-medium">Meta: <span className="text-white font-bold">{suggestion.text}</span></span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div><label className="block text-[10px] text-slate-500 mb-1">PESO (KG)</label><input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none" placeholder="0"/></div>
        <div><label className="block text-[10px] text-slate-500 mb-1">REPS (MEDIA)</label><input type="number" value={reps} onChange={(e) => setReps(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none" placeholder="0"/></div>
        <div><label className="block text-[10px] text-slate-500 mb-1">SERIES</label><input type="number" value={sets} onChange={(e) => setSets(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none"/></div>
      </div>
      <button onClick={handleSave} disabled={isSaving} className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-xs font-bold py-2 rounded flex items-center justify-center gap-2 transition-colors">
        {isSaving ? "GUARDANDO..." : <><Save size={14} /> GUARDAR DATOS EN NUBE</>}
      </button>

      {/* Botones y Respuesta de GEMINI */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700">
          <button 
              onClick={handleGenerateVariants} 
              disabled={geminiLoading}
              className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white text-xs font-bold py-2 rounded flex items-center justify-center gap-2 transition-colors"
          >
              {geminiLoading && geminiResponseType === 'variants' ? <Loader size={14} className="animate-spin" /> : <>✨ Sugerir Variantes</>}
          </button>
          <button 
              onClick={handleAnalyzeHistory} 
              disabled={geminiLoading || history.length === 0}
              className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 text-white text-xs font-bold py-2 rounded flex items-center justify-center gap-2 transition-colors"
          >
              {geminiLoading && geminiResponseType === 'analysis' ? <Loader size={14} className="animate-spin" /> : <>✨ Analizar Historial</>}
          </button>
      </div>

      {geminiResponse && (
        <div className={`mt-4 p-3 rounded-lg border text-sm animate-in fade-in ${geminiResponseType === 'variants' ? 'bg-purple-900/30 border-purple-700/50' : 'bg-amber-900/30 border-amber-700/50'}`}>
          <h4 className="font-bold text-white mb-2 flex items-center gap-2">{geminiResponseType === 'variants' ? <ZapOff size={16} className="text-purple-400" /> : <Trophy size={16} className="text-amber-400" />} Asistente AI:</h4>
          {/* Renderizado simple del texto de Gemini */}
          <div className="text-slate-300 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: geminiResponse.replace(/\n/g, '<br/>') }} />
        </div>
      )}

      {recentLogs.length > 0 && (
        <div className="mt-4 border-t border-slate-700 pt-3">
           <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">Últimos registros (Borrar)</p>
           <div className="space-y-2">
             {recentLogs.map((log, idx) => (
               <div key={idx} className="flex justify-between items-center bg-slate-900/50 p-2 rounded border border-slate-800">
                 <span className="text-xs text-slate-300 font-mono">{new Date(log.date).toLocaleDateString()} - <span className="text-white font-bold">{log.weight}kg x {log.reps}</span> x {log.sets}</span>
                 <button onClick={() => onDelete(exerciseName, log)} className="text-red-400 hover:text-red-300 p-1 hover:bg-red-900/20 rounded"><Trash2 size={14} /></button>
               </div>
             ))}
           </div>
        </div>
      )}
      <div className="mt-4 h-24 bg-slate-900 rounded border border-slate-800 p-1"><SimpleChart points={chartData} height={80} width={300} /></div>
    </div>
  );
};

export default ExerciseTracker;
