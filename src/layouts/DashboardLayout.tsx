import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { Loader } from "lucide-react";

// Hooks
import { useAuth } from "../hooks/useAuth";
import { useCookieConsent } from "../hooks/useCookieConsent";
import { useEntitlement } from "../hooks/useEntitlement";
import { useTimer } from "../hooks/useTimer";

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
  }, []);

  // Expose shared data to child routes via Outlet context
  const outletContext: DashboardContext = {
    user,
    isPro,
    onRequireAuth: handleRequireAuth,
    onUpgrade: handleUpgrade,
  };

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
