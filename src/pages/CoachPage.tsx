import React from "react";
import { useOutletContext, useNavigate } from "react-router";
import AICoachPanel from "../components/ai/AICoachPanel";
import type { DashboardContext } from "../layouts/DashboardLayout";

export default function CoachPage() {
  const { user, isPro, onRequireAuth, onUpgrade } = useOutletContext<DashboardContext>();
  const navigate = useNavigate();

  return (
    <AICoachPanel
      user={user}
      onRequireAuth={onRequireAuth}
      onShowProfile={() => navigate("/app/profile")}
      onShowRoutines={() => navigate("/app")}
      onUpgrade={onUpgrade}
      isPro={isPro}
    />
  );
}
