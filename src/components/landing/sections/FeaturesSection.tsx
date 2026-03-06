import React from "react";
import { Dumbbell, Sparkles, Utensils, BarChart2 } from "lucide-react";
import { OptionCard } from "../OptionCard";

export const FeaturesSection: React.FC = () => {
  return (
    <section
      className='mb-20'
      aria-labelledby='features-title'
    >
      <div className='flex items-end justify-between mb-8 flex-wrap gap-4'>
        <div>
          <p className='text-sm uppercase tracking-[0.2em] text-slate-500'>Opciones</p>
          <h2
            id='features-title'
            className='text-3xl md:text-4xl font-bold text-slate-900 dark:text-white transition-colors'
          >
            Todo lo que necesitas en un panel
          </h2>
        </div>
        <p className='text-sm text-slate-400 max-w-md'>
          Alterna entre rutinas, nutrición, IA y estadísticas sin perder el contexto.
        </p>
      </div>
      <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-5'>
        <OptionCard
          icon={
            <Dumbbell
              size={20}
              className='text-primary-300'
            />
          }
          title='Rutinas dinámicas'
          desc='Edita días, guarda programas y sincroniza tu progreso.'
        />
        <OptionCard
          icon={
            <Sparkles
              size={20}
              className='text-emerald-300'
            />
          }
          title='Generador IA'
          desc='Planes semanales, variantes de ejercicios y análisis.'
        />
        <OptionCard
          icon={
            <Utensils
              size={20}
              className='text-warning-300'
            />
          }
          title='Nutrición práctica'
          desc='Registros rápidos y macros sugeridos por objetivo.'
        />
        <OptionCard
          icon={
            <BarChart2
              size={20}
              className='text-indigo-300'
            />
          }
          title='Progreso visible'
          desc='Volumen, consistencia y rachas con gráfica clara.'
        />
      </div>
    </section>
  );
};
