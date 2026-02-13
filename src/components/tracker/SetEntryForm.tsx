import React, { ChangeEvent, useState, useRef, useEffect } from "react";
import { Save, Info } from "lucide-react";

interface SetEntryFormProps {
  weight: string;
  setWeight: (val: string) => void;
  reps: string;
  setReps: (val: string) => void;
  sets: string;
  setSets: (val: string) => void;
  rpe: string;
  setRpe: (val: string) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
}

const InfoTooltip: React.FC<{ text: string }> = ({ text }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };
    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible]);

  return (
    <div
      className='relative inline-block ml-1.5 align-middle'
      ref={tooltipRef}
    >
      <button
        type='button'
        onClick={(e) => {
          e.stopPropagation();
          setIsVisible(!isVisible);
        }}
        className='text-slate-500 hover:text-blue-400 transition-colors focus:outline-none'
      >
        <Info size={12} />
      </button>
      {isVisible && (
        <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-xl shadow-xl z-50 text-xs text-slate-300 pointer-events-none animate-in fade-in zoom-in-95 duration-200'>
          {text}
          <div className='absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900/95' />
        </div>
      )}
    </div>
  );
};

const SetEntryForm: React.FC<SetEntryFormProps> = ({
  weight,
  setWeight,
  reps,
  setReps,
  sets,
  setSets,
  rpe,
  setRpe,
  onSave,
  isSaving,
}) => {
  return (
    <div className='space-y-3'>
      <div className='grid grid-cols-4 gap-2 mb-3'>
        <div className='col-span-1'>
          <label className='flex items-center text-[10px] text-slate-400 mb-1 font-bold'>
            PESO
            <InfoTooltip text='Kilos levantados en la serie. Usa 0 si es solo peso corporal.' />
          </label>
          <input
            type='number'
            value={weight}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setWeight(e.target.value)}
            className='w-full bg-slate-950/30 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:border-blue-500/50 focus:bg-slate-950/50 outline-none transition-all placeholder:text-slate-600'
            placeholder='kg'
          />
        </div>
        <div className='col-span-1'>
          <label className='flex items-center text-[10px] text-slate-400 mb-1 font-bold'>
            REPS
            <InfoTooltip text='Repeticiones completas realizadas con buena técnica.' />
          </label>
          <input
            type='number'
            value={reps}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setReps(e.target.value)}
            className='w-full bg-slate-950/30 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:border-blue-500/50 focus:bg-slate-950/50 outline-none transition-all placeholder:text-slate-600'
            placeholder='0'
          />
        </div>
        <div className='col-span-1'>
          <label className='flex items-center text-[10px] text-slate-400 mb-1 font-bold'>
            SETS
            <InfoTooltip text='Series efectivas realizadas con este peso y repeticiones.' />
          </label>
          <input
            type='number'
            value={sets}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSets(e.target.value)}
            className='w-full bg-slate-950/30 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:border-blue-500/50 focus:bg-slate-950/50 outline-none transition-all placeholder:text-slate-600'
          />
        </div>
        <div className='col-span-1'>
          <label className='flex items-center text-[10px] text-slate-400 mb-1 font-bold'>
            RPE
            <InfoTooltip text='Esfuerzo (1-10). 10 es fallo muscular, 8 es dejar 2 en reserva.' />
          </label>
          <input
            type='number'
            value={rpe}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setRpe(e.target.value)}
            className='w-full bg-slate-950/30 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:border-blue-500/50 focus:bg-slate-950/50 outline-none transition-all placeholder:text-slate-600'
            placeholder='1-10'
          />
        </div>
      </div>
      <button
        onClick={onSave}
        disabled={isSaving || !weight || !reps}
        className='w-full bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95'
      >
        {isSaving ? (
          "GUARDANDO..."
        ) : (
          <>
            <Save size={16} /> GUARDAR SERIE
          </>
        )}
      </button>
    </div>
  );
};

export default SetEntryForm;
