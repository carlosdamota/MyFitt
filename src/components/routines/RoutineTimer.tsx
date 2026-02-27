import React from "react";
import { Play, Pause, Square, Timer, X } from "lucide-react";

interface RoutineTimerProps {
  timeFormatted: string;
  isRunning: boolean;
  onToggle: () => void;
  onStop: () => void;
  onCancel?: () => void;
  className?: string;
}

const RoutineTimer: React.FC<RoutineTimerProps> = ({
  timeFormatted,
  isRunning,
  onToggle,
  onStop,
  onCancel,
  className = "",
}) => {
  return (
    <div
      className={`flex items-center justify-between p-4 bg-white/50 dark:bg-surface-950/50 border border-slate-200 dark:border-surface-800 rounded-2xl backdrop-blur-sm transition-colors ${className}`}
    >
      <div className='flex items-center gap-3'>
        <div
          className={`p-2 rounded-xl transition-colors ${isRunning ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400" : "bg-slate-100 dark:bg-surface-800 text-slate-500 dark:text-slate-400"}`}
        >
          <Timer
            size={20}
            className={isRunning ? "animate-pulse" : ""}
          />
        </div>
        <div className='flex flex-col'>
          <span className='text-xs font-bold text-slate-600 dark:text-slate-500 uppercase tracking-wider transition-colors'>
            Tiempo de Rutina
          </span>
          <span className='text-2xl font-mono font-bold text-slate-900 dark:text-white tracking-widest leading-none mt-1 transition-colors'>
            {timeFormatted}
          </span>
        </div>
      </div>

      <div className='flex items-center gap-2'>
        <button
          onClick={onToggle}
          className={`p-3 rounded-xl transition-all active:scale-95 ${
            isRunning
              ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20"
              : "bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20"
          }`}
          aria-label={isRunning ? "Pausar" : "Iniciar"}
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
            />
          )}
        </button>

        <button
          onClick={onStop}
          className='p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all active:scale-95'
          aria-label='Detener y finalizar'
        >
          <Square
            size={20}
            fill='currentColor'
          />
        </button>

        {onCancel && (
          <button
            onClick={onCancel}
            className='p-3 rounded-xl bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 border border-slate-500/20 transition-all active:scale-95'
            aria-label='Cancelar y descartar'
            title='Cancelar entrenamiento'
          >
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default RoutineTimer;
