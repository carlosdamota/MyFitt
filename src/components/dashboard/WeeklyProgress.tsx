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
    <div className='bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-5 mb-6 shadow-xl relative overflow-hidden'>
      {/* Background decoration */}
      <div className='absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none' />

      <div className='flex justify-between items-start mb-6 relative z-10'>
        <div>
          <h2 className='text-lg sm:text-xl font-bold text-white flex items-center gap-2'>
            Progreso Semanal
            {isGoalMet && <Trophy className='text-amber-400 w-5 h-5 animate-pulse' />}
          </h2>
          <p className='text-slate-400 text-sm mt-1'>{motivationalMessage}</p>
        </div>
        <Link
          to='/app/stats'
          className='text-cyan-400 text-xs sm:text-sm font-medium flex items-center hover:text-cyan-300 transition-colors bg-cyan-950/30 px-3 py-1.5 rounded-full border border-cyan-500/20'
        >
          Ver estadísticas{" "}
          <ChevronRight
            size={14}
            className='ml-1'
          />
        </Link>
      </div>

      <div className='flex flex-col md:flex-row items-center gap-6 md:gap-8 relative z-10'>
        {/* Progress Ring & Stats */}
        <div className='flex items-center gap-5 shrink-0'>
          {/* Circular Progress */}
          <div className='relative w-24 h-24 flex items-center justify-center'>
            <svg
              className='transform -rotate-90 w-24 h-24 drop-shadow-[0_0_10px_rgba(6,182,212,0.15)]'
              viewBox='0 0 80 80'
            >
              {/* Background circle */}
              <circle
                className='text-slate-800'
                strokeWidth='6'
                stroke='currentColor'
                fill='transparent'
                r={radius}
                cx='40'
                cy='40'
              />
              {/* Progress circle */}
              <circle
                className={`${isGoalMet ? "text-cyan-400" : "text-cyan-500"}`}
                strokeWidth='6'
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap='round'
                stroke='currentColor'
                fill='transparent'
                r={radius}
                cx='40'
                cy='40'
              />
            </svg>
            <div className='absolute inset-0 flex flex-col items-center justify-center pt-1'>
              <span className='text-2xl font-black text-white leading-none'>
                {workoutsThisWeek}
                <span className='text-sm text-slate-500 font-medium'>/{targetDays}</span>
              </span>
            </div>
          </div>

          {/* Stats Info */}
          <div className='flex flex-col gap-3'>
            <div className='flex flex-col'>
              <span className='text-xs text-slate-400 uppercase tracking-wider font-bold'>
                Objetivo
              </span>
              <span className='text-sm text-white font-medium flex items-center gap-1.5'>
                <Target
                  size={14}
                  className='text-cyan-500'
                />
                {targetDays} Sesiones
              </span>
            </div>
            <div className='flex flex-col'>
              <span className='text-xs text-slate-400 uppercase tracking-wider font-bold'>
                Racha Actual
              </span>
              <span className='text-sm text-white font-medium flex items-center gap-1.5'>
                <Flame
                  size={14}
                  className='text-orange-500'
                  fill='currentColor'
                />
                {streak} Días
              </span>
            </div>
          </div>
        </div>

        {/* Days Grid */}
        <div className='flex-1 w-full bg-slate-950/50 rounded-2xl p-2 sm:p-3 border border-slate-800 flex items-center gap-1 sm:gap-2 justify-between'>
          <button
            onClick={() => changeWeek(-1)}
            className='p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-95 shrink-0'
            aria-label='Semana anterior'
          >
            <ChevronLeft size={18} />
          </button>

          <div className='flex-1 flex justify-around items-center'>
            {currentWeek.map((date, index) => {
              const dateString = date.toDateString();
              const hasWorkout = daysWithWorkouts.has(dateString);
              const isToday = new Date().toDateString() === dateString;
              const isFuture = date > new Date();

              return (
                <div
                  key={index}
                  className='flex flex-col items-center gap-1.5 relative group'
                >
                  <span
                    className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${
                      isToday ? "text-cyan-400" : "text-slate-500"
                    }`}
                  >
                    {weekDays[index]}
                  </span>

                  <div
                    className={`
                      w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 relative shrink-0
                      ${
                        hasWorkout
                          ? "bg-linear-to-br from-cyan-400 to-blue-500 text-white shadow-[0_0_12px_rgba(34,211,238,0.4)] scale-105 border-none"
                          : isToday
                            ? "bg-slate-800 text-cyan-400 border border-cyan-500/50"
                            : "bg-slate-800/30 text-slate-600 border border-slate-800"
                      }
                      ${isFuture ? "opacity-30" : "opacity-100"}
                    `}
                  >
                    {hasWorkout && (
                      <Dumbbell
                        size={12}
                        className='sm:w-4 sm:h-4 text-white'
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
            className={`p-1.5 sm:p-2 rounded-xl transition-all active:scale-95 shrink-0 ${
              isCurrentWeek
                ? "text-slate-700 cursor-not-allowed opacity-50"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
            aria-label='Semana siguiente'
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
