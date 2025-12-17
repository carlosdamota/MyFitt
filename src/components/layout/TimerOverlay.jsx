import React from 'react';
import { RotateCcw, Pause, Play } from 'lucide-react';

/**
 * Timer overlay that appears at the bottom of the screen during rest periods.
 * @param {object} props
 * @param {number} props.timer - Current timer value in seconds.
 * @param {boolean} props.isRunning - Whether the timer is currently running.
 * @param {function} props.onReset - Callback to reset the timer (with default duration).
 * @param {function} props.onToggle - Callback to pause/resume the timer.
 */
const TimerOverlay = ({ timer, isRunning, onReset, onToggle }) => {
  const isVisible = isRunning || timer < 60;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 p-4 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.4)] transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
      role="timer"
      aria-live="polite"
    >
      <div className="max-w-md mx-auto flex items-center justify-between px-2">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Descanso Restante</span>
          <span className={`text-4xl font-mono font-bold tracking-tighter ${timer < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            {timer}<span className="text-lg text-slate-600">s</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onReset(60)}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
            aria-label="Reiniciar temporizador"
          >
            <RotateCcw size={20} />
          </button>
          <button
            onClick={onToggle}
            className={`w-14 h-14 flex items-center justify-center rounded-full text-white shadow-lg shadow-blue-900/20 transition-all transform active:scale-95 ${isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-500'}`}
            aria-label={isRunning ? "Pausar temporizador" : "Iniciar temporizador"}
          >
            {isRunning ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimerOverlay;
