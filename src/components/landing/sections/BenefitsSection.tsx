import React from "react";
import { Zap, Target, Shield, Activity, BarChart2 } from "lucide-react";
import { FeatureCard } from "../FeatureCard";

export const BenefitsSection: React.FC = () => {
  return (
    <section
      className='mb-20'
      aria-labelledby='benefits-title'
    >
      <div className='grid md:grid-cols-[1fr,0.9fr] gap-10 items-center'>
        <div className='space-y-6'>
          <p className='text-sm uppercase tracking-[0.2em] text-slate-500'>Beneficios reales</p>
          <h2
            id='benefits-title'
            className='text-3xl md:text-4xl font-bold text-slate-900 dark:text-white transition-colors'
          >
            Planificación clara, ejecución sin dudas
          </h2>
          <p className='text-slate-400'>
            Los bloques de entrenamiento vienen con descansos sugeridos, foco muscular y sugerencias
            inteligentes. No pierdes tiempo pensando qué hacer: solo entrenas.
          </p>
          <div className='grid sm:grid-cols-2 gap-4'>
            <FeatureCard
              icon={
                <Zap
                  size={20}
                  className='text-warning-300'
                />
              }
              title='Sesiones precisas'
              desc='Bloques con volumen y descanso definidos para cada día.'
            />
            <FeatureCard
              icon={
                <Target
                  size={20}
                  className='text-primary-300'
                />
              }
              title='Objetivo claro'
              desc='Rutinas alineadas a fuerza, hipertrofia o perdida grasa.'
            />
            <FeatureCard
              icon={
                <Shield
                  size={20}
                  className='text-emerald-300'
                />
              }
              title='Datos privados'
              desc='Tu historial es tuyo, sin anuncios ni rastreo invasivo.'
            />
            <FeatureCard
              icon={
                <Activity
                  size={20}
                  className='text-indigo-300'
                />
              }
              title='Feedback IA'
              desc='Análisis semanal y variaciones de ejercicios.'
            />
            <FeatureCard
              icon={
                <svg
                  className='w-5 h-5 text-orange-500'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                >
                  <path d='M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169' />
                </svg>
              }
              title='Sincronización Strava'
              desc='Sube y analiza tus sesiones directamente con tu comunidad.'
            />
            <FeatureCard
              icon={
                <BarChart2
                  size={20}
                  className='text-blue-400'
                />
              }
              title='Progreso Guiado'
              desc='Rachas, cálculo del tonelaje y progresión de fuerza.'
            />
          </div>
        </div>

        {/* Visual Element - hidden from screen readers */}
        <div
          className='rounded-3xl border border-slate-200 dark:border-surface-800 bg-white/60 dark:bg-surface-900/60 p-6 shadow-lg dark:shadow-2xl transition-colors'
          aria-hidden='true'
        >
          <p className='text-sm text-slate-400'>Vista rápida</p>
          <h3 className='text-2xl font-bold text-slate-900 dark:text-white mb-4 transition-colors'>
            Panel de entrenamiento
          </h3>
          <div className='space-y-3'>
            <div className='rounded-2xl border border-slate-200 dark:border-surface-800 bg-slate-50 dark:bg-surface-950/60 p-4 transition-colors'>
              <p className='text-xs text-slate-400'>Hoy</p>
              <p className='text-slate-900 dark:text-white font-semibold transition-colors'>
                Empuje + Core
              </p>
              <p className='text-xs text-slate-500'>6 ejercicios · 42 min</p>
            </div>
            <div className='rounded-2xl border border-slate-200 dark:border-surface-800 bg-slate-50 dark:bg-surface-950/60 p-4 transition-colors'>
              <p className='text-xs text-slate-400'>IA Coach</p>
              <p className='text-slate-900 dark:text-white font-semibold transition-colors'>
                Buen progreso, sube 2.5 kg en press
              </p>
              <p className='text-xs text-slate-500'>Consistencia 86%</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
