import React, { useMemo, useState } from "react";
import { Link } from "react-router";
import { Flame, Dumbbell, ChevronRight, ChevronLeft } from "lucide-react";
import type { WorkoutLogs } from "../../types";

interface WeeklyProgressProps {
  streak: number;
  workoutLogs: WorkoutLogs;
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

export default function WeeklyProgress({ streak, workoutLogs }: WeeklyProgressProps) {
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

  return (
    <div className='bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-4 sm:p-6 mb-6'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-lg sm:text-xl font-bold text-white'>Tu serie</h2>
        <Link
          to='/app/stats'
          className='text-orange-400 text-xs sm:text-sm font-medium flex items-center hover:text-orange-300 transition-colors'
        >
          Ver estadísticas <ChevronRight size={16} />
        </Link>
      </div>

      <div className='flex flex-col md:flex-row items-center gap-6 md:gap-8'>
        {/* Streak Circle */}
        <div className='flex flex-col items-center gap-2 shrink-0'>
          <div className='relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 transition-transform hover:scale-105'>
            <Flame
              size={64}
              className='text-orange-500 fill-orange-500/20 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]'
              strokeWidth={1.5}
            />
            <span className='absolute inset-0 flex items-center justify-center text-white font-black text-2xl sm:text-3xl z-10 pt-2 sm:pt-3 drop-shadow-md'>
              {streak}
            </span>
          </div>
          <span className='text-[10px] sm:text-xs font-bold text-orange-400 uppercase tracking-widest'>
            Días Racha
          </span>
        </div>

        {/* Days Grid & Navigation Container */}
        {/* Adjusted padding (p-2) and gap (gap-1) for better mobile fit */}
        <div className='flex-1 w-full bg-slate-800/40 rounded-2xl p-2 sm:p-3 border border-slate-700/50 flex items-center gap-1 sm:gap-4'>
          <button
            onClick={() => changeWeek(-1)}
            className='p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all active:scale-95 shrink-0'
            aria-label='Semana anterior'
          >
            <ChevronLeft size={20} />
          </button>

          <div className='flex-1 flex justify-between items-center'>
            {currentWeek.map((date, index) => {
              const dateString = date.toDateString();
              const hasWorkout = daysWithWorkouts.has(dateString);
              const isToday = new Date().toDateString() === dateString;
              const isFuture = date > new Date();
              const dayNumber = date.getDate();

              return (
                <div
                  key={index}
                  className='flex flex-col items-center gap-1.5 sm:gap-2 relative group min-w-0'
                >
                  <span
                    className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${
                      isToday ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-200"
                    }`}
                  >
                    {weekDays[index]}
                  </span>

                  <div
                    className={`
                      w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 relative shrink-0
                      ${
                        hasWorkout
                          ? "bg-linear-to-br from-white to-slate-200 text-slate-900 shadow-[0_0_12px_rgba(255,255,255,0.3)] scale-110 border-none"
                          : isToday
                            ? "bg-slate-800 text-cyan-400 border border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                            : "bg-slate-800/50 text-slate-500 border border-slate-700 hover:border-slate-500 hover:bg-slate-800"
                      }
                      ${isFuture ? "opacity-30 pointer-events-none" : "opacity-100"}
                    `}
                  >
                    {hasWorkout ? (
                      <Dumbbell
                        size={14}
                        className='sm:w-5 sm:h-5 fill-slate-900/10'
                        strokeWidth={2.5}
                      />
                    ) : (
                      <span>{dayNumber}</span>
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
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
            }`}
            aria-label='Semana siguiente'
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
