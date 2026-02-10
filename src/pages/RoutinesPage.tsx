import React from "react";
import { useOutletContext, useNavigate } from "react-router";
import RoutineManager from "../components/routines/RoutineManager";
import type { DashboardContext } from "../layouts/DashboardLayout";

export default function RoutinesPage() {
  const { user, isPro, onRequireAuth } = useOutletContext<DashboardContext>();
  const navigate = useNavigate();

  return (
    <RoutineManager
      user={user}
      isPro={isPro}
      onClose={() => navigate("/app")}
      onSelectRoutine={(id) => navigate(`/app?routine=${id}`)}
      onRequireAuth={onRequireAuth}
      viewMode='page'
    />
  );
}
