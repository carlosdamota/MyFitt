import React from "react";
import { Utensils, User as UserIcon, Sparkles } from "lucide-react";
import Modal from "../common/Modal";
import GlobalStats from "../stats/GlobalStats";
import NutritionDashboard from "../nutrition/NutritionDashboard";
import ProfileEditor from "../profile/ProfileEditor";
import AICoachPanel from "../ai/AICoachPanel";
import CookieSettings from "../legal/CookieSettings";
import RoutineEditor from "../routines/RoutineEditor";
import RoutineManager from "../routines/RoutineManager";
import type { User } from "firebase/auth";
import type { Routine, WorkoutLogs, RoutineData } from "../../types";

interface AppModalsProps {
  user: User | null;
  showStats: boolean;
  setShowStats: (show: boolean) => void;
  showNutrition: boolean;
  setShowNutrition: (show: boolean) => void;
  showAICoach: boolean;
  setShowAICoach: (show: boolean) => void;
  showProfile: boolean;
  setShowProfile: (show: boolean) => void;
  showRoutineEditor: boolean;
  setShowRoutineEditor: (show: boolean) => void;
  showRoutineManager: boolean;
  setShowRoutineManager: (show: boolean) => void;
  showCookieSettings: boolean;
  setShowCookieSettings: (show: boolean) => void;

  // Data & Handlers
  workoutLogs: WorkoutLogs;
  coachAdvice: string;
  saveCoachAdvice: (advice: string) => void;
  profile: any;
  routines: RoutineData;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleSaveRoutine: (routine: Routine) => Promise<void>;
  handleShareRoutine: (routine: Routine) => Promise<string | null>;
  consent: any;
  updateConsent: (consent: any) => void;
  onRequireAuth?: () => void;
  onUpgrade?: () => void;
}

const AppModals: React.FC<AppModalsProps> = ({
  user,
  showStats,
  setShowStats,
  showNutrition,
  setShowNutrition,
  showAICoach,
  setShowAICoach,
  showProfile,
  setShowProfile,
  showRoutineEditor,
  setShowRoutineEditor,
  showRoutineManager,
  setShowRoutineManager,
  showCookieSettings,
  setShowCookieSettings,
  workoutLogs,
  coachAdvice,
  saveCoachAdvice,
  profile,
  routines,
  activeTab,
  setActiveTab,
  handleSaveRoutine,
  handleShareRoutine,
  consent,
  updateConsent,
  onRequireAuth,
  onUpgrade,
}) => {
  const currentRoutine = routines[activeTab] || Object.values(routines)[0];

  return (
    <>
      {showStats && (
        <GlobalStats
          logs={workoutLogs}
          onClose={() => setShowStats(false)}
          coachHistory={coachAdvice || ""}
          onSaveAdvice={saveCoachAdvice}
          userWeight={profile?.weight || 70}
          routines={routines}
          onRequireAuth={onRequireAuth}
        />
      )}

      <Modal
        isOpen={showNutrition}
        onClose={() => setShowNutrition(false)}
        title='Nutrición'
        icon={
          <Utensils
            size={20}
            className='text-green-400'
          />
        }
      >
        <NutritionDashboard
          user={user}
          onRequireAuth={onRequireAuth}
          onUpgrade={onUpgrade}
        />
      </Modal>

      <Modal
        isOpen={showAICoach}
        onClose={() => setShowAICoach(false)}
        title='AI Coach'
        icon={
          <Sparkles
            size={20}
            className='text-emerald-300'
          />
        }
      >
        <AICoachPanel
          user={user}
          onRequireAuth={onRequireAuth}
          onShowProfile={() => {
            setShowAICoach(false);
            setShowProfile(true);
          }}
          onShowRoutines={() => {
            setShowAICoach(false);
            setShowRoutineManager(true);
          }}
          onUpgrade={onUpgrade}
        />
      </Modal>

      <Modal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        title='Perfil de Atleta'
        icon={
          <UserIcon
            size={20}
            className='text-blue-400'
          />
        }
      >
        <ProfileEditor
          user={user}
          onClose={() => setShowProfile(false)}
          onRequireAuth={onRequireAuth}
        />
      </Modal>

      {showCookieSettings && (
        <CookieSettings
          currentConsent={consent}
          onSave={updateConsent}
          onClose={() => setShowCookieSettings(false)}
        />
      )}

      {showRoutineEditor && (
        <RoutineEditor
          initialData={currentRoutine}
          onSave={handleSaveRoutine}
          onCancel={() => setShowRoutineEditor(false)}
          onShare={handleShareRoutine}
        />
      )}

      {showRoutineManager && (
        <RoutineManager
          user={user}
          onClose={() => setShowRoutineManager(false)}
          onSelectRoutine={(id) => {
            setActiveTab(id);
            setShowRoutineManager(false);
          }}
        />
      )}
    </>
  );
};

export default AppModals;
