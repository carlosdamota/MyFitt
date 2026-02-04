import React, { ChangeEvent, FormEvent } from "react";
import {
  User,
  Weight,
  Ruler,
  Utensils,
  Target,
  Calendar,
  Clock,
  Dumbbell,
  AlertCircle,
} from "lucide-react";
import type { ProfileFormData } from "../../types";

interface ProfileFormProps {
  formData: ProfileFormData;
  handleChange: (field: keyof ProfileFormData, value: string | number) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  isSaving: boolean;
  isGenerating: boolean;
  savedSuccess: boolean;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  formData,
  handleChange,
  handleSubmit,
  isSaving,
  isGenerating,
  savedSuccess,
}) => {
  return (
    <form
      onSubmit={handleSubmit}
      className='space-y-6'
    >
      <div className='bg-slate-900/50 p-4 rounded-2xl border border-slate-800'>
        <h3 className='text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2'>
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
              className='w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none'
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
              className='w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none'
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
              className='w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none'
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
              className='w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none'
            >
              <option value='male'>Hombre</option>
              <option value='female'>Mujer</option>
              <option value='other'>Otro</option>
            </select>
          </div>

          <div>
            <label className='text-xs text-slate-500 mb-1 flex items-center gap-1'>
              <Utensils size={12} /> Tipo de Dieta
            </label>
            <select
              value={formData.dietType || "balanced"}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                handleChange("dietType", e.target.value)
              }
              className='w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none'
            >
              <option value='balanced'>Equilibrada (Estándar)</option>
              <option value='high_protein'>Alta en Proteína</option>
              <option value='keto'>Keto (Cetogénica)</option>
              <option value='paleo'>Paleo</option>
              <option value='low_carb'>Baja en Carbohidratos</option>
            </select>
          </div>
        </div>
      </div>

      <div className='bg-slate-900/50 p-4 rounded-2xl border border-slate-800'>
        <h3 className='text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2'>
          <Target size={16} /> Objetivos y Contexto
        </h3>

        <div className='space-y-4'>
          <div>
            <label className='text-xs text-slate-500 mb-1'>Objetivo Principal</label>
            <select
              value={formData.goal}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => handleChange("goal", e.target.value)}
              className='w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none'
            >
              <option value='muscle_gain'>Ganar Músculo (Hipertrofia)</option>
              <option value='strength'>Ganar Fuerza</option>
              <option value='fat_loss'>Perder Grasa</option>
              <option value='endurance'>Resistencia / Salud General</option>
            </select>
          </div>

          <div>
            <label className='text-xs text-slate-500 mb-1'>Nivel de Experiencia</label>
            <select
              value={formData.experienceLevel}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                handleChange("experienceLevel", e.target.value)
              }
              className='w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none'
            >
              <option value='beginner'>Principiante (0-1 años)</option>
              <option value='intermediate'>Intermedio (1-3 años)</option>
              <option value='advanced'>Avanzado (3+ años)</option>
            </select>
          </div>

          <div>
            <label className='text-xs text-slate-500 mb-1 flex items-center gap-1'>
              <Calendar size={12} /> Días Disponibles por Semana
            </label>
            <div className='flex gap-2'>
              {[2, 3, 4, 5, 6].map((days) => (
                <button
                  key={days}
                  type='button'
                  onClick={() => handleChange("availableDays", days)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors ${formData.availableDays === days ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-950 border-slate-700 text-slate-500 hover:border-slate-500"}`}
                >
                  {days}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className='text-xs text-slate-500 mb-1 flex items-center gap-1'>
              <Clock size={12} /> Tiempo Disponible por Sesión (minutos)
            </label>
            <div className='flex gap-2'>
              {[30, 45, 60, 75, 90].map((time) => (
                <button
                  key={time}
                  type='button'
                  onClick={() => handleChange("dailyTimeMinutes", time)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors ${formData.dailyTimeMinutes === time ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-950 border-slate-700 text-slate-500 hover:border-slate-500"}`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className='text-xs text-slate-500 mb-1 flex items-center gap-1'>
              <Dumbbell size={12} /> Equipamiento Disponible
            </label>
            <select
              value={formData.equipment}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                handleChange("equipment", e.target.value)
              }
              className='w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none'
            >
              <option value='gym_full'>Gimnasio Completo</option>
              <option value='home_gym'>Home Gym (Barra + Jaula)</option>
              <option value='dumbbells_only'>Solo Mancuernas</option>
              <option value='bodyweight'>Peso Corporal (Calistenia)</option>
            </select>
          </div>

          <div>
            <label className='text-xs text-slate-500 mb-1 flex items-center gap-1'>
              <AlertCircle size={12} /> Lesiones / Limitaciones
            </label>
            <textarea
              value={formData.injuries}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                handleChange("injuries", e.target.value)
              }
              className='w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none h-20 resize-none'
              placeholder='Ej. Dolor lumbar, hombro derecho sensible...'
            />
          </div>
        </div>
      </div>
    </form>
  );
};

export default ProfileForm;
