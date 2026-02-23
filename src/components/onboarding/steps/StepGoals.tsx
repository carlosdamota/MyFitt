import React from "react";
import { Target } from "lucide-react";
import { ProfileFormData } from "../../../types";
import { goalOptions, levelOptions } from "../constants";

interface StepGoalsProps {
  formData: ProfileFormData;
  handleChange: (field: keyof ProfileFormData, value: any) => void;
}

export const StepGoals: React.FC<StepGoalsProps> = ({ formData, handleChange }) => {
  return (
    <div className='animate-in fade-in slide-in-from-right-4 duration-300'>
      <div className='text-center mb-8'>
        <div className='w-16 h-16 rounded-2xl bg-linear-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4'>
          <Target
            size={32}
            className='text-amber-400'
          />
        </div>
        <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-2 transition-colors'>
          ¿Qué quieres conseguir?
        </h2>
        <p className='text-sm text-slate-500 dark:text-slate-400'>
          Selecciona tu objetivo principal y tu nivel
        </p>
      </div>

      <div className='space-y-6'>
        {/* Goal selection — big visual cards */}
        <div className='grid grid-cols-2 gap-3'>
          {goalOptions.map((option) => (
            <button
              key={option.value}
              type='button'
              onClick={() => handleChange("goal", option.value)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 ${
                formData.goal === option.value
                  ? "border-amber-400/70 bg-amber-500/10 shadow-lg shadow-amber-900/10 scale-[1.02]"
                  : "border-slate-200 dark:border-surface-800 bg-white dark:bg-surface-900/50 hover:border-slate-300 dark:hover:border-surface-700"
              }`}
            >
              <span className='text-2xl block mb-2'>{option.emoji}</span>
              <span className='text-sm font-bold text-slate-900 dark:text-white block transition-colors'>
                {option.label}
              </span>
              <span className='text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5'>
                {option.desc}
              </span>
            </button>
          ))}
        </div>

        {/* Experience level */}
        <div>
          <label className='text-xs text-slate-500 dark:text-slate-400 mb-2 block font-medium'>
            Nivel de experiencia
          </label>
          <div className='grid grid-cols-3 gap-2'>
            {levelOptions.map((option) => (
              <button
                key={option.value}
                type='button'
                onClick={() => handleChange("experienceLevel", option.value)}
                className={`py-3 px-2 rounded-xl border text-center transition-all duration-200 ${
                  formData.experienceLevel === option.value
                    ? "border-amber-400/70 bg-amber-500/10 text-slate-900 dark:text-white"
                    : "border-slate-200 dark:border-surface-800 bg-white dark:bg-surface-900/50 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-surface-700"
                }`}
              >
                <span className='text-xs font-bold block'>{option.label}</span>
                <span className='text-[10px] text-slate-500 block mt-0.5'>{option.years}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
