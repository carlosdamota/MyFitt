import React, { ChangeEvent, FormEvent } from "react";
import { User, Weight, Ruler } from "lucide-react";
import type { ProfileFormData } from "../../types";

interface ProfileFormProps {
  formData: ProfileFormData;
  handleChange: (field: keyof ProfileFormData, value: any) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  isSaving: boolean;
  isGenerating: boolean;
  savedSuccess: boolean;
  isPro?: boolean;
  onUpgrade?: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  formData,
  handleChange,
  handleSubmit,
  isSaving,
  isGenerating,
  savedSuccess,
  isPro,
  onUpgrade,
}) => {
  return (
    <form
      onSubmit={handleSubmit}
      className='space-y-6'
    >
      <div className='bg-white dark:bg-surface-900/50 p-4 rounded-2xl border border-slate-200 dark:border-surface-800 shadow-sm dark:shadow-none'>
        <h3 className='text-sm font-bold text-slate-800 dark:text-slate-400 uppercase mb-4 flex items-center gap-2'>
          <User size={16} /> Datos Personales
        </h3>

        <div className='grid grid-cols-2 gap-4 mb-4'>
          <div>
            <label className='text-xs text-slate-500 mb-1 flex items-center gap-1'>
              <Weight size={12} /> Peso (kg)
            </label>
            <input
              type='number'
              value={formData.weight}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleChange("weight", e.target.value)
              }
              className='w-full bg-slate-50 dark:bg-surface-950 border border-slate-200 dark:border-surface-700 rounded-lg p-2 text-slate-900 dark:text-white text-sm focus:border-primary-500 outline-none'
              placeholder='Ej. 75'
            />
          </div>
          <div>
            <label className='text-xs text-slate-500 mb-1 flex items-center gap-1'>
              <Ruler size={12} /> Altura (cm)
            </label>
            <input
              type='number'
              value={formData.height}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleChange("height", e.target.value)
              }
              className='w-full bg-slate-50 dark:bg-surface-950 border border-slate-200 dark:border-surface-700 rounded-lg p-2 text-slate-900 dark:text-white text-sm focus:border-primary-500 outline-none'
              placeholder='Ej. 180'
            />
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='text-xs text-slate-500 mb-1'>Edad</label>
            <input
              type='number'
              value={formData.age}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange("age", e.target.value)}
              className='w-full bg-slate-50 dark:bg-surface-950 border border-slate-200 dark:border-surface-700 rounded-lg p-2 text-slate-900 dark:text-white text-sm focus:border-primary-500 outline-none'
              placeholder='Ej. 30'
            />
          </div>
          <div>
            <label className='text-xs text-slate-500 mb-1'>Género</label>
            <select
              value={formData.gender}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                handleChange("gender", e.target.value)
              }
              className='w-full bg-slate-50 dark:bg-surface-950 border border-slate-200 dark:border-surface-700/80 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 outline-none transition-all shadow-sm dark:shadow-inner hover:border-slate-300 dark:hover:border-surface-600 cursor-pointer appearance-none'
            >
              <option value='male'>Hombre</option>
              <option value='female'>Mujer</option>
              <option value='other'>Otro</option>
            </select>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ProfileForm;
