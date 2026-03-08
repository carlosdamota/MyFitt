import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { Award, ChevronRight, Flame, Info, Shield, Trophy } from "lucide-react";
import type { UserStats, WorkoutLogs } from "../../types";
import { useToast } from "../../hooks/useToast";
import { MedalIcon } from "../icons/MedalIcon";

interface WeeklyProgressProps {
  streak: number;
  workoutLogs: WorkoutLogs;
  stats: UserStats | null;
  targetDays?: number;
}

const safeParseDate = (date: unknown): Date | null => {
  const parsed = new Date(String(date));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const resolveMedalTarget = (streak: number) => {
  if (streak >= 24) return { targetWeeks: 24, baseWeeks: 24, label: "Oro" };
  if (streak >= 12) return { targetWeeks: 24, baseWeeks: 12, label: "Oro" };
  if (streak >= 4) return { targetWeeks: 12, baseWeeks: 4, label: "Plata" };
  return { targetWeeks: 4, baseWeeks: 0, label: "Bronce" };
};

export default function WeeklyProgress({
  streak,
  workoutLogs,
  stats,
  targetDays = 3,
}: WeeklyProgressProps) {
  const { success, info } = useToast();
  const [showShieldInfo, setShowShieldInfo] = useState(false);

  // Auto-cerrar el tooltip después de 5 segundos
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showShieldInfo) {
      timeout = setTimeout(() => {
        setShowShieldInfo(false);
      }, 5000);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [showShieldInfo]);
  const effectiveStreak = Math.max(0, Number(stats?.gamification?.weekStreak ?? streak));
  const totalSessions = Math.max(0, Number(stats?.totalSessions ?? 0));
  const inferredShieldCount = Math.min(3, Math.floor(totalSessions / 10));
  const inferredShieldProgress = inferredShieldCount >= 3 ? 0 : totalSessions % 10;
  const shieldCount = Math.min(
    3,
    Math.max(0, Number(stats?.gamification?.shieldCount ?? inferredShieldCount)),
  );
  const shieldProgress = Math.min(
    9,
    Math.max(0, Number(stats?.gamification?.shieldProgress ?? inferredShieldProgress)),
  );

  const previousShieldCountRef = useRef<number | null>(null);
  const previousRescueWeekRef = useRef<string | null>(null);

  useEffect(() => {
    if (previousShieldCountRef.current !== null && shieldCount > previousShieldCountRef.current) {
      success("¡Escudo conseguido por tu constancia! Tu racha está protegida.");
    }
    previousShieldCountRef.current = shieldCount;
  }, [shieldCount, success]);

  useEffect(() => {
    const rescueWeek = stats?.gamification?.lastRescueWeekKey || null;
    if (
      rescueWeek &&
      previousRescueWeekRef.current &&
      rescueWeek !== previousRescueWeekRef.current
    ) {
      info("Escudo activado la semana pasada. Tu racha sigue intacta.");
    }
    previousRescueWeekRef.current = rescueWeek;
  }, [stats?.gamification?.lastRescueWeekKey, info]);

  const workoutsThisWeek = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 7);

    const trainedDays = new Set<string>();
    Object.values(workoutLogs).forEach((logs) => {
      logs.forEach((log) => {
        const parsed = safeParseDate(log.date);
        if (parsed && parsed >= monday && parsed < sunday) {
          trainedDays.add(parsed.toDateString());
        }
      });
    });

    return trainedDays.size;
  }, [workoutLogs]);

  const medalTarget = resolveMedalTarget(effectiveStreak);
  const weeksRemaining = Math.max(0, medalTarget.targetWeeks - effectiveStreak);

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const shieldOffset = circumference - (shieldProgress / 10) * circumference;

  const range = medalTarget.targetWeeks - medalTarget.baseWeeks;
  const progressInLevel = Math.max(0, effectiveStreak - medalTarget.baseWeeks);
  const levelProgressPct = range > 0 ? Math.min((progressInLevel / range) * 100, 100) : 100;

  const getMedalType = (label: string) => {
    if (label === "Oro") return "gold";
    if (label === "Plata") return "silver";
    return "bronze";
  };

  return (
    <section
      className={`relative rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur-sm transition-colors dark:border-surface-800 dark:bg-surface-900/90 dark:shadow-xl ${showShieldInfo ? "z-50" : ""}`}
    >
      {/* Contenedor de fondo para contener el blur sin cortar los popups */}
      <div className='pointer-events-none absolute inset-0 overflow-hidden rounded-2xl'>
        <div className='absolute right-0 top-0 h-40 w-40 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary-500/10 blur-3xl' />
      </div>

      <div className='relative z-10 flex items-center justify-between gap-2'>
        <h2 className='flex items-center text-sm font-bold text-slate-900 transition-colors dark:text-white sm:text-base'>
          Progreso semanal
          <div className='ml-2 flex flex-wrap items-center gap-0.5'>
            {effectiveStreak >= 4 ? (
              <>
                <MedalIcon
                  type='bronze'
                  achieved
                  className='h-5 w-5 drop-shadow-sm'
                />
                {effectiveStreak >= 12 && (
                  <MedalIcon
                    type='silver'
                    achieved
                    className='h-5 w-5 drop-shadow-sm'
                  />
                )}
                {effectiveStreak >= 24 && (
                  <MedalIcon
                    type='gold'
                    achieved
                    className='h-5 w-5 drop-shadow-sm'
                  />
                )}
              </>
            ) : (
              <Trophy className='size-4 md:size-5 text-slate-300 dark:text-surface-700' />
            )}
          </div>
        </h2>
        <Link
          to='/app/stats'
          className='inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-primary-600 transition-colors hover:text-primary-700 dark:border-surface-700 dark:bg-surface-800 dark:text-primary-400 dark:hover:text-primary-300 sm:text-xs'
        >
          Estadísticas <ChevronRight size={12} />
        </Link>
      </div>

      {/* Días completados The Flames */}
      <div className='relative z-10 mt-2 flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-2.5 sm:px-3 py-2 transition-colors dark:border-surface-800/70 dark:bg-surface-950/40'>
        <div className='flex items-center gap-1 sm:gap-1.5'>
          {Array.from({ length: Math.max(1, targetDays) }).map((_, index) => {
            const active = index < Math.min(workoutsThisWeek, targetDays);
            return (
              <span
                key={index}
                className={`relative flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${active ? "bg-orange-500/15" : "bg-white dark:bg-surface-900 shadow-sm border border-slate-100 dark:border-surface-800"}`}
              >
                <Flame
                  className={`${active ? "text-orange-500" : "text-slate-300 dark:text-surface-700"} h-3.5 w-3.5 sm:h-4 sm:w-4`}
                  fill={active ? "currentColor" : "none"}
                />
                {active && (
                  <span className='absolute inset-0 rounded-xl shadow-[0_0_10px_rgba(249,115,22,0.3)] pointer-events-none' />
                )}
              </span>
            );
          })}
        </div>
        <p className='whitespace-nowrap text-xs font-semibold text-slate-700 dark:text-slate-300 sm:text-sm'>
          {workoutsThisWeek}/{targetDays} entrenos
        </p>
      </div>

      {/* Escudos y Medallas en layout 1/3 y 2/3 */}
      <div className='relative z-30 mt-2 flex items-stretch gap-0 rounded-xl border border-slate-100 bg-slate-50/80 transition-colors dark:border-surface-800/70 dark:bg-surface-950/40'>
        {/* Left Side: Escudos (~1/3) */}
        <div className='relative flex w-[35%] shrink-0 flex-col sm:flex-row items-center sm:items-start justify-center p-2 sm:p-3 gap-2'>
          <div className='relative flex h-14 w-14 shrink-0 items-center justify-center'>
            <svg
              className='absolute inset-0 h-full w-full -rotate-90'
              viewBox='0 0 44 44'
            >
              <circle
                cx='22'
                cy='22'
                r={radius}
                stroke='currentColor'
                strokeWidth='3'
                className='text-slate-200 dark:text-surface-700/60'
                fill='none'
              />
              <circle
                cx='22'
                cy='22'
                r={radius}
                stroke='currentColor'
                strokeWidth='3'
                strokeLinecap='round'
                strokeDasharray={circumference}
                strokeDashoffset={shieldOffset}
                className='text-primary-500 drop-shadow-[0_0_4px_rgba(6,182,212,0.4)] transition-all duration-500'
                fill='none'
              />
            </svg>
            <Shield
              size={20}
              className='text-slate-700 dark:text-slate-200 z-10'
            />
          </div>
          <div className='flex flex-col items-center sm:items-start text-center sm:text-left leading-tight'>
            <div className='relative flex items-center gap-1 justify-center sm:justify-start w-full'>
              <p className='text-[11px] sm:text-xs font-extrabold text-slate-800 dark:text-slate-100'>
                x{shieldCount} escudos
              </p>
              <div className='relative inline-flex items-center justify-center'>
                <button
                  type='button'
                  onClick={() => setShowShieldInfo((prev) => !prev)}
                  className='inline-flex shrink-0 h-4 w-4 items-center justify-center rounded-full border border-primary-500/40 bg-primary-500/10 text-primary-700 transition-colors hover:bg-primary-500/20 dark:text-primary-300'
                  aria-label='Cómo funciona el escudo'
                >
                  <Info size={10} />
                </button>

                {showShieldInfo && (
                  <div className='absolute z-[100] left-1/2 md:left-full bottom-[110%] md:bottom-auto mb-2 md:mb-0 md:ml-2 w-56 -translate-x-[20%] md:translate-x-0 rounded-xl border border-slate-200 bg-white p-2.5 text-[10px] sm:text-xs text-slate-600 shadow-[0_10px_40px_-5px_rgba(0,0,0,0.3)] transition-colors dark:border-surface-700 dark:bg-surface-900 dark:text-slate-300 pointer-events-none'>
                    Ganas 1 escudo cada 10 entrenos (max. 3). Si una semana terminas con 0 entrenos,
                    se consume 1 para proteger tu racha.
                    <div className='absolute -bottom-2 md:bottom-auto md:top-1/2 left-[20%] md:-left-2 -translate-x-1/2 md:translate-x-0 md:-translate-y-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-t-white dark:border-t-surface-900 border-l-transparent border-r-transparent md:border-t-transparent md:border-b-transparent md:border-r-8 md:border-r-white md:dark:border-r-surface-900'></div>
                  </div>
                )}
              </div>
            </div>
            <p className='text-[10px] text-slate-500 dark:text-slate-400 mt-0.5'>
              {shieldProgress}/10 entrenos
            </p>
          </div>
        </div>

        {/* Separator Line */}
        <div className='w-px bg-slate-200 dark:bg-surface-700/80 my-2 shrink-0' />

        {/* Right Side: Progresión Racha (~2/3) */}
        <div className='flex min-w-0 flex-1 flex-col justify-center p-2 sm:p-3'>
          <div className='flex items-center justify-end gap-1.5 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100'>
            <Flame
              size={14}
              className='text-orange-500'
              fill='currentColor'
            />
            {effectiveStreak} Semanas seguidas
          </div>

          <div className='flex items-center gap-2 my-1.5 px-1'>
            {medalTarget.baseWeeks > 0 && (
              <div className='shrink-0 -mr-1 z-10'>
                <MedalIcon
                  type={
                    effectiveStreak >= 24 ? "gold" : effectiveStreak >= 12 ? "silver" : "bronze"
                  }
                  achieved
                  className='h-6 w-6 sm:h-7 sm:w-7 drop-shadow-sm'
                />
              </div>
            )}

            <div className='relative flex-1 h-2 rounded-full bg-slate-200 dark:bg-surface-800'>
              <div
                className='absolute top-0 left-0 h-full rounded-full bg-linear-to-r from-primary-600 via-primary-400 to-cyan-300 drop-shadow-[0_0_6px_rgba(6,182,212,0.4)] transition-all duration-700'
                style={{ width: `${levelProgressPct}%` }}
              />
            </div>

            <div className='shrink-0 -ml-1 z-10'>
              <MedalIcon
                type={getMedalType(medalTarget.label)}
                locked={effectiveStreak < medalTarget.targetWeeks}
                achieved={effectiveStreak >= medalTarget.targetWeeks}
                className='h-6 w-6 sm:h-7 sm:w-7 drop-shadow-sm'
              />
            </div>
          </div>

          <div className='mt-0.5 text-center sm:text-right'>
            <div className='inline-flex items-center overflow-hidden rounded-xl border border-primary-500/20 bg-primary-500/5 px-2 py-0.5 font-bold shadow-sm backdrop-blur-sm'>
              <span className='text-[10px] sm:text-xs text-primary-700 dark:text-cyan-300 drop-shadow-sm glow'>
                {effectiveStreak >= 24
                  ? "¡Objetivo Máximo alcanzado!"
                  : `Objetivo: ${medalTarget.label} (${weeksRemaining} sem)`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
