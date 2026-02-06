import React, { useState, useEffect, useMemo } from "react";
import { Loader } from "lucide-react";

// Hooks
import { useAuth } from "./hooks/useAuth";
import { useWorkoutLogs } from "./hooks/useWorkoutLogs";
import { useProfile } from "./hooks/useProfile";
import { useTimer } from "./hooks/useTimer";
import { useRoutines } from "./hooks/useRoutines";
import { useCookieConsent } from "./hooks/useCookieConsent";

// Components
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import TimerOverlay from "./components/layout/TimerOverlay";
import AppModals from "./components/layout/AppModals";
import AuthModal from "./components/auth/AuthModal";
import RoutineTabs from "./components/routines/RoutineTabs";
import WorkoutDay from "./components/routines/WorkoutDay";
import CookieBanner from "./components/legal/CookieBanner";

// Pages
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Legal from "./pages/Legal";
import Landing from "./pages/Landing";

// Utils
import { initGA, logPageView } from "./utils/analytics";

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>("home");
  const [activeTab, setActiveTab] = useState<string>("day1");
  const [showStats, setShowStats] = useState<boolean>(false);
  const [showNutrition, setShowNutrition] = useState<boolean>(false);
  const [showAICoach, setShowAICoach] = useState<boolean>(false);
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [showRoutineEditor, setShowRoutineEditor] = useState<boolean>(false);
  const [showRoutineManager, setShowRoutineManager] = useState<boolean>(false);
  const [showCookieSettings, setShowCookieSettings] = useState<boolean>(false);
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  const { consent, acceptAll, rejectAll, updateConsent, hasResponded } = useCookieConsent();
  const { user, authError, loginWithGoogle, loginWithEmail, signupWithEmail, logout } = useAuth();
  const { profile } = useProfile(user);
  const { workoutLogs, saveLog, deleteLog, coachAdvice, saveCoachAdvice, dbError, streak } =
    useWorkoutLogs(user);
  const { timer, isTimerRunning, resetTimer, toggleTimer } = useTimer(60);
  const {
    routines,
    loading: routinesLoading,
    saveRoutine,
    shareRoutine,
    importSharedRoutine,
  } = useRoutines(user);

  const handleRequireAuth = (): void => setShowAuthModal(true);

  const handleUpgrade = (): void => {
    setShowAICoach(false);
    setShowNutrition(false);
    setShowStats(false);
    setShowProfile(true);
  };

  const handleLogout = async (): Promise<void> => {
    await logout();
    setCurrentPage("home");
  };

  const handleGoHome = (): void => {
    setCurrentPage("home");
  };

  useEffect(() => {
    if (consent.analytics) initGA(true);
  }, [consent.analytics]);
  useEffect(() => {
    logPageView();
  }, [currentPage]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get("shareId");
    if (shareId && user && !routinesLoading) {
      if (window.confirm("¿Quieres importar esta rutina compartida?")) {
        importSharedRoutine(shareId, activeTab).then((success) => {
          if (success) {
            alert("¡Rutina importada!");
            window.history.replaceState({}, document.title, "/");
          }
        });
      }
    }
  }, [user, routinesLoading, activeTab, importSharedRoutine]);

  useEffect(() => {
    if (profile?.activeRoutineId && routines[profile.activeRoutineId]) {
      setActiveTab(profile.activeRoutineId);
    }
  }, [profile?.activeRoutineId, routines]);

  const programRoutines = useMemo(() => {
    const activeData = routines[activeTab];
    if (!activeData) return routines;
    if (activeData.programId) {
      return Object.fromEntries(
        Object.entries(routines).filter(([, r]) => r.programId === activeData.programId),
      );
    }
    return Object.fromEntries(Object.entries(routines).filter(([, r]) => !r.programId));
  }, [routines, activeTab]);

  if (routinesLoading) {
    return (
      <div className='min-h-screen bg-slate-950 flex items-center justify-center text-blue-500'>
        <Loader
          className='animate-spin'
          size={32}
        />
      </div>
    );
  }

  const currentRoutine = routines[activeTab] || Object.values(routines)[0];

  if (currentPage === "privacy") return <Privacy />;
  if (currentPage === "terms") return <Terms />;
  if (currentPage === "legal") return <Legal />;
  if (currentPage === "home")
    return (
      <>
        <Landing
          onLogin={() => {
            if (user) {
              setCurrentPage("app");
            } else {
              setShowAuthModal(true);
            }
          }}
          onExplore={() => setCurrentPage("app")}
          user={user}
        />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
            setCurrentPage("app");
          }}
          loginWithGoogle={loginWithGoogle}
          loginWithEmail={loginWithEmail}
          signupWithEmail={signupWithEmail}
        />
      </>
    );

  return (
    <div className='min-h-screen bg-[var(--bg-0)] text-slate-200 pb-24 font-sans selection:bg-cyan-500/30'>
      <div className='fixed inset-0 z-0 pointer-events-none'>
        <div className='absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[110px]' />
        <div className='absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-500/10 blur-[110px]' />
      </div>

      <AppModals
        user={user}
        showStats={showStats}
        setShowStats={setShowStats}
        showNutrition={showNutrition}
        setShowNutrition={setShowNutrition}
        showAICoach={showAICoach}
        setShowAICoach={setShowAICoach}
        showProfile={showProfile}
        setShowProfile={setShowProfile}
        showRoutineEditor={showRoutineEditor}
        setShowRoutineEditor={setShowRoutineEditor}
        showRoutineManager={showRoutineManager}
        setShowRoutineManager={setShowRoutineManager}
        showCookieSettings={showCookieSettings}
        setShowCookieSettings={setShowCookieSettings}
        workoutLogs={workoutLogs}
        coachAdvice={coachAdvice || ""}
        saveCoachAdvice={saveCoachAdvice}
        profile={profile}
        routines={routines}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleSaveRoutine={async (r) => {
          if (await saveRoutine(activeTab, r)) setShowRoutineEditor(false);
        }}
        handleShareRoutine={(r) => shareRoutine(activeTab, r)}
        consent={consent}
        updateConsent={updateConsent}
        onRequireAuth={handleRequireAuth}
        onUpgrade={handleUpgrade}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          if (currentPage === "home") setCurrentPage("app");
        }}
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

      <Header
        user={user}
        streak={streak}
        dbError={dbError}
        authError={authError}
        onShowProfile={() => setShowProfile(true)}
        onShowAICoach={() => setShowAICoach(true)}
        onShowNutrition={() => setShowNutrition(true)}
        onShowRoutines={() => setShowRoutineManager(true)}
        onShowStats={() => setShowStats(true)}
        onLogin={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        onGoHome={handleGoHome}
        guestMode={true}
      />

      <main className='p-4 relative z-10 space-y-6'>
        <RoutineTabs
          routines={programRoutines}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <WorkoutDay
          routine={currentRoutine}
          dayKey={activeTab}
          completedExercises={completedExercises}
          onToggleComplete={(day, ex) => {
            const key = `${day}-${ex}`;
            setCompletedExercises((prev) => ({ ...prev, [key]: !prev[key] }));
          }}
          onEditRoutine={() => setShowRoutineEditor(true)}
          onResetTimer={resetTimer}
          onSaveLog={saveLog}
          onDeleteLog={deleteLog}
          workoutLogs={workoutLogs}
          user={user}
          onRequireAuth={handleRequireAuth}
          onShowSubscription={handleUpgrade}
        />
      </main>

      <Footer onNavigate={setCurrentPage} />
      <TimerOverlay
        timer={timer}
        isRunning={isTimerRunning}
        onReset={resetTimer}
        onToggle={toggleTimer}
      />
    </div>
  );
}
