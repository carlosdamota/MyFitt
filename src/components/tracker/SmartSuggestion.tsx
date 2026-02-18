import React from "react";
import { ZapOff } from "lucide-react";

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
      className='mb-4 w-full group relative overflow-hidden bg-linear-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:border-blue-400/60 transition-all active:scale-[0.98]'
      title='Toca para aplicar esta sugerencia automáticamente'
    >
      <div className='flex items-start gap-3 flex-1 min-w-0'>
        <div className='bg-blue-500/20 p-2 rounded-lg group-hover:bg-blue-500/30 transition-colors shrink-0 mt-0.5 sm:mt-0'>
          <ZapOff
            size={16}
            className='text-blue-400'
          />
        </div>
        <div className='flex flex-col items-start min-w-0 flex-1'>
          <span className='text-[10px] text-blue-300 font-bold uppercase tracking-wider mb-0.5'>
            Siguiente Paso Sugerido
          </span>
          <span className='text-sm text-white font-medium text-left leading-tight text-balance'>
            {suggestion.text}
          </span>
        </div>
      </div>

      <div className='flex items-center justify-center w-full sm:w-auto bg-blue-500/20 px-3 py-1.5 rounded-lg border border-blue-500/30 text-[10px] font-bold text-blue-300 group-hover:bg-blue-500/40 transition-colors uppercase tracking-wide'>
        Auto-Llenar
      </div>

      <div className='absolute inset-0 bg-linear-to-r from-transparent via-blue-400/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none' />
    </button>
  );
};

export default SmartSuggestion;
