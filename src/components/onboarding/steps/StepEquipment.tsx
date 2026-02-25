import React, { ChangeEvent } from "react";
import { Dumbbell, Calendar, Crown, Clock, AlertCircle } from "lucide-react";
import { ProfileFormData, EquipmentOption } from "../../../types";
import { equipmentOptions, FREE_MAX_DAYS } from "../constants";

interface StepEquipmentProps {
  formData: ProfileFormData;
  handleChange: (field: keyof ProfileFormData, value: any) => void;
  toggleEquipment: (value: EquipmentOption) => void;
}

export const StepEquipment: React.FC<StepEquipmentProps> = ({
  formData,
  handleChange,
  toggleEquipment,
}) => {
  return (
    <div className='animate-in fade-in slide-in-from-right-4 duration-300'>
      <div className='text-center mb-8'>
        <div className='w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4'>
          <Dumbbell
            size={32}
            className='text-blue-400'
          />
        </div>
        <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-2 transition-colors'>
          ¿Con qué cuentas?
        </h2>
        <p className='text-sm text-slate-500 dark:text-slate-400'>
          Tu equipo y disponibilidad semanal
        </p>
      </div>

      <div className='space-y-6'>
        {/* Equipment chips */}
        <div>
          <label className='text-xs text-slate-500 dark:text-slate-400 mb-2 block font-medium'>
            Equipamiento disponible
          </label>
          <div className='flex flex-wrap gap-2'>
            {equipmentOptions.map((option) => {
              const isSelected = formData.equipment.includes(option.value);
              return (
                <button
                  key={option.value}
                  type='button'
                  onClick={() => toggleEquipment(option.value)}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-all select-none ${
                    isSelected
                      ? "border-primary-400/70 bg-primary-500/10 text-primary-700 dark:text-primary-100"
                      : "border-slate-200 dark:border-surface-800 bg-white dark:bg-surface-900/50 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-surface-700"
                  }`}
                >
                  <span className='flex flex-col gap-0.5 text-left'>
                    <span className='text-xs font-semibold'>{option.label}</span>
                    <span
                      className={`text-[10px] ${isSelected ? "text-primary-600/70 dark:text-primary-200/70" : "text-slate-500"}`}
                    >
                      {option.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Days available — free users limited to 2 */}
        <div>
          <label className='text-xs text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5 font-medium'>
            <Calendar size={12} /> Días por semana
          </label>
          <div className='flex items-center gap-2'>
            {[2, 3, 4, 5, 6].map((days) => {
              const isLocked = days > FREE_MAX_DAYS;
              return (
                <button
                  key={days}
                  type='button'
                  onClick={() => !isLocked && handleChange("availableDays", days)}
                  disabled={isLocked}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all relative ${
                    isLocked
                      ? "bg-surface-950/50 border-surface-800 text-slate-600 cursor-not-allowed opacity-50"
                      : formData.availableDays === days
                        ? "bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-900/20"
                        : "bg-surface-900/50 border-surface-700 text-slate-500 hover:border-surface-600"
                  }`}
                >
                  {days}
                  {isLocked && (
                    <Crown
                      size={8}
                      className='absolute top-1 right-1 text-amber-500/70'
                    />
                  )}
                </button>
              );
            })}
          </div>
          <p className='text-[10px] text-amber-500/70 mt-2 flex items-center gap-1'>
            <Crown size={10} /> Rutinas de 3+ días disponibles con Pro
          </p>
        </div>

        {/* Time per session */}
        <div>
          <label className='text-xs text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5 font-medium'>
            <Clock size={12} /> Minutos por sesión
          </label>
          <div className='flex items-center gap-2'>
            {[20, 30, 45, 60].map((t) => (
              <button
                key={t}
                type='button'
                onClick={() => handleChange("dailyTimeMinutes", t)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${
                  formData.dailyTimeMinutes === t
                    ? "bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-900/20"
                    : "bg-white dark:bg-surface-800/50 border-slate-200 dark:border-surface-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-surface-600"
                } shadow-sm`}
              >
                <span className='block text-lg font-black'>{t}</span>
                <span className='text-[10px] opacity-60 uppercase'>min</span>
              </button>
            ))}
          </div>
        </div>

        {/* Injuries */}
        <div>
          <label className='text-xs text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5 font-medium'>
            <AlertCircle size={12} /> Lesiones / Limitaciones (opcional)
          </label>
          <textarea
            value={formData.injuries}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              handleChange("injuries", e.target.value)
            }
            maxLength={200}
            className='w-full bg-white dark:bg-surface-900/80 border border-slate-200 dark:border-surface-700/80 rounded-xl p-3 text-slate-900 dark:text-white text-sm focus:border-primary-400/60 outline-none h-16 resize-none transition-colors'
            placeholder='Ej. Dolor lumbar, hombro derecho sensible... (Máx. 200 carácteres)'
          />
        </div>
      </div>
    </div>
  );
};
