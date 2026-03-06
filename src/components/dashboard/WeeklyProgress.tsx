import React, { useMemo, useState } from "react";
import { Link } from "react-router";
import { Flame, Dumbbell, ChevronRight, ChevronLeft, Trophy, Target } from "lucide-react";
import type { WorkoutLogs } from "../../types";

interface WeeklyProgressProps {
  streak: number;
  workoutLogs: WorkoutLogs;
  targetDays?: number;
}

// Helper to safely parse dates from various formats (String, Timestamp, Date)
const safeParseDate = (date: any): Date | null => {
  if (!date) return null;
  if (date instanceof Date && !isNaN(date.getTime())) return date;
  if (typeof date === "object" && typeof date.toDate === "function") {
    // Firestore Timestamp
    return date.toDate();
  }
  if (typeof date === "object" && "seconds" in date) {
    // Firestore Timestamp dictionary
    return new Date(date.seconds * 1000);
  }
  const parsed = new Date(date);
  if (!isNaN(parsed.getTime())) return parsed;
  return null;
};

export default function WeeklyProgress({
  streak,
  workoutLogs,
  targetDays = 3,
}: WeeklyProgressProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentWeek = useMemo(() => {
    const day = currentDate.getDay();
    const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const Monday = new Date(currentDate);
    Monday.setDate(diff);

    const week = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(Monday);
      dayDate.setDate(Monday.getDate() + i);
      week.push(dayDate);
    }
    return week;
  }, [currentDate]);

  const daysWithWorkouts = useMemo(() => {
    const dates = new Set<string>();
    Object.values(workoutLogs).forEach((logs) => {
      logs.forEach((log) => {
        const parsedDate = safeParseDate(log.date);
        if (parsedDate) {
          dates.add(parsedDate.toDateString());
        }
      });
    });
    return dates;
  }, [workoutLogs]);

  const weekDays = ["L", "M", "X", "J", "V", "S", "D"];

  const changeWeek = (direction: -1 | 1) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction * 7);
    setCurrentDate(newDate);
  };

  const isCurrentWeek = useMemo(() => {
    const today = new Date();
    const startOfCurrentWeek = new Date(today);
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    startOfCurrentWeek.setDate(diff);
    startOfCurrentWeek.setHours(0, 0, 0, 0);

    const startOfViewedWeek = new Date(currentWeek[0]);
    startOfViewedWeek.setHours(0, 0, 0, 0);

    return startOfCurrentWeek.getTime() === startOfViewedWeek.getTime();
  }, [currentWeek]);

  // Calculate weekly progress
  const workoutsThisWeek = useMemo(() => {
    let count = 0;
    currentWeek.forEach((date) => {
      if (daysWithWorkouts.has(date.toDateString())) {
        count++;
      }
    });
    return count;
  }, [currentWeek, daysWithWorkouts]);

  const progressPercentage = Math.min((workoutsThisWeek / targetDays) * 100, 100);
  const isGoalMet = workoutsThisWeek >= targetDays;

  // Motivational message based on progress
  const motivationalMessage = useMemo(() => {
    if (workoutsThisWeek === 0) return "¡A por la primera sesión!";
    if (workoutsThisWeek >= targetDays) return "¡Objetivo cumplido! 🔥";
    if (workoutsThisWeek >= targetDays / 2) return "¡Ya falta poco! Sigue así.";
    return "¡Buen comienzo! 💪";
  }, [workoutsThisWeek, targetDays]);

  // Circular Progress Component
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div className='bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-800 rounded-2xl p-3 mb-4 shadow-sm dark:shadow-xl relative overflow-hidden transition-colors'>
      {/* Background decoration */}
      <div className='absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none' />

      <div className='flex justify-between items-center mb-2 relative z-10'>
        <h2 className='text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 transition-colors'>
          Progreso Semanal
          {isGoalMet && (
            <Trophy className='text-amber-500 dark:text-amber-400 size-4 animate-pulse' />
          )}
        </h2>
        <Link
          to='/app/stats'
          className='text-blue-600 dark:text-cyan-400 text-[10px] sm:text-xs font-medium flex items-center hover:text-blue-700 dark:hover:text-cyan-300 transition-colors bg-slate-50 dark:bg-surface-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-surface-700 whitespace-nowrap shrink-0'
        >
          Estadísticas{" "}
          <ChevronRight
            size={12}
            className='ml-0.5'
          />
        </Link>
      </div>

      <div className='flex flex-col gap-2 relative z-10'>
        {/* Flame Progress Bar */}
        <div className='flex flex-col gap-2'>
          <div className='flex justify-between items-end'>
            <p className='text-slate-500 dark:text-slate-400 text-xs font-medium transition-colors'>
              {motivationalMessage}
            </p>
            <div className='flex items-center gap-1.5 bg-orange-500/10 dark:bg-orange-500/20 px-2 py-0.5 rounded-full border border-orange-500/20'>
              <Flame
                size={12}
                className='text-orange-500'
                fill='currentColor'
              />
              <span className='text-[10px] sm:text-xs font-bold text-orange-600 dark:text-orange-400'>
                {streak} {streak === 1 ? "sem" : "sems"}
              </span>
            </div>
          </div>

          <div className='flex gap-2 h-10 items-center justify-between bg-slate-50/50 dark:bg-surface-950/50 p-2 rounded-xl border border-slate-100 dark:border-surface-800/50'>
            <div className='flex gap-2 flex-1'>
              {Array.from({ length: Math.max(targetDays, 5) }).map((_, i) => {
                const isActive = i < workoutsThisWeek;
                const isNext = i === workoutsThisWeek && !isGoalMet;
                return (
                  <div
                    key={i}
                    className={`
                      relative flex-1 h-6 max-w-10 rounded-lg flex items-center justify-center transition-all duration-500
                      ${
                        isActive
                          ? "bg-linear-to-br from-orange-400 to-orange-600 dark:from-orange-500 dark:to-red-600 shadow-[0_0_10px_rgba(249,115,22,0.4)]"
                          : "bg-slate-200 dark:bg-surface-800 opacity-40"
                      }
                      ${isNext ? "animate-pulse border-2 border-orange-500/30" : ""}
                    `}
                  >
                    <Flame
                      size={i < workoutsThisWeek ? 14 : 12}
                      className={`transition-colors ${isActive ? "text-white" : "text-slate-400 dark:text-slate-600"}`}
                      fill={isActive ? "currentColor" : "none"}
                    />
                  </div>
                );
              })}
            </div>
            <div className='pl-3 border-l border-slate-200 dark:border-surface-800 shrink-0'>
              <span className='text-sm font-black text-slate-900 dark:text-white leading-none'>
                {workoutsThisWeek}
                <span className='text-[10px] text-slate-500 font-medium ml-0.5'>/{targetDays}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Days Grid - Optimized for space */}
        <div className='bg-slate-50/50 dark:bg-surface-950/50 rounded-xl p-1.5 border border-slate-100 dark:border-surface-800/50 flex items-center gap-1 transition-colors'>
          <button
            onClick={() => changeWeek(-1)}
            className='p-1 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors active:scale-95'
          >
            <ChevronLeft size={16} />
          </button>

          <div className='flex-1 flex justify-around'>
            {currentWeek.map((date, index) => {
              const dateString = date.toDateString();
              const hasWorkout = daysWithWorkouts.has(dateString);
              const isToday = new Date().toDateString() === dateString;

              return (
                <div
                  key={index}
                  className='flex flex-col items-center gap-1'
                >
                  <span
                    className={`text-[8px] font-bold uppercase ${isToday ? "text-blue-500 dark:text-cyan-400" : "text-slate-400 dark:text-slate-600"}`}
                  >
                    {weekDays[index]}
                  </span>
                  <div
                    className={`
                    w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all duration-300
                    ${
                      hasWorkout
                        ? "bg-linear-to-br from-blue-500 to-blue-600 dark:from-cyan-400 dark:to-blue-500 text-white shadow-sm scale-110"
                        : isToday
                          ? "border border-blue-400/50 dark:border-cyan-500/50"
                          : "bg-slate-200/50 dark:bg-surface-800/50"
                    }
                  `}
                  >
                    {hasWorkout && (
                      <Dumbbell
                        size={10}
                        className='text-white'
                        strokeWidth={3}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => changeWeek(1)}
            disabled={isCurrentWeek}
            className={`p-1 rounded-lg transition-colors active:scale-95 ${isCurrentWeek ? "opacity-20 cursor-not-allowed" : "text-slate-400 hover:text-slate-900"}`}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
