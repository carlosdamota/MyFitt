import React from "react";
import { useOutletContext } from "react-router";
import { useWorkoutLogs } from "../hooks/useWorkoutLogs";
import { useProfile } from "../hooks/useProfile";
import { useRoutines } from "../hooks/useRoutines";
import GlobalStats from "../components/stats/GlobalStats";
import type { DashboardContext } from "../layouts/DashboardLayout";

export default function StatsPage() {
  const { user, onRequireAuth } = useOutletContext<DashboardContext>();

  const {
    workoutLogs,
    sessions,
    stats,
    coachAdvice,
    saveCoachAdvice,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useWorkoutLogs(user);
  const { profile } = useProfile(user);
  const { routines } = useRoutines(user);

  return (
    <GlobalStats
      logs={workoutLogs}
      sessions={sessions}
      stats={stats}
      onClose={() => window.history.back()}
      coachHistory={coachAdvice || ""}
      coachPersonality={profile?.coachPersonality || "motivador"}
      userGoal={profile?.goal}
      onSaveAdvice={saveCoachAdvice}
      userWeight={profile?.weight || 70}
      availableDays={profile?.availableDays}
      routines={routines}
      onRequireAuth={onRequireAuth}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
    />
  );
}
