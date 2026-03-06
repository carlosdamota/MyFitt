import React, { useState, Suspense } from "react";
import { useNavigate } from "react-router";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../hooks/useAuth";
const AuthModal = React.lazy(() => import("../components/auth/AuthModal"));
import { createCheckoutSession } from "../api/billing";
import { socialPreview } from "../branding/logoConfig";
import { useEntitlement } from "../hooks/useEntitlement";

// Import new sections
import { LandingHeader } from "../components/landing/sections/LandingHeader";
import { HeroSection } from "../components/landing/sections/HeroSection";
import { HowItWorksSection } from "../components/landing/sections/HowItWorksSection";
import { FeaturesSection } from "../components/landing/sections/FeaturesSection";
import { SocialShareSection } from "../components/landing/sections/SocialShareSection";
import { BenefitsSection } from "../components/landing/sections/BenefitsSection";
import { PricingSection } from "../components/landing/sections/PricingSection";
import { FaqSection } from "../components/landing/sections/FaqSection";
import { CtaSection } from "../components/landing/sections/CtaSection";
import { LandingFooter } from "../components/landing/sections/LandingFooter";

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
        <div className='absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl' />
        <div className='absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl' />
      </div>

      <LandingHeader
        user={user}
        onLoginClick={onLogin}
        onGoogleLogin={loginWithGoogle}
      />

      <main className='grow max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 relative z-10'>
        <HeroSection
          user={user}
          onLoginClick={onLogin}
          onExploreClick={onExplore}
        />
        <HowItWorksSection />
        <FeaturesSection />
        <SocialShareSection />
        <BenefitsSection />
        <PricingSection
          plan={plan}
          onLoginClick={onLogin}
          onUpgradeClick={handleUpgrade}
        />
        <FaqSection />
        <CtaSection
          isLoggedIn={!!user}
          onLoginClick={onLogin}
        />
      </main>

      <LandingFooter />

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
