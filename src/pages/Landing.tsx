import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Helmet } from "react-helmet-async";
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
  Chrome,
  User,
  Share2,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
const AuthModal = React.lazy(() => import("../components/auth/AuthModal"));
import { createCheckoutSession } from "../api/billing";
import { iconLogo, socialPreview } from "../branding/logoConfig";
import { Button } from "../components/ui/Button";
import { FeatureCard } from "../components/landing/FeatureCard";
import { StepCard } from "../components/landing/StepCard";
import { OptionCard } from "../components/landing/OptionCard";
import { PlanCard } from "../components/landing/PlanCard";
import { useEntitlement } from "../hooks/useEntitlement";

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { user, loginWithGoogle, loginWithEmail, signupWithEmail } = useAuth();
  const { plan } = useEntitlement(user);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const socialPreviewUrl = `https://fittwiz.app${socialPreview.src}`;

  const onLogin = () => {
    if (user) {
      navigate("/app");
    } else {
      setShowAuthModal(true);
    }
  };

  const handleUpgrade = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (plan === "pro") {
      navigate("/app");
      return;
    }

    try {
      const origin = window.location.origin;
      // Hardcoded Founders Coupon
      const url = await createCheckoutSession(origin, origin, "OmyEug7I");
      window.location.assign(url);
    } catch (error) {
      console.error("Checkout error:", error);
      navigate("/app");
    }
  };

  const onExplore = () => navigate("/app");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "FITTWIZ",
    applicationCategory: "HealthApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
    },
    description:
      "Entrenador personal con IA que crea rutinas de gimnasio personalizadas y optimiza tu progreso.",
    featureList:
      "Rutinas IA, Seguimiento de progreso, Nutrición deportiva, Análisis de rendimiento",
  };

  return (
    <div className='min-h-screen bg-surface-50 dark:bg-surface-950 text-slate-900 dark:text-white font-sans selection:bg-primary-500/30 transition-colors duration-300'>
      <Helmet>
        <title>FITTWIZ - Tu Entrenador Personal con IA</title>
        <meta
          name='description'
          content='Genera rutinas de gimnasio personalizadas con IA. FITTWIZ adapta tu entrenamiento, controla tu volumen y te guía paso a paso para maximizar tus resultados. Empieza gratis.'
        />
        <meta
          name='keywords'
          content='rutina gimnasio, entrenador IA, app fitness, hipertrofia, fuerza, seguimiento entrenamiento, gym log, inteligencia artificial'
        />

        {/* Open Graph / Facebook */}
        <meta
          property='og:type'
          content='website'
        />
        <meta
          property='og:url'
          content='https://fittwiz.app/'
        />
        <meta
          property='og:title'
          content='FITTWIZ - Tu Entrenador Personal con IA'
        />
        <meta
          property='og:description'
          content='Entrena inteligente con rutinas generadas por IA. Progreso real, sin perder tiempo.'
        />
        <meta
          property='og:image'
          content={socialPreviewUrl}
        />

        {/* Twitter */}
        <meta
          property='twitter:card'
          content='summary_large_image'
        />
        <meta
          property='twitter:url'
          content='https://fittwiz.app/'
        />
        <meta
          property='twitter:title'
          content='FITTWIZ - Tu Entrenador Personal con IA'
        />
        <meta
          property='twitter:description'
          content='Entrena inteligente con rutinas generadas por IA. Progreso real, sin perder tiempo.'
        />
        <meta
          property='twitter:image'
          content={socialPreviewUrl}
        />

        <script type='application/ld+json'>{JSON.stringify(structuredData)}</script>
      </Helmet>

      <React.Suspense fallback={null}>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
            navigate("/app");
          }}
          loginWithGoogle={loginWithGoogle}
          loginWithEmail={loginWithEmail}
          signupWithEmail={signupWithEmail}
        />
      </React.Suspense>

      <div
        className='fixed inset-0 z-0 pointer-events-none overflow-hidden'
        aria-hidden='true'
      >
        <div className='absolute top-[-20%] left-[-10%] w-[55%] h-[55%] rounded-full bg-primary-500/15 blur-[120px]' />
        <div className='absolute bottom-[-25%] right-[-10%] w-[55%] h-[55%] rounded-full bg-warning-500/15 blur-[140px]' />
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(30,41,59,0.6),transparent_55%)]' />
      </div>

      <header className='bg-white/80 dark:bg-surface-900/80 backdrop-blur-md border-b border-slate-200 dark:border-surface-800 p-3 md:p-4 fixed top-0 left-0 right-0 z-50 transition-colors'>
        <div className='max-w-6xl mx-auto flex items-center justify-between px-2'>
          {/* Logo */}
          <div className='flex items-center gap-2'>
            <div className='text-lg md:text-xl font-bold flex items-center gap-1 md:gap-2 relative'>
              <div className='absolute inset-0 bg-linear-to-r from-cyan-500/20 to-amber-500/20 blur-2xl -z-10 animate-pulse' />
              <img
                src={iconLogo.src}
                alt={iconLogo.alt}
                className='w-5 h-5 md:w-6 md:h-6'
                loading='eager'
                fetchPriority='high'
              />
              <span className='text-slate-900 dark:text-white hidden sm:inline font-black italic tracking-tighter text-xl'>
                FITTWIZ
              </span>
              <span className='text-slate-900 dark:text-white sm:hidden font-black italic tracking-tighter'>
                FW
              </span>
            </div>
          </div>

          {/* Auth Actions */}
          <div className='flex items-center gap-3'>
            {!user ? (
              <>
                <Button
                  variant='primary'
                  size='sm'
                  onClick={() => setShowAuthModal(true)}
                  className='sm:hidden'
                  leftIcon={<User size={16} />}
                >
                  Entrar
                </Button>
                <Button
                  variant='ghost'
                  onClick={() => setShowAuthModal(true)}
                  className='hidden sm:flex text-slate-600 dark:text-slate-300'
                >
                  Entrar
                </Button>
                <div className='h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block' />
                <Button
                  variant='secondary'
                  className='bg-white text-slate-900 border-none hover:bg-slate-100 hidden sm:flex'
                  onClick={async () => {
                    await loginWithGoogle();
                    navigate("/app");
                  }}
                  leftIcon={<Chrome size={16} />}
                >
                  <span>Con Google</span>
                </Button>
              </>
            ) : (
              <Button
                variant='secondary'
                size='sm'
                onClick={() => navigate("/app")}
              >
                Ir al panel
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className='relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-20 md:pt-40 md:pb-24'>
        <section
          className='grid lg:grid-cols-[1.15fr,0.85fr] gap-10 items-center mb-20'
          aria-label='Introducción'
        >
          <div className='space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700'>
            <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-surface-900/60 border border-slate-200 dark:border-surface-800 backdrop-blur-sm transition-colors'>
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
              FITTWIZ transforma tus datos en sesiones claras: volumen, descanso, nutrición y
              progresión guiada. Tu tablero diario te dice qué hacer y por qué funciona.
            </p>

            <div className='flex flex-col sm:flex-row items-center gap-4'>
              <Button
                size='lg'
                onClick={onLogin}
                className='group w-full sm:w-auto text-lg px-8 py-4 h-auto shadow-xl shadow-primary-900/20'
                rightIcon={
                  <ArrowRight className='group-hover:translate-x-1 transition-transform' />
                }
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
                  onClick={onExplore}
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
                  <p className='text-slate-900 dark:text-white font-semibold transition-colors'>
                    +12%
                  </p>
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

        {/* Social Share Section */}
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
                  alt='Estilo detallado'
                  width={300}
                  height={400}
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
                  alt='Estilo minimalista'
                  width={300}
                  height={400}
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
                  alt='Estilo historia'
                  width={300}
                  height={400}
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
              Genera imágenes optimizadas de tus entrenamientos con un solo clic. Elige entre 3
              estilos visuales premium y sube tu progreso a Instagram, Twitter o Strava para
              enorgullecerte de tu trabajo e inspirar a otros.
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
                Los bloques de entrenamiento vienen con descansos sugeridos, foco muscular y
                sugerencias inteligentes. No pierdes tiempo pensando qué hacer: solo entrenas.
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

        <section
          className='mb-20'
          aria-labelledby='pricing-title'
        >
          <div className='flex items-end justify-between mb-8 flex-wrap gap-4'>
            <div>
              <p className='text-sm uppercase tracking-[0.2em] text-slate-500'>Planes</p>
              <h2
                id='pricing-title'
                className='text-3xl md:text-4xl font-bold text-slate-900 dark:text-white transition-colors'
              >
                Elige tu ritmo de entrenamiento
              </h2>
            </div>
            <p className='text-sm text-slate-400 max-w-md'>
              Empieza gratis y sube a Pro cuando quieras más IA y automatizaciones.
            </p>
          </div>
          <div className='grid md:grid-cols-2 gap-6'>
            <PlanCard
              title='Free'
              badge='Ideal para empezar'
              price='0 €'
              desc='Prueba el sistema y crea tus primeras rutinas.'
              features={[
                "1 Rutina IA al mes (2 días max)",
                "100 Logs de nutrición/mes",
                "Chat Coach (5 mensajes/mes)",
                "Seguimiento de progresos",
              ]}
              cta='Comenzar gratis'
              onClick={onLogin}
              tone='neutral'
            />
            <PlanCard
              title='Pro'
              badge='Oferta Lanzamiento'
              price={
                <span className='flex flex-col items-end leading-tight'>
                  <span className='line-through text-slate-500 text-xs'>4.99 €</span>
                  <span className='text-emerald-400'>2.99 € / mes</span>
                </span>
              }
              desc='Programas completos con IA avanzada y análisis (Precio reducido por tiempo limitado).'
              features={[
                "5 Rutinas IA al mes (6 días)",
                "Nutrición Ilimitada + Fotos",
                "Chat Coach Ilimitado",
                "Análisis de progreso avanzado",
              ]}
              cta={plan === "pro" ? "Ir al panel (Ya eres Pro)" : "Desbloquear Oferta Pro"}
              onClick={handleUpgrade}
              tone='accent'
            />
          </div>
        </section>

        {/* FAQ Section */}
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
                Sí, el plan básico es 100% gratuito para siempre. Te permite generar rutinas, hacer
                logs y ver tu progreso esencial. Ofrecemos un plan Pro para quienes necesitan más
                volumen de rutinas IA y funcionalidades avanzadas.
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

        <section className='rounded-3xl border border-slate-200 dark:border-surface-800 bg-white/60 dark:bg-surface-900/60 p-8 md:p-10 text-center transition-colors'>
          <h2 className='text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 transition-colors'>
            Listo para entrenar en serio
          </h2>
          <p className='text-slate-500 dark:text-slate-300 max-w-2xl mx-auto mb-6'>
            Abre FITTWIZ, crea tu plan y empieza hoy. Menos dudas, más acción.
          </p>
          <Button
            size='lg'
            onClick={onLogin}
            className='px-8 py-4 h-auto text-lg'
            rightIcon={<ArrowRight size={18} />}
          >
            {user ? "Ir al panel" : "Crear mi cuenta"}
          </Button>
        </section>
      </main>

      <footer className='border-t border-slate-200 dark:border-slate-900 py-8 text-center text-slate-500 dark:text-slate-600 text-sm transition-colors'>
        <p>&copy; {new Date().getFullYear()} FITTWIZ. Todos los derechos reservados.</p>
        <div className='mt-2 flex justify-center gap-4'>
          <a
            href='/privacy'
            className='hover:text-slate-400 transition-colors'
          >
            Privacidad
          </a>
          <a
            href='/terms'
            className='hover:text-slate-400 transition-colors'
          >
            Términos
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
