import React from "react";
import { ChevronDown } from "lucide-react";

export const FaqSection: React.FC = () => {
  return (
    <section className='mb-24 flex flex-col items-center max-w-3xl mx-auto'>
      <div className='text-center mb-10'>
        <p className='text-sm uppercase tracking-[0.2em] text-slate-500'>Dudas frecuentes</p>
        <h2 className='text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mt-2 transition-colors'>
          Todo lo que necesitas saber
        </h2>
      </div>
      <div className='w-full space-y-4'>
        {/* FAQ 1 */}
        <details className='group bg-white/60 dark:bg-surface-900/60 backdrop-blur-sm border border-slate-200 dark:border-surface-800 rounded-2xl open:bg-white dark:open:bg-surface-900 transition-all'>
          <summary className='flex justify-between items-center cursor-pointer p-6 font-semibold text-slate-900 dark:text-white select-none'>
            ¿Es la aplicación realmente gratis?
            <ChevronDown
              className='text-slate-400 group-open:rotate-180 transition-transform duration-300'
              size={20}
            />
          </summary>
          <div className='px-6 pb-6 text-slate-500 dark:text-slate-400'>
            Sí, el plan básico es 100% gratuito para siempre. Te permite generar rutinas, hacer logs
            y ver tu progreso esencial. Ofrecemos un plan Pro para quienes necesitan más volumen de
            rutinas IA y funcionalidades avanzadas.
          </div>
        </details>
        {/* FAQ 2 */}
        <details className='group bg-white/60 dark:bg-surface-900/60 backdrop-blur-sm border border-slate-200 dark:border-surface-800 rounded-2xl open:bg-white dark:open:bg-surface-900 transition-all'>
          <summary className='flex justify-between items-center cursor-pointer p-6 font-semibold text-slate-900 dark:text-white select-none'>
            ¿Cómo genera la IA mis entrenamientos?
            <ChevronDown
              className='text-slate-400 group-open:rotate-180 transition-transform duration-300'
              size={20}
            />
          </summary>
          <div className='px-6 pb-6 text-slate-500 dark:text-slate-400'>
            Nuestro motor de inteligencia artificial analiza tu nivel de experiencia, el equipo
            disponible, los días que quieres entrenar y tu objetivo principal. Luego, diseña una
            progresión semanal óptima basada en volumen y ciencia deportiva, no en rutinas
            aleatorias.
          </div>
        </details>
        {/* FAQ 3 */}
        <details className='group bg-white/60 dark:bg-surface-900/60 backdrop-blur-sm border border-slate-200 dark:border-surface-800 rounded-2xl open:bg-white dark:open:bg-surface-900 transition-all'>
          <summary className='flex justify-between items-center cursor-pointer p-6 font-semibold text-slate-900 dark:text-white select-none'>
            ¿Puedo conectarla con otras apps?
            <ChevronDown
              className='text-slate-400 group-open:rotate-180 transition-transform duration-300'
              size={20}
            />
          </summary>
          <div className='px-6 pb-6 text-slate-500 dark:text-slate-400'>
            ¡Por supuesto! FITTWIZ se integra nativamente con Strava para que puedas subir tus
            sesiones generadas en un clic y compartirlas con tu comunidad de atletas.
          </div>
        </details>
      </div>
    </section>
  );
};
