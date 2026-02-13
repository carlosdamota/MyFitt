import React, { ChangeEvent, useState, useRef, useEffect } from "react";
import { CircleCheck, Info, Loader2 } from "lucide-react";

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
      className='relative inline-block ml-1 align-middle'
      ref={tooltipRef}
    >
      <button
        type='button'
        onClick={(e) => {
          e.stopPropagation();
          setIsVisible(!isVisible);
        }}
        className='text-slate-600 hover:text-blue-400/80 transition-colors focus:outline-none'
      >
        <Info size={10} />
      </button>
      {isVisible && (
        <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-xl shadow-xl z-50 text-[10px] text-slate-300 pointer-events-none animate-in fade-in zoom-in-95 duration-200'>
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
  const [justSaved, setJustSaved] = useState(false);
  const isDisabled = isSaving || !weight || !reps;

  const handleSave = async () => {
    if (isDisabled) return;
    await onSave();
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1500);
  };

  const labelClasses =
    "flex items-center text-[7px] sm:text-[9px] text-slate-500 mb-1 font-semibold uppercase tracking-wider whitespace-nowrap";

  return (
    <div className='flex items-end gap-1 sm:gap-2'>
      <div className='flex-1 min-w-0'>
        <label className={labelClasses}>
          Peso
          <InfoTooltip text='Kilos levantados en la serie. Usa 0 si es solo peso corporal.' />
        </label>
        <input
          type='number'
          value={weight}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setWeight(e.target.value)}
          className='w-full bg-slate-950/30 border border-white/5 rounded-lg px-1 sm:px-2 py-2 text-[11px] sm:text-xs text-white focus:border-blue-500/40 focus:bg-slate-950/50 outline-none transition-all placeholder:text-slate-700'
          placeholder='kg'
        />
      </div>
      <div className='flex-1 min-w-0'>
        <label className={labelClasses}>
          Reps
          <InfoTooltip text='Repeticiones completas realizadas con buena técnica.' />
        </label>
        <input
          type='number'
          value={reps}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setReps(e.target.value)}
          className='w-full bg-slate-950/30 border border-white/5 rounded-lg px-1 sm:px-2 py-2 text-[11px] sm:text-xs text-white focus:border-blue-500/40 focus:bg-slate-950/50 outline-none transition-all placeholder:text-slate-700'
          placeholder='0'
        />
      </div>
      <div className='flex-1 min-w-0'>
        <label className={labelClasses}>
          Sets
          <InfoTooltip text='Series efectivas realizadas con este peso y repeticiones.' />
        </label>
        <input
          type='number'
          value={sets}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSets(e.target.value)}
          className='w-full bg-slate-950/30 border border-white/5 rounded-lg px-1 sm:px-2 py-2 text-[11px] sm:text-xs text-white focus:border-blue-500/40 focus:bg-slate-950/50 outline-none transition-all placeholder:text-slate-700'
        />
      </div>
      <div className='flex-1 min-w-0'>
        <label className={labelClasses}>
          Rpe
          <InfoTooltip text='Esfuerzo (1-10). 10 es fallo muscular, 8 es dejar 2 en reserva.' />
        </label>
        <input
          type='number'
          value={rpe}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setRpe(e.target.value)}
          className='w-full bg-slate-950/30 border border-white/5 rounded-lg px-1 sm:px-2 py-2 text-[11px] sm:text-xs text-white focus:border-blue-500/40 focus:bg-slate-950/50 outline-none transition-all placeholder:text-slate-700'
          placeholder='1-10'
        />
      </div>
      <div className='shrink-0 mb-px'>
        <button
          onClick={handleSave}
          disabled={isDisabled}
          className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg sm:rounded-xl transition-all duration-300 active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed ${
            justSaved
              ? "bg-green-500/20 text-green-400 border border-green-500/30 shadow-lg shadow-green-900/20"
              : "bg-blue-600/15 text-blue-400/80 border border-blue-500/20 hover:bg-blue-500/30 hover:text-white hover:shadow-lg hover:shadow-blue-900/20"
          }`}
          title='Guardar serie'
        >
          {isSaving ? (
            <Loader2
              size={16}
              className='animate-spin'
            />
          ) : (
            <CircleCheck
              size={18}
              className={justSaved ? "animate-in zoom-in duration-300" : ""}
            />
          )}
        </button>
      </div>
    </div>
  );
};

export default SetEntryForm;
