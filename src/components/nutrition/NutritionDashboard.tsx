import React, { useState, useMemo } from "react";
import { useNutrition } from "../../hooks/useNutrition";
import { useProfile } from "../../hooks/useProfile";
import type { User } from "firebase/auth";

// Sub-components
import MacroSummary from "./MacroSummary";
import NutritionAILogger from "./NutritionAILogger";
import MealHistory from "./MealHistory";
import EditMealModal from "./EditMealModal";
import RefineMealModal from "./RefineMealModal";
import type { NutritionLogEntry } from "../../types";

interface NutritionDashboardProps {
  user: User | null;
  onRequireAuth?: () => void;
}

interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

const NutritionDashboard: React.FC<NutritionDashboardProps> = ({
  user,
  onRequireAuth,
}) => {
  const { logs, loading, addFoodLog, deleteFoodLog, updateFoodLog, duplicateLog, getDayTotals } =
    useNutrition(user);
  const { profile, saveProfile } = useProfile(user);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingMeal, setEditingMeal] = useState<NutritionLogEntry | null>(null);
  const [refiningMeal, setRefiningMeal] = useState<NutritionLogEntry | null>(null);

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

  const handleGoalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    saveProfile({ goal: e.target.value as any });
  };

  const handleDietChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    saveProfile({ dietType: e.target.value as any });
  };

  return (
    <div className='space-y-6 pb-20 px-1 relative'>
      <div className='grid grid-cols-2 gap-4 bg-slate-900/50 p-3 rounded-xl border border-slate-800'>
        <div>
          <label className='text-[10px] uppercase font-bold text-slate-500 mb-1 block'>
            Objetivo
          </label>
          <select
            value={profile?.goal || "muscle_gain"}
            onChange={handleGoalChange}
            className='w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs focus:border-blue-500 outline-none'
          >
            <option value='muscle_gain'>Ganar Músculo</option>
            <option value='fat_loss'>Perder Grasa</option>
            <option value='strength'>Ganar Fuerza</option>
            <option value='endurance'>Resistencia</option>
          </select>
        </div>
        <div>
          <label className='text-[10px] uppercase font-bold text-slate-500 mb-1 block'>Dieta</label>
          <select
            value={profile?.dietType || "balanced"}
            onChange={handleDietChange}
            className='w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs focus:border-blue-500 outline-none'
          >
            <option value='balanced'>Equilibrada</option>
            <option value='high_protein'>Alta en Proteína</option>
            <option value='keto'>Keto</option>
            <option value='paleo'>Paleo</option>
            <option value='low_carb'>Low Carb</option>
          </select>
        </div>
      </div>

      <MacroSummary
        dayTotals={dayTotals}
        targets={targets}
      />

      {isToday && (
        <NutritionAILogger
          user={user}
          onAddLog={addFoodLog}
          onRequireAuth={onRequireAuth}
        />
      )}

      <MealHistory
        logs={logs}
        selectedDate={selectedDate}
        onDateChange={changeDate}
        onDeleteLog={deleteFoodLog}
        onDuplicate={(log) => (duplicateLog ? duplicateLog(log) : Promise.resolve(false))}
        onEdit={(log) => setEditingMeal(log)}
        onRefine={(log) => setRefiningMeal(log)}
        loading={loading}
      />

      {/* Modals */}
      <EditMealModal
        isOpen={!!editingMeal}
        meal={editingMeal}
        onClose={() => setEditingMeal(null)}
        onSave={async (id, data) => {
          // Remove id and date if present in data to match updateFoodLog type
          const { id: _, date: __, ...updateData } = data as any;
          return await updateFoodLog(id, updateData);
        }}
      />

      <RefineMealModal
        isOpen={!!refiningMeal}
        meal={refiningMeal}
        onClose={() => setRefiningMeal(null)}
        onSave={async (id, data) => {
          // Remove id and date if present in data to match updateFoodLog type
          const { id: _, date: __, ...updateData } = data as any;
          return await updateFoodLog(id, updateData);
        }}
      />
    </div>
  );
};

export default NutritionDashboard;
