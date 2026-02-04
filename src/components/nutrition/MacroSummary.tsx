import React from "react";
import { Utensils, Droplet, Wheat, Flame, AlertTriangle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface DayTotals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface MacroSummaryProps {
  dayTotals: DayTotals;
  targets: MacroTargets;
}

interface MacroBarProps {
  label: string;
  current: number;
  target: number;
  color: string;
  icon: LucideIcon;
}

const MacroBar: React.FC<MacroBarProps> = ({ label, current, target, color, icon: Icon }) => {
  const percentage = (current / target) * 100;
  const isOver = current > target;

  return (
    <div className='space-y-1'>
      <div className='flex justify-between items-center text-xs'>
        <span className={`font-bold flex items-center gap-1 ${color}`}>
          <Icon size={12} /> {label}
        </span>
        <span className={`font-mono ${isOver ? "text-red-400" : "text-slate-300"}`}>
          {Math.round(current)}/{target}g
          {isOver && (
            <AlertTriangle
              size={10}
              className='inline text-red-400 ml-1'
            />
          )}
        </span>
      </div>
      <div className='h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50 shadow-inner'>
        <div
          className={`h-full transition-all duration-300 shadow-[0_0_8px_rgba(0,0,0,0.5)] ${isOver ? "bg-red-500" : color.replace("text-", "bg-")}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};

const MacroSummary: React.FC<MacroSummaryProps> = ({ dayTotals, targets }) => {
  const totalMacros = dayTotals.protein + dayTotals.carbs + dayTotals.fats;
  const pPct = totalMacros ? (dayTotals.protein / totalMacros) * 100 : 0;
  const cPct = totalMacros ? (dayTotals.carbs / totalMacros) * 100 : 0;

  const chartStyle = {
    background: `conic-gradient(
      #3b82f6 0% ${pPct}%, 
      #a855f7 ${pPct}% ${pPct + cPct}%, 
      #eab308 ${pPct + cPct}% 100%
    )`,
  };

  const caloriesPercentage = (dayTotals.calories / targets.calories) * 100;
  const isCaloriesOver = dayTotals.calories > targets.calories;

  return (
    <div className='bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl'>
      <h3 className='text-sm font-bold text-slate-400 uppercase mb-6 flex items-center gap-2 tracking-wider'>
        <Utensils
          size={16}
          className='text-blue-400'
        />{" "}
        Resumen Nutricional
      </h3>

      <div className='flex items-center gap-8 mb-8'>
        {/* Calorímetro */}
        <div
          className='relative w-28 h-28 rounded-full flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(0,0,0,0.3)]'
          style={chartStyle}
        >
          <div className='absolute inset-2.5 bg-slate-950 rounded-full flex flex-col items-center justify-center border border-slate-800/50 shadow-inner'>
            <span
              className={`text-2xl font-mono font-bold ${isCaloriesOver ? "text-red-400" : "text-white"}`}
            >
              {Math.round(dayTotals.calories)}
            </span>
            <span className='text-[10px] text-slate-500 font-bold uppercase tracking-widest'>
              Kcal
            </span>
          </div>
        </div>

        {/* Info de Calorías */}
        <div className='flex-1 space-y-3'>
          <div className='flex justify-between items-end'>
            <div className='flex flex-col'>
              <span className='text-[10px] text-slate-500 font-bold uppercase'>Objetivo</span>
              <span className='text-lg font-mono font-bold text-white'>{targets.calories}</span>
            </div>
            <span className='text-xs font-bold text-slate-500 mb-1'>
              {Math.round(caloriesPercentage)}%
            </span>
          </div>

          <div className='h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50 shadow-inner'>
            <div
              className={`h-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(0,0,0,0.3)] ${isCaloriesOver ? "bg-red-500" : "bg-linear-to-r from-green-600 to-green-400"}`}
              style={{ width: `${Math.min(caloriesPercentage, 100)}%` }}
            />
          </div>

          <p
            className={`text-[11px] font-medium italic ${isCaloriesOver ? "text-red-400" : "text-slate-400"}`}
          >
            {isCaloriesOver
              ? `Exceso de ${Math.round(dayTotals.calories - targets.calories)} kcal`
              : `${Math.round(targets.calories - dayTotals.calories)} kcal restantes para el objetivo`}
          </p>
        </div>
      </div>

      {/* Macro Bars */}
      <div className='grid grid-cols-1 gap-4 pt-2'>
        <MacroBar
          label='Proteína'
          current={dayTotals.protein}
          target={targets.protein}
          color='text-blue-400'
          icon={Droplet}
        />
        <MacroBar
          label='Carbohidratos'
          current={dayTotals.carbs}
          target={targets.carbs}
          color='text-purple-400'
          icon={Wheat}
        />
        <MacroBar
          label='Grasas'
          current={dayTotals.fats}
          target={targets.fats}
          color='text-yellow-400'
          icon={Flame}
        />
      </div>
    </div>
  );
};

export default MacroSummary;
