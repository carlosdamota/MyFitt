import React, { ChangeEvent } from "react";
import { Target, Calendar, Clock, Dumbbell, AlertCircle, Check, Lock, Crown } from "lucide-react";
import type { ProfileFormData } from "../../types";

interface GoalsContextPanelProps {
  formData: ProfileFormData;
  onChange: (field: keyof ProfileFormData, value: string | number | string[]) => void;
  isPro?: boolean;
  onUpgrade?: () => void;
}

type EquipmentOption = ProfileFormData["equipment"][number];

const equipmentOptions: Array<{
  value: EquipmentOption;
  label: string;
  description: string;
}> = [
  { value: "gym_full", label: "Gimnasio completo", description: "Maquinas + libres" },
  { value: "home_gym", label: "Home gym", description: "Barra + jaula" },
  { value: "dumbbells_only", label: "Solo mancuernas", description: "Ajustables o fijas" },
  { value: "bodyweight", label: "Peso corporal", description: "Calistenia" },
  { value: "barbell_plates", label: "Barra y discos", description: "Peso libre" },
  { value: "pullup_bar", label: "Barra de dominadas", description: "Pared o puerta" },
  { value: "resistance_bands", label: "Bandas elasticas", description: "Ligeras/medias" },
  { value: "bench", label: "Banco", description: "Plano/inclinado" },
  { value: "kettlebells", label: "Kettlebells", description: "Balones rusos" },
];

const FREE_MAX_DAYS = 2;

const GoalsContextPanel: React.FC<GoalsContextPanelProps> = ({
  formData,
  onChange,
  isPro = false,
  onUpgrade,
}) => {
  const equipmentSelection = formData.equipment;
  const toggleEquipment = (value: EquipmentOption): void => {
    const nextSelection = equipmentSelection.includes(value)
      ? equipmentSelection.filter((item) => item !== value)
      : [...equipmentSelection, value];
    onChange("equipment", nextSelection);
  };

  return (
    <div className='bg-slate-900/50 p-4 rounded-2xl border border-slate-800'>
      <div className='flex items-start justify-between gap-3 mb-4'>
        <h3 className='text-sm font-bold text-slate-400 uppercase flex items-center gap-2'>
          <Target size={16} /> Objetivos y Contexto
        </h3>
        <p className='text-[11px] text-slate-500 mt-0.5'>Personaliza tu plan</p>
      </div>

      <div className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='rounded-xl border border-slate-800 bg-slate-950/60 p-3'>
            <label className='text-xs text-slate-500 mb-2 block'>Objetivo Principal</label>
            <select
              value={formData.goal}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange("goal", e.target.value)}
              className='w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none'
            >
              <option value='muscle_gain'>Ganar Musculo (Hipertrofia)</option>
              <option value='strength'>Ganar Fuerza</option>
              <option value='fat_loss'>Perder Grasa</option>
              <option value='endurance'>Resistencia / Salud General</option>
            </select>
          </div>

          <div className='rounded-xl border border-slate-800 bg-slate-950/60 p-3'>
            <label className='text-xs text-slate-500 mb-2 block'>Nivel de Experiencia</label>
            <select
              value={formData.experienceLevel}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                onChange("experienceLevel", e.target.value)
              }
              className='w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none'
            >
              <option value='beginner'>Principiante (0-1 anos)</option>
              <option value='intermediate'>Intermedio (1-3 anos)</option>
              <option value='advanced'>Avanzado (3+ anos)</option>
            </select>
          </div>
        </div>

        <div className='rounded-xl border border-slate-800 bg-slate-950/60 p-3'>
          <label className='text-xs text-slate-500 flex items-center gap-1'>
            <Calendar size={12} /> Dias Disponibles por Semana
          </label>
          <div className='mt-2 flex items-center gap-2 w-full'>
            {[2, 3, 4, 5, 6].map((days) => {
              const isLocked = !isPro && days > FREE_MAX_DAYS;
              return (
                <button
                  key={days}
                  type='button'
                  disabled={isLocked}
                  onClick={() => (isLocked ? onUpgrade?.() : onChange("availableDays", days))}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors relative ${
                    isLocked
                      ? "bg-slate-950/50 border-slate-800 text-slate-600 cursor-pointer hover:border-amber-600/50"
                      : formData.availableDays === days
                        ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20"
                        : "bg-slate-950 border-slate-700 text-slate-500 hover:border-slate-500 hover:bg-slate-900"
                  }`}
                  title={isLocked ? "Desbloquea más días con Pro" : undefined}
                >
                  {days}
                  {isLocked && (
                    <Crown className='absolute -top-1 -right-1 w-3 h-3 text-amber-500' />
                  )}
                </button>
              );
            })}
          </div>
          {!isPro && (
            <p className='text-[10px] text-amber-500/70 mt-2 flex items-center gap-1'>
              <Crown size={10} /> Rutinas de 3+ días exclusivas de Pro
            </p>
          )}

          <label className='text-xs text-slate-500 flex items-center gap-1 mt-4'>
            <Clock size={12} /> Tiempo Disponible por Sesion (minutos)
          </label>
          <div className='mt-2 flex items-center gap-2 w-full'>
            {[30, 45, 60, 75, 90].map((time) => (
              <button
                key={time}
                type='button'
                onClick={() => onChange("dailyTimeMinutes", time)}
                className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors ${
                  formData.dailyTimeMinutes === time
                    ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20"
                    : "bg-slate-950 border-slate-700 text-slate-500 hover:border-slate-500 hover:bg-slate-900"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        <div className='rounded-xl border border-slate-800 bg-slate-950/60 p-3'>
          <div className='flex items-center justify-between gap-2'>
            <label className='text-xs text-slate-500 flex items-center gap-1'>
              <Dumbbell size={12} /> Equipamiento Disponible
            </label>
            <span className='text-[10px] text-slate-500'>Selecciona todo lo que tengas</span>
          </div>
          <div className='mt-3 flex flex-wrap gap-2'>
            {equipmentOptions.map((option) => {
              const isSelected = equipmentSelection.includes(option.value);
              return (
                <label
                  key={option.value}
                  className={`group flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-colors focus-within:ring-1 focus-within:ring-cyan-400 select-none ${
                    isSelected
                      ? "border-cyan-400/70 bg-cyan-500/10 text-cyan-100"
                      : "border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-600"
                  }`}
                >
                  <input
                    type='checkbox'
                    className='sr-only'
                    checked={isSelected}
                    onChange={() => toggleEquipment(option.value)}
                  />
                  {/* <span
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                      isSelected ? "border-cyan-400 bg-cyan-400 text-slate-950" : "border-slate-600"
                    }`}
                  >
                    {isSelected && <Check size={12} />}
                  </span> */}
                  <span className='flex flex-col gap-0.5'>
                    <span className='text-xs font-semibold'>{option.label}</span>
                    <span
                      className={`text-[10px] ${
                        isSelected
                          ? "text-cyan-200/70"
                          : "text-slate-500 group-hover:text-slate-400"
                      }`}
                    >
                      {option.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div className='rounded-xl border border-slate-800 bg-slate-950/60 p-3'>
          <label className='text-xs text-slate-500 mb-2 flex items-center gap-1'>
            <AlertCircle size={12} /> Lesiones / Limitaciones
          </label>
          <textarea
            value={formData.injuries}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange("injuries", e.target.value)}
            className='w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none h-20 resize-none'
            placeholder='Ej. Dolor lumbar, hombro derecho sensible...'
          />
        </div>
      </div>
    </div>
  );
};

export default GoalsContextPanel;
