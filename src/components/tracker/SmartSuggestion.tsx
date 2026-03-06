import React from "react";
import { Zap } from "lucide-react";

interface SmartSuggestionData {
  weight: number;
  reps: number;
  text: string;
  type: "increase" | "reps" | "steady";
}

interface SmartSuggestionProps {
  suggestion: SmartSuggestionData | null;
  onApply: () => void;
}

const SmartSuggestion: React.FC<SmartSuggestionProps> = ({ suggestion, onApply }) => {
  if (!suggestion) return null;

  return (
    <button
      onClick={onApply}
      className='mb-3 w-full group relative overflow-hidden bg-blue-50 dark:bg-surface-950/80 border border-blue-200 dark:border-primary-500/30 p-2.5 rounded-2xl flex items-center justify-between gap-3 hover:border-blue-300 dark:hover:border-primary-400/50 transition-all active:scale-[0.98] shadow-sm dark:shadow-lg dark:shadow-primary-950/20'
      title='Toca para aplicar esta sugerencia automáticamente'
    >
      <div className='flex flex-col items-start min-w-0 flex-1'>
        <span className='text-[9px] text-blue-600 dark:text-primary-300 font-bold uppercase tracking-wider mb-0.5'>
          Sugerencia
        </span>
        <span className='text-[13px] text-slate-800 dark:text-slate-100 font-medium text-left leading-tight text-balance'>
          {suggestion.text}
        </span>
      </div>

      <div className='flex items-center justify-center bg-blue-100 dark:bg-primary-500/20 px-2 py-1 rounded-lg border border-blue-200 dark:border-primary-500/30 text-[9px] font-bold text-blue-700 dark:text-primary-300 group-hover:bg-blue-200 dark:group-hover:bg-primary-500/40 transition-colors uppercase tracking-wide shrink-0'>
        Aplicar
      </div>

      <div className='absolute inset-0 bg-linear-to-r from-transparent via-blue-500/5 dark:via-primary-400/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none' />
    </button>
  );
};

export default SmartSuggestion;
