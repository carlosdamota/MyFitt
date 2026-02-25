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
      stats={stats}
      onClose={() => window.history.back()}
      coachHistory={coachAdvice || ""}
      onSaveAdvice={saveCoachAdvice}
      userWeight={profile?.weight || 70}
      routines={routines}
      onRequireAuth={onRequireAuth}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
    />
  );
}
