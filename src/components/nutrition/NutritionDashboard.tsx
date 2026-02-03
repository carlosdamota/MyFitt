import React, { useState, useMemo, FormEvent } from "react";
import {
  Plus,
  Trash2,
  Utensils,
  Flame,
  Droplet,
  Wheat,
  Loader,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { useNutrition } from "../../hooks/useNutrition";
import { useProfile } from "../../hooks/useProfile";
import { parseNutritionLog } from "../../api/gemini";
import { useRateLimit } from "../../hooks/useRateLimit";
import RateLimitError from "../errors/RateLimitError";
import { logEvent } from "../../utils/analytics";
import type { User } from "firebase/auth";
import type { LucideIcon } from "lucide-react";

interface NutritionDashboardProps {
  user: User | null;
}

interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface QuickLogEvent extends FormEvent<HTMLFormElement> {}

const NutritionDashboard: React.FC<NutritionDashboardProps> = ({ user }) => {
  const { logs, loading, addFoodLog, deleteFoodLog, getDayTotals } = useNutrition(user);
  const { profile } = useProfile(user);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [input, setInput] = useState<string>("");
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showRateLimitError, setShowRateLimitError] = useState<boolean>(false);

  // Rate limiting: 50 logs de nutrición con IA por día
  const rateLimitNutrition = useRateLimit(user, "parse_nutrition", 50);

  // Calcular objetivos basados en el perfil
  const targets = useMemo<MacroTargets>(() => {
    if (!profile || !profile.weight) {
      return { calories: 2000, protein: 150, carbs: 200, fats: 65 };
    }

    const weight = parseFloat(String(profile.weight)) || 75;
    const goal = profile.goal || "muscle_gain";

    // Cálculos basados en objetivo
    let caloriesMultiplier = 1;
    let proteinPerKg = 2.0; // Eliminado si no se usa después

    if (goal === "muscle_gain") {
      caloriesMultiplier = 1.15; // Superávit del 15%
      proteinPerKg = 2.2;
    } else if (goal === "fat_loss") {
      caloriesMultiplier = 0.85; // Déficit del 15%
      proteinPerKg = 2.4; // Más proteína en déficit
    } else if (goal === "strength") {
      caloriesMultiplier = 1.1;
      proteinPerKg = 2.0;
    }

    const height = parseFloat(String(profile.height)) || 175;
    const age = parseFloat(String(profile.age)) || 30;
    const bmr = 10 * weight + 6.25 * height - 5 * age + (profile.gender === "male" ? 5 : -161);
    const tdee = bmr * 1.5; // Factor de actividad moderada
    const targetCalories = Math.round(tdee * caloriesMultiplier);
    const dietType = profile.dietType || "balanced";

    // Ratios de macros según dieta (Proteína, Grasa, Carbos)
    let pRatio = 0.3; // 30%
    let fRatio = 0.25; // 25%
    let cRatio = 0.45; // 45%

    if (dietType === "keto") {
      pRatio = 0.25;
      fRatio = 0.7;
      cRatio = 0.05;
    } else if (dietType === "paleo") {
      pRatio = 0.4;
      fRatio = 0.4;
      cRatio = 0.2;
    } else if (dietType === "high_protein") {
      pRatio = 0.45;
      fRatio = 0.25;
      cRatio = 0.3;
    } else if (dietType === "low_carb") {
      pRatio = 0.4;
      fRatio = 0.4;
      cRatio = 0.2;
    }

    // Ajuste fino por objetivo (si es necesario)
    if (goal === "muscle_gain") {
      // En volumen, aseguramos suficientes carbos si no es keto
      if (dietType !== "keto") cRatio += 0.05;
    }

    // Normalizar ratios para que sumen 1
    const totalRatio = pRatio + fRatio + cRatio;
    pRatio = pRatio / totalRatio;
    fRatio = fRatio / totalRatio;
    cRatio = cRatio / totalRatio;

    // Calcular gramos
    const targetProtein = Math.round((targetCalories * pRatio) / 4);
    const targetFats = Math.round((targetCalories * fRatio) / 9);
    const targetCarbs = Math.round((targetCalories * cRatio) / 4);

    return {
      calories: targetCalories,
      protein: targetProtein,
      carbs: targetCarbs,
      fats: targetFats,
    };
  }, [profile]);

  const dayTotals = useMemo(() => getDayTotals(selectedDate), [selectedDate, logs, getDayTotals]);

  const handleQuickLog = async (e: QuickLogEvent): Promise<void> => {
    e.preventDefault();
    if (!input.trim()) return;

    // Verificar rate limit antes de parsear
    const canParse = await rateLimitNutrition.checkAndIncrement();
    if (!canParse) {
      setShowRateLimitError(true);
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const nutritionData = await parseNutritionLog(input);
      if (nutritionData) {
        await addFoodLog(nutritionData);
        logEvent("Nutrition", "Logged with AI", nutritionData.food);
        setInput("");
      } else {
        setError("No se pudo entender el alimento.");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAnalyzing(false);
    }
  };

  const changeDate = (days: number): void => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  interface MacroBarProps {
    label: string;
    current: number;
    target: number;
    color: string;
    icon: LucideIcon;
  }

  const MacroBar: React.FC<MacroBarProps> = ({ label, current, target, color, icon: Icon }) => {
    const percentage = (current / target) * 100;
    const isOver = current > target;

    return (
      <div className='space-y-1'>
        <div className='flex justify-between items-center text-xs'>
          <span className={`font-bold flex items-center gap-1 ${color}`}>
            <Icon size={12} /> {label}
          </span>
          <span className={`font-mono ${isOver ? "text-red-400" : "text-slate-300"}`}>
            {Math.round(current)}/{target}g{" "}
            {isOver && (
              <AlertTriangle
                size={10}
                className='inline text-red-400'
              />
            )}
          </span>
        </div>
        <div className='h-2 bg-slate-800 rounded-full overflow-hidden'>
          <div
            className={`h-full transition-all duration-300 ${isOver ? "bg-red-500" : color.replace("text-", "bg-")}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    );
  };

  // Datos para gráfico circular
  const totalMacros = dayTotals.protein + dayTotals.carbs + dayTotals.fats;
  const pPct = totalMacros ? (dayTotals.protein / totalMacros) * 100 : 0;
  const cPct = totalMacros ? (dayTotals.carbs / totalMacros) * 100 : 0;

  const chartStyle = {
    background: `conic-gradient(
      #3b82f6 0% ${pPct}%, 
      #a855f7 ${pPct}% ${pPct + cPct}%, 
      #eab308 ${pPct + cPct}% 100%
    )`,
  };

  const caloriesPercentage = (dayTotals.calories / targets.calories) * 100;
  const isCaloriesOver = dayTotals.calories > targets.calories;

  return (
    <div className='space-y-6 pb-20'>
      {/* Rate Limit Error Modal */}
      {showRateLimitError && (
        <RateLimitError
          message={
            rateLimitNutrition.error ||
            "Has alcanzado el límite de 50 logs de nutrición con IA por día"
          }
          resetAt={rateLimitNutrition.resetAt}
          onClose={() => setShowRateLimitError(false)}
        />
      )}

      {/* Date Navigator */}
      <div className='bg-slate-900/50 p-3 rounded-2xl border border-slate-800 flex items-center justify-between'>
        <button
          onClick={() => changeDate(-1)}
          className='p-2 hover:bg-slate-800 rounded-lg transition-colors'
        >
          <ChevronLeft
            size={18}
            className='text-slate-400'
          />
        </button>
        <div className='flex items-center gap-2'>
          <Calendar
            size={16}
            className='text-blue-400'
          />
          <span className='text-sm font-bold text-white'>
            {isToday
              ? "Hoy"
              : selectedDate.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
          </span>
        </div>
        <button
          onClick={() => changeDate(1)}
          disabled={isToday}
          className='p-2 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-30'
        >
          <ChevronRight
            size={18}
            className='text-slate-400'
          />
        </button>
      </div>

      {/* Resumen del Día */}
      <div className='bg-slate-900/50 p-4 rounded-2xl border border-slate-800'>
        <h3 className='text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2'>
          <Utensils size={16} /> Resumen del Día
        </h3>

        <div className='flex items-center gap-6 mb-6'>
          {/* Gráfico */}
          <div
            className='relative w-24 h-24 rounded-full flex items-center justify-center shrink-0'
            style={chartStyle}
          >
            <div className='absolute inset-2 bg-slate-950 rounded-full flex flex-col items-center justify-center'>
              <span
                className={`text-xl font-bold ${isCaloriesOver ? "text-red-400" : "text-white"}`}
              >
                {Math.round(dayTotals.calories)}
              </span>
              <span className='text-[10px] text-slate-500 uppercase'>Kcal</span>
            </div>
          </div>

          {/* Target Info */}
          <div className='flex-1'>
            <div className='flex justify-between items-center mb-2'>
              <span className='text-xs text-slate-500'>Objetivo Diario</span>
              <span className='text-xs font-bold text-slate-300'>{targets.calories} kcal</span>
            </div>
            <div className='h-2 bg-slate-800 rounded-full overflow-hidden mb-2'>
              <div
                className={`h-full transition-all duration-300 ${isCaloriesOver ? "bg-red-500" : "bg-green-500"}`}
                style={{ width: `${Math.min(caloriesPercentage, 100)}%` }}
              />
            </div>
            <div className='flex justify-between text-[10px]'>
              <span className={isCaloriesOver ? "text-red-400 font-bold" : "text-slate-500"}>
                {isCaloriesOver
                  ? `+${Math.round(dayTotals.calories - targets.calories)} kcal`
                  : `${Math.round(targets.calories - dayTotals.calories)} restantes`}
              </span>
              <span className='text-slate-500'>{Math.round(caloriesPercentage)}%</span>
            </div>
          </div>
        </div>

        {/* Macro Bars */}
        <div className='space-y-3'>
          <MacroBar
            label='Proteína'
            current={dayTotals.protein}
            target={targets.protein}
            color='text-blue-400'
            icon={Droplet}
          />
          <MacroBar
            label='Carbohidratos'
            current={dayTotals.carbs}
            target={targets.carbs}
            color='text-purple-400'
            icon={Wheat}
          />
          <MacroBar
            label='Grasas'
            current={dayTotals.fats}
            target={targets.fats}
            color='text-yellow-400'
            icon={Flame}
          />
        </div>
      </div>

      {/* Quick Log con IA - Solo mostrar si es hoy */}
      {isToday && (
        <div className='bg-gradient-to-br from-indigo-900/20 to-slate-900 p-4 rounded-2xl border border-indigo-500/30'>
          <h3 className='text-sm font-bold text-indigo-300 uppercase mb-2 flex items-center gap-2'>
            <Sparkles size={14} /> Log Rápido con IA
          </h3>
          <form
            onSubmit={handleQuickLog}
            className='relative'
          >
            <input
              type='text'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Ej: 2 huevos revueltos y una manzana'
              className='w-full bg-slate-950 border border-indigo-900/50 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:border-indigo-500 outline-none placeholder-slate-600 transition-all'
              disabled={analyzing}
            />
            <button
              type='submit'
              disabled={analyzing || !input.trim()}
              className='absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:bg-slate-700 disabled:text-slate-500'
            >
              {analyzing ? (
                <Loader
                  size={16}
                  className='animate-spin'
                />
              ) : (
                <Plus size={16} />
              )}
            </button>
          </form>
          {error && <p className='text-xs text-red-400 mt-2'>{error}</p>}
          <p className='text-[10px] text-slate-500 mt-2 italic'>
            Describe tu comida y la IA calculará los macros.
          </p>
        </div>
      )}

      {/* Historial del Día */}
      <div className='space-y-3'>
        <h3 className='text-sm font-bold text-slate-400 uppercase px-1'>Comidas del Día</h3>
        {loading ? (
          <div className='flex justify-center py-4'>
            <Loader className='animate-spin text-slate-600' />
          </div>
        ) : logs.filter((l) => new Date(l.date).toDateString() === selectedDate.toDateString())
            .length === 0 ? (
          <p className='text-center text-slate-600 text-xs py-4 italic'>
            No hay comidas registradas este día.
          </p>
        ) : (
          logs
            .filter((l) => new Date(l.date).toDateString() === selectedDate.toDateString())
            .map((log) => (
              <div
                key={log.id}
                className='bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center animate-in slide-in-from-bottom-2'
              >
                <div>
                  <h4 className='font-bold text-slate-200 text-sm'>{log.food}</h4>
                  <div className='flex gap-2 text-[10px] text-slate-500 mt-0.5 font-mono'>
                    <span className='text-blue-400'>{log.protein}p</span>
                    <span className='text-purple-400'>{log.carbs}c</span>
                    <span className='text-yellow-400'>{log.fats}f</span>
                    <span className='text-white font-bold'>{log.calories} kcal</span>
                  </div>
                </div>
                {isToday && log.id && (
                  <button
                    onClick={() => deleteFoodLog(log.id!)}
                    className='text-slate-600 hover:text-red-400 p-2 transition-colors'
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default NutritionDashboard;
