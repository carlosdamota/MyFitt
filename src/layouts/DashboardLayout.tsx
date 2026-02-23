import React, { useState, useEffect, useMemo } from "react";
import { Outlet, useNavigate } from "react-router";
import { Loader } from "lucide-react";

// Hooks
import { useAuth } from "../hooks/useAuth";
import { useCookieConsent } from "../hooks/useCookieConsent";
import { useEntitlement } from "../hooks/useEntitlement";
import { useTimer } from "../hooks/useTimer";
import { useProfile } from "../hooks/useProfile";
import { useRoutines } from "../hooks/useRoutines";

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

  // Use routines hook to check if user has custom routines
  // (We don't need all routines, just checking if there are any non-default ones)
  const { routines, loading: routinesLoading } = useRoutines(user);
  const hasCustomRoutines = useMemo(() => {
    return Object.values(routines).some((routine: any) => !routine.isDefault);
  }, [routines]);

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
    !routinesLoading &&
    !hasCustomRoutines &&
    typeof sessionStorage !== "undefined" &&
    sessionStorage.getItem("isDeletingAccount") !== "true" &&
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
  };

  // Show loading while we determine if onboarding is needed
  if (user && profileLoading) {
    return (
      <div className='min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center text-slate-900 dark:text-slate-100'>
        <Loader
          className='animate-spin text-primary-500'
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
    <div className='min-h-screen bg-surface-50 dark:bg-surface-950 text-slate-900 dark:text-slate-200 pb-24 font-sans selection:bg-primary-500/30 flex flex-col transition-colors duration-300'>
      {/* Background ambient lighting for premium feel */}
      <div className='fixed inset-0 z-0 pointer-events-none overflow-hidden'>
        <div className='absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-500/10 blur-[120px]' />
        <div className='absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary-500/10 blur-[120px]' />
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

      <div className='flex-none'>
        <Header
          user={user}
          isPro={isPro}
          streak={0}
          dbError={null}
          authError={authError}
          onLogin={() => setShowAuthModal(true)}
          onLogout={handleLogout}
        />
      </div>

      <main className='flex-1 p-4 relative z-10 space-y-6 max-w-5xl mx-auto w-full'>
        <Outlet context={outletContext} />
      </main>

      <div className='flex-none'>
        <Footer />
      </div>
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
