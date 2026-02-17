import React, { useState, useEffect, useMemo } from "react";
import { Outlet, useNavigate } from "react-router";
import { Loader } from "lucide-react";

// Hooks
import { useAuth } from "../hooks/useAuth";
import { useCookieConsent } from "../hooks/useCookieConsent";
import { useEntitlement } from "../hooks/useEntitlement";
import { useTimer } from "../hooks/useTimer";
import { useProfile } from "../hooks/useProfile";

// Layout components
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import TimerOverlay from "../components/layout/TimerOverlay";
import AuthModal from "../components/auth/AuthModal";
import CookieBanner from "../components/legal/CookieBanner";
import CookieSettings from "../components/legal/CookieSettings";
import ProUpgradeModal from "../components/common/ProUpgradeModal";
import { ProUpgradeProvider, useProUpgrade } from "../components/common/ProUpgradeContext";

// Utils
import { initGA, logPageView } from "../utils/analytics";

// Onboarding
import OnboardingWizard from "../components/onboarding/OnboardingWizard";

export interface DashboardContext {
  user: ReturnType<typeof useAuth>["user"];
  isPro: boolean;
  onRequireAuth: () => void;
  onUpgrade: () => void;
}

function DashboardLayoutContent() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCookieSettings, setShowCookieSettings] = useState(false);

  const { consent, acceptAll, rejectAll, updateConsent, hasResponded } = useCookieConsent();
  const { user, authError, loginWithGoogle, loginWithEmail, signupWithEmail, logout } = useAuth();
  const { timer, isTimerRunning, resetTimer, toggleTimer } = useTimer(60);
  const { plan } = useEntitlement(user);
  const isPro = plan === "pro";
  const navigate = useNavigate();
  const { openProUpgradeModal, closeProUpgradeModal, showProModal } = useProUpgrade();

  const { profile, loading: profileLoading, saveProfile } = useProfile(user);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);

  // Close AuthModal automatically when a user logs in
  useEffect(() => {
    if (user && showAuthModal) {
      setShowAuthModal(false);
    }
  }, [user, showAuthModal]);

  // Compute onboarding status
  // A user is "new" if:
  // 1. They haven't been dismissed in this session
  // 2. We have a user object
  // 3. Profile is either not created (null) or exists but onboarding is incomplete
  // 4. Fallback: if they have updatedAt but the account is brand new (< 10 mins), they should see it
  const isNewAccount = useMemo(() => {
    if (!user?.metadata.creationTime) return false;
    const createdAt = new Date(user.metadata.creationTime).getTime();
    const now = new Date().getTime();
    return now - createdAt < 10 * 60 * 1000; // 10 minutes
  }, [user]);

  const shouldShowOnboarding =
    !onboardingDismissed &&
    !!user &&
    !profileLoading &&
    (!profile || (!profile.onboardingCompleted && (!profile.updatedAt || isNewAccount)));

  useEffect(() => {
    // If we're showing onboarding, make sure auth modal is closed
    if (shouldShowOnboarding && showAuthModal) {
      setShowAuthModal(false);
    }
  }, [shouldShowOnboarding, showAuthModal]);

  const handleOnboardingComplete = () => {
    setOnboardingDismissed(true);
    navigate("/app/routines");
  };

  const handleOnboardingSkip = async () => {
    setOnboardingDismissed(true);
    // Mark as completed so it doesn't show again
    if (user) {
      await saveProfile({ onboardingCompleted: true });
    }
  };

  const handleRequireAuth = () => setShowAuthModal(true);
  const handleUpgrade = () => openProUpgradeModal("general");
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  useEffect(() => {
    if (consent.analytics) initGA(true);
  }, [consent.analytics]);

  useEffect(() => {
    logPageView();
    // Debug log to help identify state issues
    if (import.meta.env.DEV) {
      console.log("[Onboarding Debug]", {
        user: !!user,
        profileLoading,
        profile: !!profile,
        shouldShowOnboarding,
      });
    }
  }, [user, profileLoading, profile, shouldShowOnboarding]);

  // Expose shared data to child routes via Outlet context
  const outletContext: DashboardContext = {
    user,
    isPro,
    onRequireAuth: handleRequireAuth,
    onUpgrade: handleUpgrade,
  };

  // Show loading while we determine if onboarding is needed
  if (user && profileLoading) {
    return (
      <div className='min-h-screen bg-[var(--bg-0)] flex items-center justify-center'>
        <Loader
          className='animate-spin text-cyan-400'
          size={32}
        />
      </div>
    );
  }

  // If onboarding is needed, show the wizard instead of the dashboard
  if (shouldShowOnboarding) {
    return (
      <OnboardingWizard
        user={user!}
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    );
  }

  return (
    <div className='min-h-screen bg-[var(--bg-0)] text-slate-200 pb-24 font-sans selection:bg-cyan-500/30'>
      <div className='fixed inset-0 z-0 pointer-events-none'>
        <div className='absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[110px]' />
        <div className='absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-500/10 blur-[110px]' />
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
        loginWithGoogle={loginWithGoogle}
        loginWithEmail={loginWithEmail}
        signupWithEmail={signupWithEmail}
      />

      {!hasResponded && (
        <CookieBanner
          onAcceptAll={acceptAll}
          onRejectAll={rejectAll}
          onConfigure={() => setShowCookieSettings(true)}
        />
      )}

      {showCookieSettings && (
        <CookieSettings
          currentConsent={consent}
          onSave={updateConsent}
          onClose={() => setShowCookieSettings(false)}
        />
      )}

      <ProUpgradeModal
        isOpen={showProModal}
        onClose={closeProUpgradeModal}
      />

      <Header
        user={user}
        isPro={isPro}
        streak={0}
        dbError={null}
        authError={authError}
        onLogin={() => setShowAuthModal(true)}
        onLogout={handleLogout}
      />

      <main className='p-4 relative z-10 space-y-6'>
        <Outlet context={outletContext} />
      </main>

      <Footer />
      <TimerOverlay
        timer={timer}
        isRunning={isTimerRunning}
        onReset={resetTimer}
        onToggle={toggleTimer}
      />
    </div>
  );
}

export default function DashboardLayout() {
  return (
    <ProUpgradeProvider>
      <DashboardLayoutContent />
    </ProUpgradeProvider>
  );
}
