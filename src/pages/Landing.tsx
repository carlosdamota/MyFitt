import React from "react";
import {
  Activity,
  Zap,
  Shield,
  BarChart2,
  ArrowRight,
  Sparkles,
  Utensils,
  Dumbbell,
  Target,
} from "lucide-react";
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

interface StepCardProps {
  step: string;
  title: string;
  desc: string;
}

interface OptionCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

interface PlanCardProps {
  title: string;
  badge: string;
  price: string;
  desc: string;
  features: string[];
  cta: string;
  onClick: () => void;
  tone?: "accent" | "neutral";
}

const Landing: React.FC<LandingProps> = ({ onLogin, onExplore, user }) => {
  return (
    <div className='min-h-screen bg-[var(--bg-0)] text-white font-sans selection:bg-cyan-500/30'>
      <div className='fixed inset-0 z-0 pointer-events-none overflow-hidden'>
        <div className='absolute top-[-20%] left-[-10%] w-[55%] h-[55%] rounded-full bg-cyan-500/15 blur-[120px]' />
        <div className='absolute bottom-[-25%] right-[-10%] w-[55%] h-[55%] rounded-full bg-amber-500/15 blur-[140px]' />
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(30,41,59,0.6),_transparent_55%)]' />
      </div>

      <div className='relative z-10 max-w-6xl mx-auto px-6 py-12 md:py-20'>
        <section className='grid lg:grid-cols-[1.15fr,0.85fr] gap-10 items-center mb-20'>
          <div className='space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700'>
            <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/60 border border-slate-800 backdrop-blur-sm'>
              <span className='relative flex h-3 w-3'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'></span>
                <span className='relative inline-flex rounded-full h-3 w-3 bg-emerald-500'></span>
              </span>
              <span className='text-sm font-medium text-slate-300'>Entrenamiento inteligente listo en minutos</span>
            </div>

            <h1 className='text-4xl md:text-6xl font-extrabold tracking-tight leading-tight'>
              La rutina perfecta,
              <span className='block text-cyan-400'>con un coach IA que se adapta a ti</span>
            </h1>

            <p className='text-lg text-slate-300 max-w-xl leading-relaxed'>
              FitManual transforma tus datos en sesiones claras: volumen, descanso, nutricion y
              progresion guiada. Tu tablero diario te dice que hacer y por que funciona.
            </p>

            <div className='flex flex-col sm:flex-row items-center gap-4'>
              <button
                onClick={onLogin}
                className='group relative inline-flex items-center gap-3 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-2xl font-bold text-lg transition-all hover:scale-[1.02] shadow-xl shadow-cyan-900/20 w-full sm:w-auto'
              >
                {user ? "Continuar Entrenando" : "Crear mi plan gratis"}
                <ArrowRight className='group-hover:translate-x-1 transition-transform' />
                <div className='absolute inset-0 rounded-2xl ring-2 ring-white/20 group-hover:ring-white/40 transition-all' />
              </button>

              {!user && (
                <button
                  onClick={onExplore}
                  className='px-8 py-4 bg-slate-900/60 hover:bg-slate-800 text-slate-200 rounded-2xl font-bold text-lg transition-all border border-slate-800 hover:border-slate-700 w-full sm:w-auto'
                >
                  Ver rutinas demo
                </button>
              )}
            </div>

            <div className='flex flex-wrap gap-3 text-xs text-slate-400'>
              <span className='px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800'>Sin tarjeta</span>
              <span className='px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800'>Datos privados</span>
              <span className='px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800'>IA con limites claros</span>
            </div>
          </div>

          <div className='grid gap-4'>
            <div className='rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center'>
                  <Sparkles size={20} />
                </div>
                <div>
                  <p className='text-sm text-slate-400'>Plan semanal IA</p>
                  <p className='text-lg font-semibold text-white'>Basado en tu tiempo y equipo</p>
                </div>
              </div>
              <div className='grid grid-cols-2 gap-3 text-sm'>
                <div className='rounded-xl bg-slate-950/60 border border-slate-800 p-3'>
                  <p className='text-slate-400'>Duracion</p>
                  <p className='text-white font-semibold'>45 min</p>
                </div>
                <div className='rounded-xl bg-slate-950/60 border border-slate-800 p-3'>
                  <p className='text-slate-400'>Frecuencia</p>
                  <p className='text-white font-semibold'>4 dias</p>
                </div>
                <div className='rounded-xl bg-slate-950/60 border border-slate-800 p-3'>
                  <p className='text-slate-400'>Enfoque</p>
                  <p className='text-white font-semibold'>Fuerza</p>
                </div>
                <div className='rounded-xl bg-slate-950/60 border border-slate-800 p-3'>
                  <p className='text-slate-400'>Progreso</p>
                  <p className='text-white font-semibold'>+12%</p>
                </div>
              </div>
            </div>

            <div className='rounded-3xl border border-slate-800 bg-slate-900/40 p-5 flex items-center gap-4'>
              <div className='w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center'>
                <Utensils size={22} />
              </div>
              <div>
                <p className='text-sm text-slate-400'>Nutricion guiada</p>
                <p className='text-base font-semibold text-white'>Macros sugeridos por objetivo</p>
              </div>
            </div>
          </div>
        </section>

        <section className='mb-20'>
          <div className='flex items-center justify-between mb-8 flex-wrap gap-4'>
            <div>
              <p className='text-sm uppercase tracking-[0.2em] text-slate-500'>Como funciona</p>
              <h2 className='text-3xl md:text-4xl font-bold text-white'>De cero a plan completo en 3 pasos</h2>
            </div>
            <div className='text-sm text-slate-400 max-w-md'>
              Configura tu perfil, deja que la IA componga el plan, y registra progreso con feedback accionable.
            </div>
          </div>
          <div className='grid md:grid-cols-3 gap-6'>
            <StepCard step='01' title='Define tu contexto' desc='Equipo, dias disponibles, objetivo y nivel. Lo esencial, sin ruido.' />
            <StepCard step='02' title='Genera tu semana' desc='La IA diseña bloques de ejercicios con descansos y progresion.' />
            <StepCard step='03' title='Mide y ajusta' desc='Registra sesiones, ve volumen y recibe feedback inmediato.' />
          </div>
        </section>

        <section className='mb-20'>
          <div className='flex items-center justify-between mb-8 flex-wrap gap-4'>
            <div>
              <p className='text-sm uppercase tracking-[0.2em] text-slate-500'>Opciones</p>
              <h2 className='text-3xl md:text-4xl font-bold text-white'>Todo lo que necesitas en un panel</h2>
            </div>
            <p className='text-sm text-slate-400 max-w-md'>
              Alterna entre rutinas, nutricion, IA y estadisticas sin perder el contexto.
            </p>
          </div>
          <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-5'>
            <OptionCard
              icon={<Dumbbell size={20} className='text-cyan-300' />}
              title='Rutinas dinamicas'
              desc='Edita dias, guarda programas y sincroniza tu progreso.'
            />
            <OptionCard
              icon={<Sparkles size={20} className='text-emerald-300' />}
              title='Generador IA'
              desc='Planes semanales, variantes de ejercicios y analisis.'
            />
            <OptionCard
              icon={<Utensils size={20} className='text-amber-300' />}
              title='Nutricion practica'
              desc='Registros rapidos y macros sugeridos por objetivo.'
            />
            <OptionCard
              icon={<BarChart2 size={20} className='text-indigo-300' />}
              title='Progreso visible'
              desc='Volumen, consistencia y rachas con grafica clara.'
            />
          </div>
        </section>

        <section className='mb-20'>
          <div className='grid md:grid-cols-[1fr,0.9fr] gap-10 items-center'>
            <div className='space-y-6'>
              <p className='text-sm uppercase tracking-[0.2em] text-slate-500'>Beneficios reales</p>
              <h2 className='text-3xl md:text-4xl font-bold text-white'>Planificacion clara, ejecucion sin dudas</h2>
              <p className='text-slate-400'>
                Los bloques de entrenamiento vienen con descansos sugeridos, foco muscular y sugerencias
                inteligentes. No pierdes tiempo pensando que hacer: solo entrenas.
              </p>
              <div className='grid sm:grid-cols-2 gap-4'>
                <FeatureCard
                  icon={<Zap size={20} className='text-amber-300' />}
                  title='Sesiones precisas'
                  desc='Bloques con volumen y descanso definidos para cada dia.'
                />
                <FeatureCard
                  icon={<Target size={20} className='text-cyan-300' />}
                  title='Objetivo claro'
                  desc='Rutinas alineadas a fuerza, hipertrofia o perdida grasa.'
                />
                <FeatureCard
                  icon={<Shield size={20} className='text-emerald-300' />}
                  title='Datos privados'
                  desc='Tu historial es tuyo, sin anuncios ni rastreo invasivo.'
                />
                <FeatureCard
                  icon={<Activity size={20} className='text-indigo-300' />}
                  title='Feedback IA'
                  desc='Analisis semanal y variaciones de ejercicios.'
                />
              </div>
            </div>
            <div className='rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl'>
              <p className='text-sm text-slate-400'>Vista rapida</p>
              <h3 className='text-2xl font-bold text-white mb-4'>Panel de entrenamiento</h3>
              <div className='space-y-3'>
                <div className='rounded-2xl border border-slate-800 bg-slate-950/60 p-4'>
                  <p className='text-xs text-slate-400'>Hoy</p>
                  <p className='text-white font-semibold'>Empuje + Core</p>
                  <p className='text-xs text-slate-500'>6 ejercicios · 42 min</p>
                </div>
                <div className='rounded-2xl border border-slate-800 bg-slate-950/60 p-4'>
                  <p className='text-xs text-slate-400'>IA Coach</p>
                  <p className='text-white font-semibold'>Buen progreso, sube 2.5 kg en press</p>
                  <p className='text-xs text-slate-500'>Consistencia 86%</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='mb-20'>
          <div className='flex items-center justify-between mb-8 flex-wrap gap-4'>
            <div>
              <p className='text-sm uppercase tracking-[0.2em] text-slate-500'>Planes</p>
              <h2 className='text-3xl md:text-4xl font-bold text-white'>Elige tu ritmo de entrenamiento</h2>
            </div>
            <p className='text-sm text-slate-400 max-w-md'>
              Empieza gratis y sube a Pro cuando quieras mas IA y automatizaciones.
            </p>
          </div>
          <div className='grid md:grid-cols-2 gap-6'>
            <PlanCard
              title='Free'
              badge='Ideal para empezar'
              price='0 €'
              desc='Acceso base a rutinas y seguimiento.'
              features={[
                "Rutinas guardadas",
                "Seguimiento de progresos",
                "IA semanal limitada",
              ]}
              cta='Comenzar gratis'
              onClick={onLogin}
              tone='neutral'
            />
            <PlanCard
              title='Pro'
              badge='Mas potencia'
              price='4.99 € / mes'
              desc='IA avanzada, nutricion y analisis completos.'
              features={[
                "Cuota IA mensual ampliada",
                "Analisis avanzado",
                "Portal de suscripcion",
              ]}
              cta='Probar Pro'
              onClick={onLogin}
              tone='accent'
            />
          </div>
        </section>

        <section className='rounded-3xl border border-slate-800 bg-slate-900/60 p-8 md:p-10 text-center'>
          <h2 className='text-3xl md:text-4xl font-bold text-white mb-4'>Listo para entrenar en serio</h2>
          <p className='text-slate-300 max-w-2xl mx-auto mb-6'>
            Abre FitManual, crea tu plan y empieza hoy. Menos dudas, mas accion.
          </p>
          <button
            onClick={onLogin}
            className='inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-cyan-500 text-slate-900 font-bold text-lg hover:bg-cyan-400 transition'
          >
            {user ? "Ir al panel" : "Crear mi cuenta"}
            <ArrowRight size={18} />
          </button>
        </section>
      </div>

      <footer className='border-t border-slate-900 py-8 text-center text-slate-600 text-sm'>
        <p>&copy; {new Date().getFullYear()} FitManual. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, desc }) => (
  <div className='p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 transition-all text-left'>
    <div className='w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center mb-4'>
      {icon}
    </div>
    <h3 className='text-xl font-bold text-white mb-2'>{title}</h3>
    <p className='text-slate-400 text-sm leading-relaxed'>{desc}</p>
  </div>
);

