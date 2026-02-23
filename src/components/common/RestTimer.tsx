import React, { useEffect } from "react";
import { X, Play, Pause, Plus, SkipForward, Minus, Clock } from "lucide-react";
import { playTimerBeep } from "../../utils/audio";

interface RestTimerProps {
  timeFormatted: string; // e.g., "01:30" - actually, useTimer gives seconds often. Let's assume we pass seconds or formatted.
  // Let's pass seconds and format here, or pass formatted.
  // The hook useTimer gives "timer" (number).
  timeLeft: number;
  isRunning: boolean;
  onToggle: () => void;
  onAdd: (seconds: number) => void;
  onSkip: () => void;
  onClose: () => void;
}

const RestTimer: React.FC<RestTimerProps> = ({
  timeLeft,
  isRunning,
  onToggle,
  onAdd,
  onSkip,
  onClose,
}) => {
  const hasBeeped = React.useRef(false);

  useEffect(() => {
    // If time reaches 0, play sound, vibrate, and auto close
    if (timeLeft === 0 && !isRunning && !hasBeeped.current) {
      hasBeeped.current = true;
      playTimerBeep();
      if ("vibrate" in navigator) {
        navigator.vibrate([200, 100, 200]);
      }

      const t = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(t);
    }

    if (timeLeft > 0) {
      hasBeeped.current = false;
    }
  }, [timeLeft, isRunning, onClose]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Return early if the timer is completely stopped and parent wants to hide it,
  // but we are relying on parent to unmount it after 3s now.

  return (
    <div className='fixed bottom-0 left-0 right-0 z-50 p-4 pb-8 bg-white/95 dark:bg-surface-950/95 border-t border-slate-200 dark:border-surface-800 backdrop-blur-xl animate-in slide-in-from-bottom duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transition-colors'>
      <div className='max-w-md mx-auto flex items-center justify-between gap-4'>
        {/* Time Display */}
        <div className='flex items-center gap-3'>
          <div className='w-12 h-12 rounded-full bg-blue-50 dark:bg-primary-500/10 border border-blue-200 dark:border-primary-500/30 flex items-center justify-center text-blue-600 dark:text-cyan-400 shadow-sm dark:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-colors'>
            <Clock
              size={24}
              className={isRunning ? "animate-pulse" : ""}
            />
          </div>
          <div>
            <p className='text-xs text-blue-600 dark:text-primary-400/80 font-bold uppercase tracking-widest transition-colors'>
              Descanso
            </p>
            <h3 className='text-3xl font-black text-slate-900 dark:text-white font-mono leading-none transition-colors'>
              {formatTime(timeLeft)}
            </h3>
          </div>
        </div>

        {/* Controls */}
        <div className='flex items-center gap-2'>
          <button
            onClick={() => onAdd(-10)}
            className='w-10 h-10 rounded-full bg-slate-100 dark:bg-surface-900 border border-slate-200 dark:border-surface-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-surface-800 flex items-center justify-center transition-all shadow-sm'
          >
            <Minus size={18} />
          </button>

          <button
            onClick={onToggle}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 ${
              isRunning
                ? "bg-slate-100 dark:bg-surface-800 text-slate-900 dark:text-white border border-slate-200 dark:border-surface-700 shadow-sm dark:shadow-md hover:bg-slate-200 dark:hover:bg-surface-700"
                : "bg-linear-to-br from-blue-600 to-indigo-600 dark:from-primary-500 dark:to-indigo-500 border-none text-white hover:from-blue-500 hover:to-indigo-500 dark:hover:from-primary-400 dark:hover:to-indigo-400 shadow-blue-500/30 dark:shadow-[0_0_20px_rgba(139,92,246,0.3)] shadow-lg"
            }`}
          >
            {isRunning ? (
              <Pause
                size={24}
                fill='currentColor'
              />
            ) : (
              <Play
                size={24}
                fill='currentColor'
                className='ml-1'
              />
            )}
          </button>

          <button
            onClick={() => onAdd(10)}
            className='w-10 h-10 rounded-full bg-slate-100 dark:bg-surface-900 border border-slate-200 dark:border-surface-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-surface-800 flex items-center justify-center transition-all shadow-sm'
          >
            <Plus size={18} />
          </button>

          <button
            onClick={onSkip}
            className='w-10 h-10 rounded-full bg-slate-100 dark:bg-surface-900 border border-slate-200 dark:border-surface-800 text-amber-600 dark:text-amber-500/80 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-slate-200 dark:hover:bg-surface-800 flex items-center justify-center transition-all ml-2 shadow-sm'
            title='Saltar descanso'
          >
            <SkipForward size={18} />
          </button>

          <button
            onClick={onClose}
            className='w-8 h-8 rounded-full bg-transparent text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 flex items-center justify-center transition-colors ml-1'
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestTimer;
