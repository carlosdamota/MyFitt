import React, { useEffect } from "react";
import { X, Play, Pause, Plus, SkipForward, Minus, Clock } from "lucide-react";

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
  useEffect(() => {
    // If time reaches 0, maybe close or vibrate?
    // The parent likely handles this via the hook's effects or callbacks.
    if (timeLeft === 0 && !isRunning) {
      // Timer finished
    }
  }, [timeLeft, isRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (timeLeft <= 0 && !isRunning) return null; // Don't show if done/inactive? Or let parent control visibility.

  return (
    <div className='fixed bottom-0 left-0 right-0 z-50 p-4 pb-8 bg-surface-950/95 border-t border-surface-800 backdrop-blur-xl animate-in slide-in-from-bottom duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]'>
      <div className='max-w-md mx-auto flex items-center justify-between gap-4'>
        {/* Time Display */}
        <div className='flex items-center gap-3'>
          <div className='w-12 h-12 rounded-full bg-primary-500/10 border border-primary-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]'>
            <Clock
              size={24}
              className={isRunning ? "animate-pulse" : ""}
            />
          </div>
          <div>
            <p className='text-xs text-primary-400/80 font-bold uppercase tracking-widest'>
              Descanso
            </p>
            <h3 className='text-3xl font-black text-white font-mono leading-none'>
              {formatTime(timeLeft)}
            </h3>
          </div>
        </div>

        {/* Controls */}
        <div className='flex items-center gap-2'>
          <button
            onClick={() => onAdd(-10)}
            className='w-10 h-10 rounded-full bg-surface-900 border border-surface-800 text-slate-400 hover:text-white hover:bg-surface-800 flex items-center justify-center transition-all shadow-sm'
          >
            <Minus size={18} />
          </button>

          <button
            onClick={onToggle}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 ${
              isRunning
                ? "bg-surface-800 text-white border border-surface-700 shadow-md hover:bg-surface-700"
                : "bg-linear-to-br from-primary-500 to-indigo-500 border-none text-white hover:from-primary-400 hover:to-indigo-400 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
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
            className='w-10 h-10 rounded-full bg-surface-900 border border-surface-800 text-slate-400 hover:text-white hover:bg-surface-800 flex items-center justify-center transition-all shadow-sm'
          >
            <Plus size={18} />
          </button>

          <button
            onClick={onSkip}
            className='w-10 h-10 rounded-full bg-surface-900 border border-surface-800 text-amber-500/80 hover:text-amber-400 hover:bg-surface-800 flex items-center justify-center transition-all ml-2 shadow-sm'
            title='Saltar descanso'
          >
            <SkipForward size={18} />
          </button>

          <button
            onClick={onClose}
            className='w-8 h-8 rounded-full bg-transparent text-slate-600 hover:text-slate-400 flex items-center justify-center transition-colors ml-1'
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestTimer;