const StepCard: React.FC<StepCardProps> = ({ step, title, desc }) => (
  <div className='p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-left space-y-4'>
    <div className='text-xs tracking-[0.2em] text-slate-500'>{step}</div>
    <h3 className='text-xl font-bold text-white'>{title}</h3>
    <p className='text-slate-400 text-sm leading-relaxed'>{desc}</p>
  </div>
);

const OptionCard: React.FC<OptionCardProps> = ({ icon, title, desc }) => (
  <div className='p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 transition-all text-left'>
    <div className='w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center mb-4'>
      {icon}
    </div>
    <h3 className='text-lg font-semibold text-white mb-2'>{title}</h3>
    <p className='text-slate-400 text-sm leading-relaxed'>{desc}</p>
  </div>
);

const PlanCard: React.FC<PlanCardProps> = ({
  title,
  badge,
  price,
  desc,
  features,
  cta,
  onClick,
  tone = "neutral",
}) => (
  <div
    className={`rounded-3xl border p-6 md:p-8 text-left space-y-6 ${
      tone === "accent"
        ? "border-cyan-400/40 bg-cyan-500/10"
        : "border-slate-800 bg-slate-900/60"
    }`}
  >
    <div className='flex items-start justify-between'>
      <div>
        <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>{badge}</p>
        <h3 className='text-2xl font-bold text-white'>{title}</h3>
      </div>
      <span
        className={`text-sm font-semibold px-3 py-1 rounded-full ${
          tone === "accent" ? "bg-cyan-500/20 text-cyan-200" : "bg-slate-800 text-slate-300"
        }`}
      >
        {price}
      </span>
    </div>
    <p className='text-slate-300'>{desc}</p>
    <ul className='space-y-2 text-sm text-slate-400'>
      {features.map((item) => (
        <li key={item} className='flex items-center gap-2'>
          <span className='w-1.5 h-1.5 rounded-full bg-cyan-300' />
          {item}
        </li>
      ))}
    </ul>
    <button
      onClick={onClick}
      className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-semibold transition ${
        tone === "accent"
          ? "bg-cyan-500 text-slate-900 hover:bg-cyan-400"
          : "bg-slate-800 text-white hover:bg-slate-700"
      }`}
    >
      {cta}
      <ArrowRight size={16} />
    </button>
  </div>
);

export default Landing;
