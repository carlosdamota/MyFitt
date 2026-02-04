import React from "react";
import { Activity, Zap, Shield, BarChart2, ArrowRight } from "lucide-react";
import type { User } from "firebase/auth";

interface LandingProps {
  onLogin: () => void;
  onExplore: () => void;
  user: User | null;
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const Landing: React.FC<LandingProps> = ({ onLogin, onExplore, user }) => {
  return (
    <div className='min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500/30'>
      {/* Background Effects */}
      <div className='fixed inset-0 z-0 pointer-events-none overflow-hidden'>
        <div className='absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-900/20 blur-[120px]' />
        <div className='absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-900/20 blur-[120px]' />
      </div>

      <div className='relative z-10 max-w-6xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center text-center'>
        {/* Hero Section */}
        <div className='mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700'>
          <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-800 mb-8 backdrop-blur-sm'>
            <span className='relative flex h-3 w-3'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75'></span>
              <span className='relative inline-flex rounded-full h-3 w-3 bg-green-500'></span>
            </span>
            <span className='text-sm font-medium text-slate-300'>V2.0 Ahora Disponible</span>
          </div>

          <h1 className='text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-linear-to-b from-white to-slate-400 bg-clip-text text-transparent'>
            Tu Entrenador Personal <br />
            <span className='text-blue-500'>Potenciado por IA</span>
          </h1>

          <p className='text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed'>
            FitManual crea rutinas personalizadas, analiza tu técnica y optimiza tu nutrición usando
            inteligencia artificial avanzada. Sin configuraciones complejas.
          </p>

          <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
            <button
              onClick={onLogin}
              className='group relative inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg transition-all hover:scale-105 shadow-xl shadow-blue-900/20 w-full sm:w-auto'
            >
              {user ? "Continuar Entrenando" : "Empezar Ahora Gratis"}
              <ArrowRight className='group-hover:translate-x-1 transition-transform' />
              <div className='absolute inset-0 rounded-2xl ring-2 ring-white/20 group-hover:ring-white/40 transition-all' />
            </button>

            {!user && (
              <button
                onClick={onExplore}
                className='px-8 py-4 bg-slate-900/50 hover:bg-slate-800 text-slate-300 rounded-2xl font-bold text-lg transition-all border border-slate-800 hover:border-slate-700 w-full sm:w-auto'
              >
                Explorar Rutinas
              </button>
            )}
          </div>

          <p className='mt-4 text-sm text-slate-500'>
            No requiere tarjeta de crédito • Privacidad garantizada
          </p>
        </div>

        {/* Features Grid */}
        <div className='grid md:grid-cols-3 gap-6 w-full max-w-5xl mb-20'>
          <FeatureCard
            icon={
              <Zap
                size={24}
                className='text-yellow-400'
              />
            }
            title='Rutinas IA'
            desc='Genera planes de entrenamiento completos adaptados a tu equipo y tiempo disponible en segundos.'
          />
          <FeatureCard
            icon={
              <BarChart2
                size={24}
                className='text-blue-400'
              />
            }
            title='Progreso Real'
            desc='Visualiza tu evolución con métricas detalladas de volumen, fuerza y consistencia.'
          />
          <FeatureCard
            icon={
              <Shield
                size={24}
                className='text-green-400'
              />
            }
            title='100% Privado'
            desc='Tus datos son tuyos. Almacenamiento seguro y sin rastreadores invasivos.'
          />
        </div>

        {/* App Preview (Abstract) */}
        <div className='relative w-full max-w-4xl aspect-video bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden group'>
          <div className='absolute inset-0 bg-linear-to-tr from-slate-900 via-slate-900/90 to-blue-900/20' />
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='text-center'>
              <Activity
                size={64}
                className='text-blue-500 mx-auto mb-4 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500'
              />
              <p className='text-slate-500 font-mono text-sm'>FitManual Dashboard Preview</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Simple */}
      <footer className='border-t border-slate-900 py-8 text-center text-slate-600 text-sm'>
        <p>&copy; {new Date().getFullYear()} FitManual. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, desc }) => (
  <div className='p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 transition-all text-left'>
    <div className='w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-4'>
      {icon}
    </div>
    <h3 className='text-xl font-bold text-white mb-2'>{title}</h3>
    <p className='text-slate-400 text-sm leading-relaxed'>{desc}</p>
  </div>
);

export default Landing;
