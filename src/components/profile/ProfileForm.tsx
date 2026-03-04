import React, { ChangeEvent, FormEvent } from "react";
import {
  User,
  Weight,
  Ruler,
  BrainCircuit,
  Heart,
  Shield,
  FlaskConical,
  Activity,
  Lock,
} from "lucide-react";
import { cn } from "../ui/Button";
import type { ProfileFormData } from "../../types";

interface ProfileFormProps {
  formData: ProfileFormData;
  handleChange: (field: keyof ProfileFormData, value: any) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  isSaving: boolean;
  isGenerating: boolean;
  onUpgrade?: () => void;
  savedSuccess: boolean;
  isPro?: boolean;
}

const coachPersonalities = [
  {
    id: "motivador",
    label: "Motivador",
    description: "Apoyo constante y energía positiva para no rendirse.",
    Icon: Heart,
    color: "text-secondary-400",
    activeGlow: "shadow-[0_0_20px_rgba(16,185,129,0.3)]",
  },
  {
    id: "sargento",
    label: "Sargento",
    description: "Disciplina militar. Sin excusas, sin descanso.",
    Icon: Shield,
    color: "text-red-400",
    activeGlow: "shadow-[0_0_20px_rgba(248,113,113,0.3)]",
  },
  {
    id: "cientifico",
    label: "Científico",
    description: "Datos, métricas y evidencia para optimizar cada sesión.",
    Icon: FlaskConical,
    color: "text-primary-400",
    activeGlow: "shadow-[0_0_20px_rgba(6,182,212,0.3)]",
  },
  {
    id: "fisioterapeuta",
    label: "Fisio",
    description: "Salud, movilidad y recuperación como prioridad.",
    Icon: Activity,
    color: "text-accent-400",
    activeGlow: "shadow-[0_0_20px_rgba(139,92,246,0.3)]",
  },
];

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
      {/* Datos Personales */}
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
              min={30}
              max={300}
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
              min={100}
              max={250}
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
              min={13}
              max={120}
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

      {/* Entrenadores Inteligentes */}
      <div className='bg-white dark:bg-surface-900/40 backdrop-blur-xl p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none'>
        {/* Header */}
        <div className='flex items-center gap-2 mb-1'>
          <div className='flex items-center justify-center w-7 h-7 rounded-lg bg-primary-500/10'>
            <BrainCircuit
              size={15}
              className='text-primary-400'
            />
          </div>
          <h3 className='text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wide'>
            Entrenadores Inteligentes
          </h3>
        </div>
        <p className='text-xs text-slate-500 dark:text-slate-400 mb-5 pl-9'>
          Elige el estilo de tu Coach IA para generar reportes y análisis.
        </p>

        {/* Coach Personal — label */}
        <p className='text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3'>
          Personalidad del Coach
        </p>

        {/* Coach cards grid */}
        <div className='grid grid-cols-2 gap-3 mb-5'>
          {coachPersonalities.map(({ id, label, description, Icon, color, activeGlow }) => {
            const isActive = formData.coachPersonality === id;
            return (
              <button
                key={id}
                type='button'
                onClick={() => handleChange("coachPersonality", id)}
                className={cn(
                  "flex flex-col items-start gap-2 p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer",
                  isActive
                    ? cn(
                        "bg-linear-to-br from-primary-500 to-accent-500 border-transparent text-white",
                        activeGlow,
                        "scale-[1.02]",
                      )
                    : "bg-slate-50 dark:bg-surface-800/60 border-slate-200 dark:border-surface-700/50 hover:border-primary-500/40 dark:hover:border-primary-500/30 hover:bg-slate-100 dark:hover:bg-surface-800",
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200",
                    isActive ? "bg-white/20" : "bg-slate-100 dark:bg-surface-700/60",
                  )}
                >
                  <Icon
                    size={16}
                    className={isActive ? "text-white" : color}
                  />
                </div>
                <div>
                  <p
                    className={cn(
                      "text-sm font-bold leading-none mb-1",
                      isActive ? "text-white" : "text-slate-800 dark:text-slate-100",
                    )}
                  >
                    {label}
                  </p>
                  <p
                    className={cn(
                      "text-[11px] leading-tight hidden sm:block",
                      isActive ? "text-white/80" : "text-slate-500 dark:text-slate-400",
                    )}
                  >
                    {description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Nutricionista – Coming soon card */}
        <div className='relative overflow-hidden rounded-xl border border-dashed border-slate-200 dark:border-surface-700/50 bg-slate-50/50 dark:bg-surface-800/30 p-4'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 dark:bg-surface-700/50'>
              <Lock
                size={16}
                className='text-slate-400 dark:text-slate-500'
              />
            </div>
            <div>
              <p className='text-sm font-bold text-slate-500 dark:text-slate-400'>
                Nutricionista IA
              </p>
              <p className='text-[11px] text-slate-400 dark:text-slate-500'>
                Próximamente — personalidad para tus análisis nutricionales.
              </p>
            </div>
          </div>
          {/* Decorative gradient badge */}
          <div className='absolute top-3 right-3'>
            <span className='text-[10px] font-bold uppercase tracking-widest bg-accent-500/10 text-accent-400 border border-accent-500/20 px-2 py-0.5 rounded-full'>
              Próximamente
            </span>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ProfileForm;
