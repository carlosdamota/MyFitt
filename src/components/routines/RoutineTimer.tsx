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
  const isPristine = timeFormatted === "00:00" && !isRunning;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 w-full z-40 transition-all duration-300 ${className}`}
    >
      <div className='w-full bg-white/95 dark:bg-[#0a1128]/95 border-t border-slate-200 dark:border-[#1e293b] backdrop-blur-xl shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.3)]'>
        <div className='max-w-md mx-auto flex items-center justify-between p-4 pb-6 sm:pb-4'>
          <div className='flex items-center gap-3'>
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isRunning
                  ? "bg-[#064e3b] border border-[#047857] text-[#10b981]"
                  : isPristine
                    ? "bg-amber-900/30 border border-amber-500/30 text-amber-500"
                  : "bg-slate-100 dark:bg-[#1e293b] text-slate-500 dark:text-[#94a3b8]"
              }`}
            >
              <Timer
                size={24}
                className={isRunning ? "animate-pulse" : isPristine ? "animate-bounce" : ""}
              />
            </div>
            <div className='flex flex-col justify-center'>
              <span
                className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                  isPristine ? "text-amber-500 font-black animate-pulse" : "text-slate-500 dark:text-[#94a3b8]"
                }`}
              >
                {isPristine ? "Boton parpadeando" : "Tiempo Total"}
              </span>
              <span className='text-2xl font-mono font-bold tracking-widest leading-none mt-1 transition-colors text-slate-900 dark:text-white'>
                {timeFormatted}
              </span>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <button
              onClick={onToggle}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                isRunning
                  ? "bg-[#451a03] text-[#f59e0b] border border-[#78350f]"
                  : isPristine
                    ? "bg-[#166534] text-[#4ade80] border border-[#14532d] shadow-[0_0_15px_rgba(22,101,52,0.8)] animate-pulse"
                    : "bg-slate-100 dark:bg-[#1e293b] text-slate-900 dark:text-white border border-slate-200 dark:border-[#334155] hover:bg-slate-200 dark:hover:bg-[#334155]"
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
                  className='ml-1'
                />
              )}
            </button>

            {!isPristine && (
              <button
                onClick={onStop}
                className='w-12 h-12 rounded-full bg-[#4c0519] text-[#f43f5e] hover:bg-[#881337] border border-[#881337] flex items-center justify-center transition-all active:scale-95 ml-1'
                aria-label='Detener y finalizar'
              >
                <Square
                  size={18}
                  fill='currentColor'
                />
              </button>
            )}

            {onCancel && !isPristine && (
              <button
                onClick={onCancel}
                className='w-10 h-10 rounded-full bg-slate-100 dark:bg-[#0f172a] text-slate-500 dark:text-[#475569] hover:text-slate-900 dark:hover:text-[#94a3b8] flex items-center justify-center transition-colors ml-1'
                aria-label='Cancelar y descartar'
                title='Cancelar entrenamiento'
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutineTimer;
