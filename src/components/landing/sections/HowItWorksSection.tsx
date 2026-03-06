import React from "react";
import { StepCard } from "../StepCard";

export const HowItWorksSection: React.FC = () => {
  return (
    <section
      className='mb-20'
      aria-labelledby='how-it-works-title'
    >
      <div className='flex items-end justify-between mb-8 flex-wrap gap-4'>
        <div>
          <p className='text-sm uppercase tracking-[0.2em] text-slate-500'>Cómo funciona</p>
          <h2
            id='how-it-works-title'
            className='text-3xl md:text-4xl font-bold text-slate-900 dark:text-white transition-colors'
          >
            De cero a plan completo en 3 pasos
          </h2>
        </div>
        <div className='text-sm text-slate-400 max-w-md'>
          Configura tu perfil, deja que la IA componga el plan, y registra progreso con feedback
          accionable.
        </div>
      </div>
      <div className='grid md:grid-cols-3 gap-6'>
        <StepCard
          step='01'
          title='Define tu contexto'
          desc='Equipo, días disponibles, objetivo y nivel. Lo esencial, sin ruido.'
        />
        <StepCard
          step='02'
          title='Genera tu semana'
          desc='La IA diseña bloques de ejercicios con descansos y progresión.'
        />
        <StepCard
          step='03'
          title='Mide y ajusta'
          desc='Registra sesiones, ve volumen y recibe feedback inmediato.'
        />
      </div>
    </section>
  );
};
