import React, { useState } from 'react';
import { PieChart, Plus, Trash2, Utensils, Flame, Droplet, Wheat, Loader, Sparkles } from 'lucide-react';
import { useNutrition } from '../../hooks/useNutrition';
import { parseNutritionLog } from '../../api/gemini';

const NutritionDashboard = ({ user }) => {
  const { logs, loading, addFoodLog, deleteFoodLog, todayTotals } = useNutrition(user);
  const [input, setInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const handleQuickLog = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setAnalyzing(true);
    setError(null);

    try {
      const nutritionData = await parseNutritionLog(input);
      await addFoodLog(nutritionData);
      setInput('');
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const MacroCard = ({ label, value, unit, color, icon: Icon }) => (
    <div className={`bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col items-center justify-center gap-1 ${color}`}>
      <Icon size={16} />
      <span className="text-xs font-bold uppercase text-slate-500">{label}</span>
      <span className="text-lg font-mono font-bold text-white">{Math.round(value)}{unit}</span>
    </div>
  );

  // Datos para gráfico circular simple (CSS conic-gradient)
  const totalMacros = todayTotals.protein + todayTotals.carbs + todayTotals.fats;
  const pPct = totalMacros ? (todayTotals.protein / totalMacros) * 100 : 0;
  const cPct = totalMacros ? (todayTotals.carbs / totalMacros) * 100 : 0;
  const fPct = totalMacros ? (todayTotals.fats / totalMacros) * 100 : 0;

  const chartStyle = {
    background: `conic-gradient(
      #3b82f6 0% ${pPct}%, 
      #a855f7 ${pPct}% ${pPct + cPct}%, 
      #eab308 ${pPct + cPct}% 100%
    )`
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Resumen de Hoy */}
      <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
        <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><Utensils size={16} /> Resumen Diario</h3>
        
        <div className="flex items-center gap-6 mb-6">
          {/* Gráfico */}
          <div className="relative w-24 h-24 rounded-full flex items-center justify-center shrink-0" style={chartStyle}>
            <div className="absolute inset-2 bg-slate-950 rounded-full flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-white">{Math.round(todayTotals.calories)}</span>
              <span className="text-[10px] text-slate-500 uppercase">Kcal</span>
            </div>
          </div>
          
          {/* Leyenda */}
          <div className="flex-1 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-blue-400 font-bold flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full"/> Proteína</span>
              <span className="text-slate-300">{Math.round(todayTotals.protein)}g</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-purple-400 font-bold flex items-center gap-1"><div className="w-2 h-2 bg-purple-500 rounded-full"/> Carbs</span>
              <span className="text-slate-300">{Math.round(todayTotals.carbs)}g</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-yellow-400 font-bold flex items-center gap-1"><div className="w-2 h-2 bg-yellow-500 rounded-full"/> Grasas</span>
              <span className="text-slate-300">{Math.round(todayTotals.fats)}g</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <MacroCard label="Prot" value={todayTotals.protein} unit="g" color="text-blue-400" icon={Droplet} />
          <MacroCard label="Carb" value={todayTotals.carbs} unit="g" color="text-purple-400" icon={Wheat} />
          <MacroCard label="Grasa" value={todayTotals.fats} unit="g" color="text-yellow-400" icon={Flame} />
        </div>
      </div>

      {/* Quick Log con IA */}
      <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900 p-4 rounded-2xl border border-indigo-500/30">
        <h3 className="text-sm font-bold text-indigo-300 uppercase mb-2 flex items-center gap-2"><Sparkles size={14} /> Log Rápido con IA</h3>
        <form onSubmit={handleQuickLog} className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ej: 2 huevos revueltos y una manzana"
            className="w-full bg-slate-950 border border-indigo-900/50 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:border-indigo-500 outline-none placeholder-slate-600 transition-all"
            disabled={analyzing}
          />
          <button 
            type="submit" 
            disabled={analyzing || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:bg-slate-700 disabled:text-slate-500"
          >
            {analyzing ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />}
          </button>
        </form>
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
        <p className="text-[10px] text-slate-500 mt-2 italic">Describe tu comida y la IA calculará los macros.</p>
      </div>

      {/* Historial de Hoy */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-400 uppercase px-1">Comidas de Hoy</h3>
        {loading ? (
           <div className="flex justify-center py-4"><Loader className="animate-spin text-slate-600" /></div>
        ) : logs.length === 0 ? (
           <p className="text-center text-slate-600 text-xs py-4 italic">No has registrado comidas hoy.</p>
        ) : (
          logs.filter(l => new Date(l.date).toDateString() === new Date().toDateString()).map((log) => (
            <div key={log.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center animate-in slide-in-from-bottom-2">
              <div>
                <h4 className="font-bold text-slate-200 text-sm">{log.food}</h4>
                <div className="flex gap-2 text-[10px] text-slate-500 mt-0.5 font-mono">
                  <span className="text-blue-400">{log.protein}p</span>
                  <span className="text-purple-400">{log.carbs}c</span>
                  <span className="text-yellow-400">{log.fats}f</span>
                  <span className="text-white font-bold">{log.calories} kcal</span>
                </div>
              </div>
              <button onClick={() => deleteFoodLog(log.id)} className="text-slate-600 hover:text-red-400 p-2 transition-colors"><Trash2 size={16} /></button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NutritionDashboard;
