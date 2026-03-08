import React from "react";
import { ArrowRight, Sparkles, Utensils } from "lucide-react";
import { Button } from "../../ui/Button";

interface HeroSectionProps {
  user: any | null;
  onLoginClick: () => void;
  onExploreClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ user, onLoginClick, onExploreClick }) => {
  return (
    <section
      className='grid lg:grid-cols-[1.15fr,0.85fr] gap-10 items-center mb-20'
      aria-label='Introducción'
    >
      <div className='space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700'>
        <div className='inline-flex items-center gap-2 px-4 py-2 mt-6 rounded-full bg-white/60 dark:bg-surface-900/60 border border-slate-200 dark:border-surface-800 backdrop-blur-sm transition-colors'>
          <span className='relative flex h-3 w-3'>
            <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'></span>
            <span className='relative inline-flex rounded-full h-3 w-3 bg-emerald-500'></span>
          </span>
          <span className='text-sm font-medium text-slate-600 dark:text-slate-300'>
            Entrenamiento inteligente listo en minutos
          </span>
        </div>

        <h1 className='text-4xl md:text-6xl font-extrabold tracking-tight leading-tight'>
          La rutina perfecta,
          <span className='block text-primary-600 dark:text-primary-400'>
            con un coach IA que se adapta a ti
          </span>
        </h1>

        <p className='text-lg text-slate-500 dark:text-slate-300 max-w-xl leading-relaxed'>
          FITTWIZ transforma tus datos en sesiones claras: volumen, descanso, nutrición y progresión
          guiada. Tu tablero diario te dice qué hacer y por qué funciona.
        </p>

        <div className='flex flex-col sm:flex-row items-center gap-4'>
          <Button
            size='lg'
            onClick={onLoginClick}
            className='group w-full sm:w-auto text-lg px-8 py-4 h-auto shadow-xl shadow-primary-900/20'
            rightIcon={<ArrowRight className='group-hover:translate-x-1 transition-transform' />}
            aria-label={
              user
                ? "Continuar a tu panel de entrenamiento"
                : "Crear plan de entrenamiento gratuito"
            }
          >
            {user ? "Continuar Entrenando" : "Crear mi plan gratis"}
          </Button>

          {!user && (
            <Button
              variant='outline'
              size='lg'
              onClick={onExploreClick}
              className='w-full sm:w-auto text-lg px-8 py-4 h-auto bg-white/60 dark:bg-surface-900/60'
            >
              Ver rutinas demo
            </Button>
          )}
        </div>

        <div className='flex flex-wrap gap-3 text-xs text-slate-400'>
          <span className='px-3 py-1 rounded-full bg-white/60 dark:bg-surface-900/60 border border-slate-200 dark:border-surface-800 transition-colors'>
            Sin tarjeta
          </span>
          <span className='px-3 py-1 rounded-full bg-white/60 dark:bg-surface-900/60 border border-slate-200 dark:border-surface-800 transition-colors'>
            Datos privados
          </span>
          <span className='px-3 py-1 rounded-full bg-white/60 dark:bg-surface-900/60 border border-slate-200 dark:border-surface-800 transition-colors'>
            IA con límites claros
          </span>
        </div>
      </div>

      <div
        className='grid gap-4'
        aria-hidden='true'
      >
        {/* Visual demo cards - hidden from screen readers to reduce noise */}
        <div className='rounded-3xl border border-slate-200 dark:border-surface-800 bg-white/60 dark:bg-surface-900/60 p-6 shadow-lg dark:shadow-2xl transition-colors'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-10 h-10 rounded-xl bg-primary-500/20 text-primary-300 flex items-center justify-center'>
              <Sparkles size={20} />
            </div>
            <div>
              <p className='text-sm text-slate-400'>Plan semanal IA</p>
              <p className='text-lg font-semibold text-slate-900 dark:text-white transition-colors'>
                Basado en tu tiempo y equipo
              </p>
            </div>
          </div>
          <div className='grid grid-cols-2 gap-3 text-sm'>
            <div className='rounded-xl bg-slate-50 dark:bg-surface-950/60 border border-slate-200 dark:border-surface-800 p-3 transition-colors'>
              <p className='text-slate-400'>Duración</p>
              <p className='text-slate-900 dark:text-white font-semibold transition-colors'>
                45 min
              </p>
            </div>
            <div className='rounded-xl bg-slate-50 dark:bg-surface-950/60 border border-slate-200 dark:border-surface-800 p-3 transition-colors'>
              <p className='text-slate-400'>Frecuencia</p>
              <p className='text-slate-900 dark:text-white font-semibold transition-colors'>
                4 días
              </p>
            </div>
            <div className='rounded-xl bg-slate-50 dark:bg-surface-950/60 border border-slate-200 dark:border-surface-800 p-3 transition-colors'>
              <p className='text-slate-400'>Enfoque</p>
              <p className='text-slate-900 dark:text-white font-semibold transition-colors'>
                Fuerza
              </p>
            </div>
            <div className='rounded-xl bg-slate-50 dark:bg-surface-950/60 border border-slate-200 dark:border-surface-800 p-3 transition-colors'>
              <p className='text-slate-400'>Progreso</p>
              <p className='text-slate-900 dark:text-white font-semibold transition-colors'>+12%</p>
            </div>
          </div>
        </div>

        <div className='rounded-3xl border border-slate-200 dark:border-surface-800 bg-white/40 dark:bg-surface-900/40 p-5 flex items-center gap-4 transition-colors'>
          <div className='w-12 h-12 rounded-2xl bg-warning-500/20 text-warning-300 flex items-center justify-center'>
            <Utensils size={22} />
          </div>
          <div>
            <p className='text-sm text-slate-400'>Nutrición guiada</p>
            <p className='text-base font-semibold text-slate-900 dark:text-white transition-colors'>
              Macros sugeridos por objetivo
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
