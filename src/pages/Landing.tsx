import React, { useState, Suspense } from "react";
import { useNavigate } from "react-router";
import { Helmet } from "react-helmet-async";
import { useLazyAuth } from "../hooks/useLazyAuth";
const AuthModal = React.lazy(() => import("../components/auth/AuthModal"));
import { socialPreview } from "../branding/logoConfig";

// Above-fold sections (eager — critical for first paint)
import { LandingHeader } from "../components/landing/sections/LandingHeader";
import { HeroSection } from "../components/landing/sections/HeroSection";

// Below-fold sections (lazy — code-split for faster TTI)
const HowItWorksSection = React.lazy(() =>
  import("../components/landing/sections/HowItWorksSection").then((m) => ({
    default: m.HowItWorksSection,
  })),
);
const FeaturesSection = React.lazy(() =>
  import("../components/landing/sections/FeaturesSection").then((m) => ({
    default: m.FeaturesSection,
  })),
);
const SocialShareSection = React.lazy(() =>
  import("../components/landing/sections/SocialShareSection").then((m) => ({
    default: m.SocialShareSection,
  })),
);
const BenefitsSection = React.lazy(() =>
  import("../components/landing/sections/BenefitsSection").then((m) => ({
    default: m.BenefitsSection,
  })),
);
const PricingSection = React.lazy(() =>
  import("../components/landing/sections/PricingSection").then((m) => ({
    default: m.PricingSection,
  })),
);
const FaqSection = React.lazy(() =>
  import("../components/landing/sections/FaqSection").then((m) => ({ default: m.FaqSection })),
);
const CtaSection = React.lazy(() =>
  import("../components/landing/sections/CtaSection").then((m) => ({ default: m.CtaSection })),
);
const LandingFooter = React.lazy(() =>
  import("../components/landing/sections/LandingFooter").then((m) => ({
    default: m.LandingFooter,
  })),
);

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, loginWithGoogle, loginWithEmail, signupWithEmail, initFirebase } = useLazyAuth();
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

    try {
      const origin = window.location.origin;
      const { createCheckoutSession } = await import("../api/billing");
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
          content='Genera rutinas de gimnasio personalizadas con IA. Adaptamos tu entrenamiento y maximizamos tus resultados.'
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
          content='Genera rutinas de gimnasio personalizadas con IA. Adaptamos tu entrenamiento y maximizamos tus resultados.'
        />
        <meta
          property='twitter:image'
          content={socialPreviewUrl}
        />

        {/* Structured Data */}
        <script type='application/ld+json'>{JSON.stringify(structuredData)}</script>
      </Helmet>

      {/* Dynamic Background */}
      <div className='fixed inset-0 pointer-events-none'>
        <div className='absolute top-0 left-1/4 w-64 h-64 bg-primary-500/10 rounded-full blur-xl' />
        <div className='absolute bottom-0 right-1/4 w-64 h-64 bg-accent-500/10 rounded-full blur-xl' />
      </div>

      <LandingHeader
        user={user}
        loading={authLoading}
        onLoginClick={onLogin}
        onGoogleLogin={loginWithGoogle}
        onMouseEnter={initFirebase}
      />

      <main className='grow max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 relative z-10'>
        <HeroSection
          user={user}
          onLoginClick={onLogin}
          onExploreClick={onExplore}
        />
        <Suspense fallback={null}>
          <HowItWorksSection />
          <FeaturesSection />
          <SocialShareSection />
          <BenefitsSection />
          <PricingSection
            plan={null}
            onLoginClick={onLogin}
            onUpgradeClick={handleUpgrade}
          />
          <FaqSection />
          <CtaSection
            isLoggedIn={!!user}
            onLoginClick={onLogin}
          />
        </Suspense>
      </main>

      <Suspense fallback={null}>
        <LandingFooter />
      </Suspense>

      {/* Modals */}
      <Suspense fallback={null}>
        {showAuthModal && (
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onSuccess={() => navigate("/app")}
            loginWithGoogle={loginWithGoogle}
            loginWithEmail={loginWithEmail}
            signupWithEmail={signupWithEmail}
          />
        )}
      </Suspense>
    </div>
  );
};

export default Landing;
