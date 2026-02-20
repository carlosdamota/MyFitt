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
  const percentage = target > 0 ? (current / target) * 100 : 0;
  const isOver = current > target;

  const getGradient = () => {
    if (isOver) return "bg-linear-to-r from-red-600 to-red-400";
    if (color.includes("blue")) return "bg-linear-to-r from-blue-500 to-cyan-400";
    if (color.includes("purple")) return "bg-linear-to-r from-purple-500 to-indigo-400";
    if (color.includes("yellow")) return "bg-linear-to-r from-yellow-500 to-orange-400";
    if (color.includes("green")) return "bg-linear-to-r from-emerald-500 to-green-400";
    return "bg-linear-to-r from-slate-600 to-slate-400";
  };

  return (
    <div className='space-y-1.5'>
      <div className='flex justify-between items-center text-xs'>
        <span className={`font-bold flex items-center gap-1.5 ${color}`}>
          <Icon size={14} /> {label}
        </span>
        <span className={`font-mono text-[11px] ${isOver ? "text-red-400" : "text-slate-300"}`}>
          <span className='text-white font-black'>{Math.round(current)}</span>
          <span className='opacity-50'>/</span>
          {target}g
          {isOver && (
            <AlertTriangle
              size={12}
              className='inline text-red-400 ml-1.5'
            />
          )}
        </span>
      </div>
      <div className='h-2.5 bg-surface-950/80 rounded-full overflow-hidden border border-surface-800/80 shadow-inner'>
        <div
          className={`h-full transition-all duration-700 ease-out ${getGradient()} shadow-lg relative`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        >
          {/* Shine effect */}
          <div className='absolute top-0 inset-x-0 h-px bg-white/30' />
        </div>
      </div>
    </div>
  );
};

const MacroSummary: React.FC<MacroSummaryProps> = ({ dayTotals, targets }) => {
  // Calculations for donut chart
  const size = 160;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Protect against division by zero
  const totalMacros = dayTotals.protein + dayTotals.carbs + dayTotals.fats;
  const safeTotal = totalMacros > 0 ? totalMacros : 1;

  // Compute percentages of the fill (max 100% of the circle)
  const pPct = dayTotals.protein / safeTotal;
  const cPct = dayTotals.carbs / safeTotal;
  const fPct = dayTotals.fats / safeTotal;

  // Length of each segment
  const pLength = pPct * circumference;
  const cLength = cPct * circumference;
  const fLength = fPct * circumference;

  // Small gap between segments
  const gap = totalMacros > 0 ? 3 : 0;

  // Calculate draw lengths with gaps subtracted
  const pDraw = Math.max(0, pLength - gap);
  const cDraw = Math.max(0, cLength - gap);
  const fDraw = Math.max(0, fLength - gap);

  // Calculate offsets (Starting at the end of the previous segment)
  // Stroke array structure: [drawn_length, remaining_empty_space]
  // Offset moves the starting point backwards
  const pOffset = 0;
  const cOffset = pLength;
  const fOffset = pLength + cLength;

  const caloriesPercentage =
    targets.calories > 0 ? (dayTotals.calories / targets.calories) * 100 : 0;
  const isCaloriesOver = dayTotals.calories > targets.calories;

  return (
    <div className='relative overflow-hidden bg-surface-900 rounded-3xl border border-surface-800 p-6 shadow-2xl'>
      {/* Subtle energetic glow in the background */}
      <div className='absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none' />
      <div className='absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none' />

      <h3 className='text-sm font-bold text-slate-300 uppercase mb-8 flex items-center gap-2 tracking-widest relative z-10'>
        <Utensils
          size={18}
          className='text-blue-400'
        />{" "}
        Resumen Nutricional
      </h3>

      <div className='flex items-center gap-8 mb-8 relative z-10'>
        {/* SVG Calorímetro */}
        <div className='relative flex items-center justify-center filter drop-shadow-[0_0_15px_rgba(0,0,0,0.15)] shrink-0'>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className='transform -rotate-90'
          >
            {/* Background track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill='none'
              stroke='currentColor'
              strokeWidth={strokeWidth}
              className='text-surface-800'
              strokeLinecap='butt'
            />

            {/* Protein */}
            {pDraw > 0 && (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill='none'
                stroke='currentColor'
                strokeWidth={strokeWidth}
                className='text-blue-500 transition-all duration-1000 ease-out'
                strokeDasharray={`${pDraw} ${circumference}`}
                strokeDashoffset={-pOffset}
                strokeLinecap='butt'
              />
            )}

            {/* Carbs */}
            {cDraw > 0 && (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill='none'
                stroke='currentColor'
                strokeWidth={strokeWidth}
                className='text-purple-500 transition-all duration-1000 ease-out'
                strokeDasharray={`${cDraw} ${circumference}`}
                strokeDashoffset={-cOffset}
                strokeLinecap='butt'
              />
            )}

            {/* Fats */}
            {fDraw > 0 && (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill='none'
                stroke='currentColor'
                strokeWidth={strokeWidth}
                className='text-yellow-500 transition-all duration-1000 ease-out'
                strokeDasharray={`${fDraw} ${circumference}`}
                strokeDashoffset={-fOffset}
                strokeLinecap='butt'
              />
            )}
          </svg>

          {/* Inner Text */}
          <div className='absolute inset-0 flex flex-col items-center justify-center'>
            <span
              className={`text-3xl font-mono font-black tracking-tighter ${isCaloriesOver ? "text-red-400" : "text-white"}`}
            >
              {Math.round(dayTotals.calories)}
            </span>
            <span className='text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5'>
              Kcal
            </span>
          </div>
        </div>

        {/* Info de Calorías */}
        <div className='flex-1 space-y-4'>
          <div className='flex justify-between items-end'>
            <div className='flex flex-col'>
              <span className='text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1'>
                Objetivo Total
              </span>
              <span className='text-3xl font-mono font-black text-white'>
                {targets.calories}{" "}
                <span className='text-sm text-slate-500 tracking-normal font-sans font-medium'>
                  kcal
                </span>
              </span>
            </div>
            <div className='bg-surface-800/60 px-2.5 py-1 rounded-lg border border-surface-700/50 flex items-center justify-center mb-1 shadow-inner'>
              <span className='text-sm font-bold text-slate-300'>
                {Math.round(caloriesPercentage)}%
              </span>
            </div>
          </div>

          <div className='h-3 bg-surface-950/80 rounded-full overflow-hidden border border-surface-800/80 shadow-inner'>
            <div
              className={`h-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(0,0,0,0.4)] ${isCaloriesOver ? "bg-red-500" : "bg-linear-to-r from-emerald-500 to-green-400"} relative`}
              style={{ width: `${Math.min(caloriesPercentage, 100)}%` }}
            >
              <div className='absolute top-0 inset-x-0 h-px bg-white/30' />
            </div>
          </div>

          <p
            className={`text-[11px] font-medium ${isCaloriesOver ? "text-red-400" : "text-slate-400"}`}
          >
            {isCaloriesOver
              ? `Uy, te has pasado por ${Math.round(dayTotals.calories - targets.calories)} kcal`
              : `${Math.round(targets.calories - dayTotals.calories)} kcal restantes para superarte hoy`}
          </p>
        </div>
      </div>

      {/* Macro Bars */}
      <div className='grid grid-cols-1 gap-5 pt-4 border-t border-surface-800/50 relative z-10'>
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
