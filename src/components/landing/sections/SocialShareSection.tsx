import React from "react";
import { Share2, CheckCircle2 } from "lucide-react";

export const SocialShareSection: React.FC = () => {
  return (
    <section
      className='mb-24 grid lg:grid-cols-2 gap-16 lg:gap-10 items-center'
      aria-labelledby='social-share-title'
    >
      <div className='order-2 lg:order-1 relative h-[350px] md:h-[450px] flex items-center justify-center group cursor-pointer'>
        <div className='relative w-56 md:w-64 aspect-3/4'>
          {/* Background glow */}
          <div className='absolute inset-0 bg-accent-500/20 blur-3xl rounded-full scale-150 group-hover:bg-primary-500/30 transition-colors duration-700' />

          {/* Card 1 (Left) */}
          <div
            className='absolute inset-0 origin-bottom-left transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-lg rounded-2xl overflow-hidden border border-slate-200/50 dark:border-surface-800/50 bg-white dark:bg-surface-900 
            -rotate-12 -translate-x-6 scale-95 opacity-80
            group-hover:-rotate-24 group-hover:-translate-x-24 group-hover:-translate-y-4 group-hover:scale-100 group-hover:opacity-100 group-hover:shadow-2xl group-hover:z-20'
          >
            <img
              src='/assets/images/fittwiz-workout-2.webp'
              alt='Previsualización de rutina en estilo tarjeta oscura'
              width={300}
              height={400}
              loading='lazy'
              decoding='async'
              className='w-full h-full object-cover select-none pointer-events-none'
            />
            <div className='absolute inset-0 bg-linear-to-t from-slate-900/60 to-transparent' />
          </div>

          {/* Card 2 (Right) */}
          <div
            className='absolute inset-0 origin-bottom-right transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-lg rounded-2xl overflow-hidden border border-slate-200/50 dark:border-surface-800/50 bg-white dark:bg-surface-900 
            rotate-12 translate-x-6 scale-95 opacity-80
            group-hover:rotate-24 group-hover:translate-x-24 group-hover:-translate-y-4 group-hover:scale-100 group-hover:opacity-100 group-hover:shadow-2xl group-hover:z-20'
          >
            <img
              src='/assets/images/fittwiz-workout-3.webp'
              alt='Previsualización de rutina en estilo tarjeta clara y minimalista'
              width={300}
              height={400}
              loading='lazy'
              decoding='async'
              className='w-full h-full object-cover select-none pointer-events-none'
            />
            <div className='absolute inset-0 bg-linear-to-t from-slate-900/60 to-transparent' />
          </div>

          {/* Card 3 (Center) */}
          <div
            className='absolute inset-0 origin-bottom transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-10 shadow-xl rounded-2xl overflow-hidden border border-slate-200 dark:border-surface-800 bg-white dark:bg-surface-900 
            rotate-0 translate-y-0 scale-100 opacity-100
            group-hover:-translate-y-12 group-hover:scale-110 group-hover:shadow-2xl'
          >
            <img
              src='/assets/images/fittwiz-workout-1.webp'
              alt='Previsualización de rutina lista para compartir en historias de redes sociales'
              width={300}
              height={400}
              loading='lazy'
              decoding='async'
              className='w-full h-full object-cover select-none pointer-events-none'
            />
            <div className='absolute inset-0 bg-linear-to-t from-slate-900/40 to-transparent' />
            <div className='absolute bottom-4 inset-x-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100'>
              <div className='bg-white/90 dark:bg-surface-900/90 backdrop-blur-md px-4 py-2 rounded-full text-sm font-semibold text-slate-900 dark:text-white shadow-lg flex items-center gap-2'>
                <Share2
                  size={16}
                  className='text-primary-500'
                />{" "}
                Comparte tu sudor
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='order-1 lg:order-2 space-y-6 animate-in slide-in-from-right-8 fade-in duration-700'>
        <div className='inline-block p-3 rounded-2xl bg-accent-500/10 text-accent-600 dark:text-accent-400 mb-2'>
          <Share2 size={24} />
        </div>
        <p className='text-sm uppercase tracking-[0.2em] text-slate-500 font-semibold'>
          Comparte tus logros
        </p>
        <h2
          id='social-share-title'
          className='text-3xl md:text-4xl font-bold text-slate-900 dark:text-white transition-colors'
        >
          Muestra tu esfuerzo al mundo
        </h2>
        <p className='text-lg text-slate-500 dark:text-slate-300 max-w-xl leading-relaxed'>
          Genera imágenes optimizadas de tus entrenamientos con un solo clic. Elige entre 3 estilos
          visuales premium y sube tu progreso a Instagram, Twitter o Strava para enorgullecerte de
          tu trabajo e inspirar a otros.
        </p>
        <ul className='space-y-4 mt-8'>
          <li className='flex items-start gap-3'>
            <CheckCircle2 className='w-6 h-6 text-primary-500 shrink-0 mt-0.5' />
            <div>
              <h4 className='font-semibold text-slate-900 dark:text-white text-base'>
                Formatos adaptados
              </h4>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                Perfectos para Stories o el feed principal.
              </p>
            </div>
          </li>
          <li className='flex items-start gap-3'>
            <CheckCircle2 className='w-6 h-6 text-emerald-500 shrink-0 mt-0.5' />
            <div>
              <h4 className='font-semibold text-slate-900 dark:text-white text-base'>
                Métricas al grano
              </h4>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                Volumen total, tiempos y PRs destacados automáticamente.
              </p>
            </div>
          </li>
          <li className='flex items-start gap-3'>
            <CheckCircle2 className='w-6 h-6 text-accent-500 shrink-0 mt-0.5' />
            <div>
              <h4 className='font-semibold text-slate-900 dark:text-white text-base'>
                Diseño premium
              </h4>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                Sin marcas de agua molestas, solo tú y tu progreso.
              </p>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
};
