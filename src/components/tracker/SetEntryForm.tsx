import React, { ChangeEvent } from "react";
import { Save } from "lucide-react";

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
          <label className='block text-[10px] text-slate-500 mb-1 font-bold'>PESO</label>
          <input
            type='number'
            value={weight}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setWeight(e.target.value)}
            className='w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-white focus:border-blue-500 outline-none transition-colors'
            placeholder='kg'
          />
        </div>
        <div className='col-span-1'>
          <label className='block text-[10px] text-slate-500 mb-1 font-bold'>REPS</label>
          <input
            type='number'
            value={reps}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setReps(e.target.value)}
            className='w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-white focus:border-blue-500 outline-none transition-colors'
            placeholder='0'
          />
        </div>
        <div className='col-span-1'>
          <label className='block text-[10px] text-slate-500 mb-1 font-bold'>SETS</label>
          <input
            type='number'
            value={sets}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSets(e.target.value)}
            className='w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-white focus:border-blue-500 outline-none transition-colors'
          />
        </div>
        <div className='col-span-1'>
          <label className='block text-[10px] text-slate-500 mb-1 font-bold'>RPE</label>
          <input
            type='number'
            value={rpe}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setRpe(e.target.value)}
            className='w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-white focus:border-blue-500 outline-none transition-colors'
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
