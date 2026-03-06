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
    <div className='fixed bottom-0 left-0 right-0 w-full z-[60] animate-in slide-in-from-bottom duration-300 transition-colors'>
      <div className='w-full bg-white/95 dark:bg-[#0a1128]/95 border-t border-slate-200 dark:border-[#1e293b] backdrop-blur-xl shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.3)]'>
        <div className='max-w-md mx-auto flex items-center justify-between p-4 pb-6 sm:pb-4'>
          {/* Time Display */}
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 rounded-full bg-blue-50 dark:bg-[#082f49] border border-blue-200 dark:border-[#0369a1] text-blue-600 dark:text-[#38bdf8] flex items-center justify-center transition-colors'>
              <Clock
                size={24}
                className={isRunning ? "animate-pulse" : ""}
              />
            </div>
            <div className='flex flex-col justify-center'>
              <p className='text-[10px] text-blue-600 dark:text-[#38bdf8] font-bold uppercase tracking-widest transition-colors mb-0.5'>
                Descanso
              </p>
              <h3 className='text-2xl font-black text-slate-900 dark:text-white font-mono leading-none transition-colors'>
                {formatTime(timeLeft)}
              </h3>
            </div>
          </div>

          {/* Controls */}
          <div className='flex items-center gap-2'>
            <button
              onClick={() => onAdd(-10)}
              className='w-10 h-10 rounded-full bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] text-slate-500 dark:text-[#94a3b8] hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#334155] flex items-center justify-center transition-all shadow-sm'
            >
              <Minus size={18} />
            </button>

            <button
              onClick={onToggle}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                isRunning
                  ? "bg-slate-100 dark:bg-[#1e293b] text-slate-900 dark:text-white border border-slate-200 dark:border-[#334155] hover:bg-slate-200 dark:hover:bg-[#334155]"
                  : "bg-blue-600 dark:bg-[#064e3b] text-white dark:text-[#10b981] border border-blue-700 dark:border-[#047857]"
              }`}
            >
              {isRunning ? (
                <Pause
                  size={20}
                  fill='currentColor'
                />
              ) : (
                <Play
                  size={20}
                  fill='currentColor'
                  className='ml-1'
                />
              )}
            </button>

            <button
              onClick={() => onAdd(10)}
              className='w-10 h-10 rounded-full bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] text-slate-500 dark:text-[#94a3b8] hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#334155] flex items-center justify-center transition-all shadow-sm'
            >
              <Plus size={18} />
            </button>

            <button
              onClick={onSkip}
              className='w-10 h-10 rounded-full bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] text-amber-600 dark:text-[#d97706] hover:text-amber-700 dark:hover:text-[#f59e0b] hover:bg-slate-200 dark:hover:bg-[#334155] flex items-center justify-center transition-all ml-1 shadow-sm'
              title='Saltar descanso'
            >
              <SkipForward size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestTimer;
