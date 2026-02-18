import React from "react";
import { Play, Pause, Square, Timer } from "lucide-react";

interface RoutineTimerProps {
  timeFormatted: string;
  isRunning: boolean;
  onToggle: () => void;
  onStop: () => void;
  className?: string;
}

const RoutineTimer: React.FC<RoutineTimerProps> = ({
  timeFormatted,
  isRunning,
  onToggle,
  onStop,
  className = "",
}) => {
  return (
    <div
      className={`flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm ${className}`}
    >
      <div className='flex items-center gap-3'>
        <div
          className={`p-2 rounded-xl ${isRunning ? "bg-green-500/10 text-green-400" : "bg-slate-800 text-slate-400"}`}
        >
          <Timer
            size={20}
            className={isRunning ? "animate-pulse" : ""}
          />
        </div>
        <div className='flex flex-col'>
          <span className='text-xs font-bold text-slate-500 uppercase tracking-wider'>
            Tiempo de Rutina
          </span>
          <span className='text-2xl font-mono font-bold text-white tracking-widest leading-none mt-1'>
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
      </div>
    </div>
  );
};

export default RoutineTimer;
