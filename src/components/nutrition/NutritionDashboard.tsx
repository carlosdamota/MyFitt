import React, { useState, useMemo } from "react";
import { useNutrition } from "../../hooks/useNutrition";
import { useProfile } from "../../hooks/useProfile";
import type { User } from "firebase/auth";

// Sub-components
import MacroSummary from "./MacroSummary";
import NutritionAILogger from "./NutritionAILogger";
import MealHistory from "./MealHistory";

interface NutritionDashboardProps {
  user: User | null;
  onRequireAuth?: () => void;
  onUpgrade?: () => void;
}

interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

const NutritionDashboard: React.FC<NutritionDashboardProps> = ({ user, onRequireAuth, onUpgrade }) => {
  const { logs, loading, addFoodLog, deleteFoodLog, getDayTotals } = useNutrition(user);
  const { profile } = useProfile(user);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Calcular objetivos basados en el perfil
  const targets = useMemo<MacroTargets>(() => {
    if (!profile || !profile.weight) {
      return { calories: 2000, protein: 150, carbs: 200, fats: 65 };
    }

    const weight = parseFloat(String(profile.weight)) || 75;
    const goal = profile.goal || "muscle_gain";
    let caloriesMultiplier = 1;

    if (goal === "muscle_gain") caloriesMultiplier = 1.15;
    else if (goal === "fat_loss") caloriesMultiplier = 0.85;
    else if (goal === "strength") caloriesMultiplier = 1.1;

    const height = parseFloat(String(profile.height)) || 175;
    const age = parseFloat(String(profile.age)) || 30;
    const bmr = 10 * weight + 6.25 * height - 5 * age + (profile.gender === "male" ? 5 : -161);
    const tdee = bmr * 1.5;
    const targetCalories = Math.round(tdee * caloriesMultiplier);
    const dietType = profile.dietType || "balanced";

    let pRatio = 0.3,
      fRatio = 0.25,
      cRatio = 0.45;

    if (dietType === "keto") {
      pRatio = 0.25;
      fRatio = 0.7;
      cRatio = 0.05;
    } else if (dietType === "paleo" || dietType === "low_carb") {
      pRatio = 0.4;
      fRatio = 0.4;
      cRatio = 0.2;
    } else if (dietType === "high_protein") {
      pRatio = 0.45;
      fRatio = 0.25;
      cRatio = 0.3;
    }

    const totalRatio = pRatio + fRatio + cRatio;
    const targetProtein = Math.round((targetCalories * (pRatio / totalRatio)) / 4);
    const targetFats = Math.round((targetCalories * (fRatio / totalRatio)) / 9);
    const targetCarbs = Math.round((targetCalories * (cRatio / totalRatio)) / 4);

    return {
      calories: targetCalories,
      protein: targetProtein,
      carbs: targetCarbs,
      fats: targetFats,
    };
  }, [profile]);

  const dayTotals = useMemo(() => getDayTotals(selectedDate), [selectedDate, logs, getDayTotals]);
  const isToday = selectedDate.toDateString() === new Date().toDateString();

  const changeDate = (days: number): void => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  return (
    <div className='space-y-6 pb-20 overflow-y-auto max-h-[85vh] px-1'>
      <MacroSummary
        dayTotals={dayTotals}
        targets={targets}
      />

      {isToday && (
        <NutritionAILogger
          user={user}
          onAddLog={addFoodLog}
          onRequireAuth={onRequireAuth}
          onUpgrade={onUpgrade}
        />
      )}

      <MealHistory
        logs={logs}
        selectedDate={selectedDate}
        onDateChange={changeDate}
        onDeleteLog={deleteFoodLog}
        loading={loading}
      />
    </div>
  );
};

export default NutritionDashboard;
