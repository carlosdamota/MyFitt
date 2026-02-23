import React, { ChangeEvent } from "react";
import { User, Weight, Ruler } from "lucide-react";
import { ProfileFormData } from "../../../types";

interface StepPersonalDataProps {
  formData: ProfileFormData;
  handleChange: (field: keyof ProfileFormData, value: any) => void;
}

export const StepPersonalData: React.FC<StepPersonalDataProps> = ({ formData, handleChange }) => {
  return (
    <div className='animate-in fade-in slide-in-from-right-4 duration-300'>
      <div className='text-center mb-8'>
        <div className='w-16 h-16 rounded-2xl bg-linear-to-br from-primary-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-4'>
          <User
            size={32}
            className='text-primary-400'
          />
        </div>
        <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-2 transition-colors'>
          Cuéntanos de ti
        </h2>
        <p className='text-sm text-slate-500 dark:text-slate-400'>
          Necesitamos algunos datos para personalizar tu experiencia
        </p>
      </div>

      <div className='space-y-4'>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='text-xs text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5 font-medium'>
              <Weight size={12} /> Peso (kg)
            </label>
            <input
              type='number'
              inputMode='decimal'
              value={formData.weight}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleChange("weight", e.target.value)
              }
              className='w-full bg-white dark:bg-surface-900/80 border border-slate-200 dark:border-surface-700/80 rounded-xl p-3 text-slate-900 dark:text-white text-sm focus:border-primary-400/60 outline-none transition-colors'
              placeholder='75'
            />
          </div>
          <div>
            <label className='text-xs text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5 font-medium'>
              <Ruler size={12} /> Altura (cm)
            </label>
            <input
              type='number'
              inputMode='decimal'
              value={formData.height}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleChange("height", e.target.value)
              }
              className='w-full bg-white dark:bg-surface-900/80 border border-slate-200 dark:border-surface-700/80 rounded-xl p-3 text-slate-900 dark:text-white text-sm focus:border-primary-400/60 outline-none transition-colors'
              placeholder='180'
            />
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='text-xs text-slate-500 dark:text-slate-400 mb-1.5 block font-medium'>
              Edad
            </label>
            <input
              type='number'
              inputMode='numeric'
              value={formData.age}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange("age", e.target.value)}
              className='w-full bg-white dark:bg-surface-900/80 border border-slate-200 dark:border-surface-700/80 rounded-xl p-3 text-slate-900 dark:text-white text-sm focus:border-primary-400/60 outline-none transition-colors'
              placeholder='30'
            />
          </div>
          <div>
            <label className='text-xs text-slate-500 dark:text-slate-400 mb-1.5 block font-medium'>
              Género
            </label>
            <select
              value={formData.gender}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                handleChange("gender", e.target.value)
              }
              className='w-full bg-white dark:bg-surface-900/80 border border-slate-200 dark:border-surface-700/80 rounded-xl p-3 text-slate-900 dark:text-white text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 outline-none transition-colors shadow-sm dark:shadow-inner hover:border-slate-300 dark:hover:border-surface-600 cursor-pointer appearance-none'
            >
              <option value='male'>Hombre</option>
              <option value='female'>Mujer</option>
              <option value='other'>Otro</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
