import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useOutletContext } from "react-router";
import { Loader } from "lucide-react";

import { useWorkoutLogs } from "../hooks/useWorkoutLogs";
import { useProfile } from "../hooks/useProfile";
import { useRoutines } from "../hooks/useRoutines";

import RoutineTabs from "../components/routines/RoutineTabs";
import WorkoutDay from "../components/routines/WorkoutDay";
import RoutineEditor from "../components/routines/RoutineEditor";

import type { DashboardContext } from "../layouts/DashboardLayout";

export default function WorkoutDashboard() {
  const { user, isPro, onRequireAuth, onUpgrade } = useOutletContext<DashboardContext>();

  const [activeTab, setActiveTab] = useState<string>("day1");
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});
  const [showRoutineEditor, setShowRoutineEditor] = useState(false);

  const { profile } = useProfile(user);
  const { workoutLogs, saveLog, deleteLog, streak } = useWorkoutLogs(user);
  const {
    routines,
    loading: routinesLoading,
    saveRoutine,
    shareRoutine,
    importSharedRoutine,
  } = useRoutines(user);

  const [searchParams] = useSearchParams();

  // Handle shareId from URL
  useEffect(() => {
    const shareId = searchParams.get("shareId");
    if (shareId && user && !routinesLoading) {
      if (window.confirm("¿Quieres importar esta rutina compartida?")) {
        importSharedRoutine(shareId, activeTab).then((success) => {
          if (success) {
            alert("¡Rutina importada!");
            window.history.replaceState({}, document.title, "/app");
          }
        });
      }
    }
  }, [user, routinesLoading, searchParams]);

  // Sync active tab with profile's active routine
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
      <div className='flex items-center justify-center py-20 text-blue-500'>
        <Loader
          className='animate-spin'
          size={32}
        />
      </div>
    );
  }

  const currentRoutine = routines[activeTab] || Object.values(routines)[0];

  return (
    <>
      <RoutineTabs
        routines={programRoutines}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <WorkoutDay
        routine={currentRoutine}
        dayKey={activeTab}
        isPro={isPro}
        completedExercises={completedExercises}
        onToggleComplete={(day, ex) => {
          const key = `${day}-${ex}`;
          setCompletedExercises((prev) => ({ ...prev, [key]: !prev[key] }));
        }}
        onEditRoutine={() => setShowRoutineEditor(true)}
        onResetTimer={() => {}}
        onSaveLog={saveLog}
        onDeleteLog={deleteLog}
        workoutLogs={workoutLogs}
        user={user}
        onRequireAuth={onRequireAuth}
        onShowSubscription={onUpgrade}
      />

      {showRoutineEditor && (
        <RoutineEditor
          initialData={currentRoutine}
          onSave={async (r) => {
            if (await saveRoutine(activeTab, r)) setShowRoutineEditor(false);
          }}
          onCancel={() => setShowRoutineEditor(false)}
          onShare={(r) => shareRoutine(activeTab, r)}
        />
      )}
    </>
  );
}
