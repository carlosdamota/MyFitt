import React from "react";
import { Zap, Check } from "lucide-react";
import { ProfileFormData } from "../../../types";
import { splitOptions, focusAreaOptions } from "../constants";

interface StepStructureProps {
  formData: ProfileFormData;
  handleChange: (field: keyof ProfileFormData, value: any) => void;
}

export const StepStructure: React.FC<StepStructureProps> = ({ formData, handleChange }) => {
  return (
    <div className='animate-in fade-in slide-in-from-right-4 duration-300'>
      <div className='text-center mb-8'>
        <div className='w-16 h-16 rounded-2xl bg-linear-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4'>
          <Zap
            size={32}
            className='text-indigo-400'
          />
        </div>
        <h2 className='text-2xl font-bold text-white mb-2'>Arquitectura del Plan</h2>
        <p className='text-sm text-slate-400'>¿Cómo quieres estructurar tu progreso?</p>
      </div>

      <div className='space-y-6'>
        {/* Training Split */}
        <div>
          <label className='text-xs text-slate-400 mb-2 block font-medium uppercase tracking-wider'>
            División de Entrenamiento (Split)
          </label>
          <div className='grid grid-cols-1 gap-2'>
            {splitOptions.map((option) => (
              <button
                key={option.value}
                type='button'
                onClick={() => handleChange("trainingSplit", option.value)}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                  formData.trainingSplit === option.value
                    ? "border-indigo-400/70 bg-indigo-500/10 text-white"
                    : "border-surface-800 bg-surface-900/50 text-slate-400 hover:border-surface-700"
                }`}
              >
                <div>
                  <div className='font-bold text-sm'>{option.label}</div>
                  <div className='text-[10px] text-slate-500'>{option.desc}</div>
                </div>
                {formData.trainingSplit === option.value && (
                  <Check
                    size={16}
                    className='text-indigo-400'
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Focus Areas */}
        <div>
          <label className='text-xs text-slate-400 mb-2 block font-medium uppercase tracking-wider'>
            Zonas de Enfoque (Opcional)
          </label>
          <div className='grid grid-cols-3 gap-2'>
            {focusAreaOptions.map((option) => {
              const isSelected = formData.focusAreas?.includes(option.value);
              return (
                <button
                  key={option.value}
                  type='button'
                  onClick={() => {
                    const current = formData.focusAreas || [];
                    if (isSelected) {
                      handleChange(
                        "focusAreas",
                        current.filter((f) => f !== option.value),
                      );
                    } else if (current.length < 3) {
                      handleChange("focusAreas", [...current, option.value]);
                    }
                  }}
                  className={`py-3 rounded-xl border text-center transition-all ${
                    isSelected
                      ? "border-purple-400/70 bg-purple-500/10 text-white"
                      : "border-surface-800 bg-surface-900/50 text-slate-400 hover:border-surface-700"
                  }`}
                >
                  <span className='text-xl block mb-1'>{option.emoji}</span>
                  <span className='text-[10px] font-bold block leading-tight'>{option.label}</span>
                </button>
              );
            })}
          </div>
          <p className='text-[10px] text-slate-500 mt-2 text-center italic'>
            Selecciona hasta 3 zonas para darles prioridad
          </p>
        </div>
      </div>
    </div>
  );
};
