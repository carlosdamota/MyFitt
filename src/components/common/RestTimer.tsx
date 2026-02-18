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
    <div className='fixed bottom-0 left-0 right-0 z-50 p-4 pb-8 bg-slate-900/95 border-t border-slate-800 backdrop-blur-xl animate-in slide-in-from-bottom duration-300'>
      <div className='max-w-md mx-auto flex items-center justify-between gap-4'>
        {/* Time Display */}
        <div className='flex items-center gap-3'>
          <div className='w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-blue-400'>
            <Clock
              size={24}
              className={isRunning ? "animate-pulse" : ""}
            />
          </div>
          <div>
            <p className='text-xs text-slate-400 font-bold uppercase tracking-wider'>Descanso</p>
            <h3 className='text-3xl font-black text-white font-mono leading-none'>
              {formatTime(timeLeft)}
            </h3>
          </div>
        </div>

        {/* Controls */}
        <div className='flex items-center gap-2'>
          <button
            onClick={() => onAdd(-10)}
            className='w-10 h-10 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors'
          >
            <Minus size={18} />
          </button>

          <button
            onClick={onToggle}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${
              isRunning
                ? "bg-slate-700 text-white hover:bg-slate-600"
                : "bg-blue-600 text-white hover:bg-blue-500"
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
            className='w-10 h-10 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors'
          >
            <Plus size={18} />
          </button>

          <button
            onClick={onSkip}
            className='w-10 h-10 rounded-full bg-slate-800 text-amber-500/80 hover:text-amber-500 hover:bg-slate-700 flex items-center justify-center transition-colors ml-2'
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
