import React, { useState, useEffect } from 'react';
import { Loader, Utensils, User } from 'lucide-react';

// Hooks
import { useAuth } from './hooks/useAuth';
import { useWorkoutLogs } from './hooks/useWorkoutLogs';
import { useTimer } from './hooks/useTimer';
import { useRoutines } from './hooks/useRoutines';
import { useCookieConsent } from './hooks/useCookieConsent';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import TimerOverlay from './components/layout/TimerOverlay';
import Modal from './components/common/Modal';
import RoutineTabs from './components/routines/RoutineTabs';
import WorkoutDay from './components/routines/WorkoutDay';
import RoutineEditor from './components/routines/RoutineEditor';
import GlobalStats from './components/stats/GlobalStats';
import NutritionDashboard from './components/nutrition/NutritionDashboard';
import ProfileEditor from './components/profile/ProfileEditor';
import CookieBanner from './components/legal/CookieBanner';
import CookieSettings from './components/legal/CookieSettings';

// Pages
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Legal from './pages/Legal';
import Landing from './pages/Landing';

// Utils
import { initGA, logPageView } from './utils/analytics';

export default function App() {
  // Page & UI State
  const [currentPage, setCurrentPage] = useState('app');
  const [activeTab, setActiveTab] = useState('day1');
  const [showStats, setShowStats] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showRoutineEditor, setShowRoutineEditor] = useState(false);
  const [showCookieSettings, setShowCookieSettings] = useState(false);
  const [completedExercises, setCompletedExercises] = useState({});

  // Cookie consent
  const { consent, acceptAll, rejectAll, updateConsent, hasResponded } = useCookieConsent();

  // Custom Hooks
  const { user, authError, login } = useAuth();
  const { workoutLogs, saveLog, deleteLog, dbError, streak } = useWorkoutLogs(user);
  const { timer, isTimerRunning, resetTimer, toggleTimer } = useTimer(60);
  const { routines, loading: routinesLoading, saveRoutine, shareRoutine, importSharedRoutine } = useRoutines(user);

  // Initialize GA when consent changes
  useEffect(() => {
    if (consent.analytics) {
      initGA(true);
    }
  }, [consent.analytics]);

  // Log page views
  useEffect(() => {
    logPageView();
  }, [currentPage]);

  // Handle shared routine import from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get('shareId');
    
    if (shareId && user && !routinesLoading) {
      if (window.confirm("¿Quieres importar esta rutina compartida a tu colección?")) {
        importSharedRoutine(shareId, activeTab).then(success => {
          if (success) {
            alert("¡Rutina importada con éxito!");
            window.history.replaceState({}, document.title, "/");
          } else {
            alert("Error al importar la rutina. Verifica que el enlace sea correcto.");
          }
        });
      }
    }
  }, [user, routinesLoading, activeTab, importSharedRoutine]);

  // Handlers
  const handleSaveRoutine = async (updatedRoutine) => {
    const success = await saveRoutine(activeTab, updatedRoutine);
    if (success) setShowRoutineEditor(false);
  };

  const handleShareRoutine = async (routineToShare) => {
    return await shareRoutine(activeTab, routineToShare);
  };

  const toggleComplete = (day, exerciseName) => {
    const key = `${day}-${exerciseName}`;
    setCompletedExercises(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Loading state
  if (routinesLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-blue-500">
        <Loader className="animate-spin" size={32} />
      </div>
    );
  }

  // Ensure activeTab is valid
  const currentRoutine = routines[activeTab] || Object.values(routines)[0];
  if (!routines[activeTab] && Object.keys(routines).length > 0) {
    setActiveTab(Object.keys(routines)[0]);
  }

  // Render legal pages
  if (currentPage === 'privacy') return <Privacy />;
  if (currentPage === 'terms') return <Terms />;
  if (currentPage === 'legal') return <Legal />;

  // Landing page for unauthenticated users
  if (!user) {
    return <Landing onLogin={login} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-24 font-sans selection:bg-blue-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/10 blur-[100px]" />
      </div>

      {/* Modals */}
      {showStats && <GlobalStats logs={workoutLogs} onClose={() => setShowStats(false)} />}
      
      <Modal
        isOpen={showNutrition}
        onClose={() => setShowNutrition(false)}
        title="Nutrición"
        icon={<Utensils size={20} className="text-green-400" />}
      >
        <NutritionDashboard user={user} />
      </Modal>

      <Modal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        title="Perfil de Atleta"
        icon={<User size={20} className="text-blue-400" />}
      >
        <ProfileEditor user={user} onClose={() => setShowProfile(false)} />
      </Modal>

      {/* Cookie Banner */}
      {!hasResponded && (
        <CookieBanner
          onAcceptAll={acceptAll}
          onRejectAll={rejectAll}
          onConfigure={() => setShowCookieSettings(true)}
        />
      )}

      {/* Cookie Settings Modal */}
      {showCookieSettings && (
        <CookieSettings
          currentConsent={consent}
          onSave={updateConsent}
          onClose={() => setShowCookieSettings(false)}
        />
      )}

      {/* Routine Editor */}
      {showRoutineEditor && (
        <RoutineEditor
          initialData={currentRoutine}
          onSave={handleSaveRoutine}
          onCancel={() => setShowRoutineEditor(false)}
          onShare={handleShareRoutine}
        />
      )}

      {/* Header */}
      <Header
        user={user}
        streak={streak}
        dbError={dbError}
        authError={authError}
        onShowProfile={() => setShowProfile(true)}
        onShowNutrition={() => setShowNutrition(true)}
        onShowStats={() => setShowStats(true)}
      />

      {/* Main Content */}
      <main className="p-4 relative z-10">
        <RoutineTabs
          routines={routines}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <WorkoutDay
          routine={currentRoutine}
          dayKey={activeTab}
          completedExercises={completedExercises}
          onToggleComplete={toggleComplete}
          onEditRoutine={() => setShowRoutineEditor(true)}
          onResetTimer={resetTimer}
          onSaveLog={saveLog}
          onDeleteLog={deleteLog}
          workoutLogs={workoutLogs}
          user={user}
        />

        <div className="h-20" />
      </main>

      {/* Footer */}
      <Footer onNavigate={setCurrentPage} />

      {/* Timer Overlay */}
      <TimerOverlay
        timer={timer}
        isRunning={isTimerRunning}
        onReset={resetTimer}
        onToggle={toggleTimer}
      />
    </div>
  );
}
