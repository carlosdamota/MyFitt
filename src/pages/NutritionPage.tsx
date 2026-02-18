import React from "react";
import { useOutletContext } from "react-router";
import NutritionDashboard from "../components/nutrition/NutritionDashboard";
import type { DashboardContext } from "../layouts/DashboardLayout";

export default function NutritionPage() {
  const { user, onRequireAuth } = useOutletContext<DashboardContext>();

  return (
    <NutritionDashboard
      user={user}
      onRequireAuth={onRequireAuth}
    />
  );
}
