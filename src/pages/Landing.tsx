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
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import AuthModal from "../components/auth/AuthModal";
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
