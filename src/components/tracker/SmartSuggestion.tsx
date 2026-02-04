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
      className='mb-4 w-full group relative overflow-hidden bg-linear-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 p-2.5 rounded-xl flex items-center justify-between hover:border-blue-400/60 transition-all active:scale-[0.98]'
      title='Toca para aplicar esta sugerencia automáticamente'
    >
      <div className='flex items-center gap-3'>
        <div className='bg-blue-500/20 p-2 rounded-lg group-hover:bg-blue-500/30 transition-colors'>
          <ZapOff
            size={16}
            className='text-blue-400'
          />
        </div>
        <div className='flex flex-col items-start'>
          <span className='text-[10px] text-blue-300 font-bold uppercase tracking-wider'>
            Siguiente Paso Sugerido
          </span>
          <span className='text-sm text-white font-medium'>{suggestion.text}</span>
        </div>
      </div>
      <div className='flex items-center gap-2 bg-blue-500/20 px-2 py-1 rounded-md border border-blue-500/30 text-[10px] font-bold text-blue-300 group-hover:bg-blue-500/40 transition-colors'>
        AUTO-LLENAR
      </div>

      <div className='absolute inset-0 bg-linear-to-r from-transparent via-blue-400/5 to-transparent -translate-x-full group-hover:animate-shimmer' />
    </button>
  );
};

export default SmartSuggestion;
