import { RotateCcw, Pause, Play } from "lucide-react";
import { Button } from "../ui/Button";

interface TimerOverlayProps {
  timer: number;
  isRunning: boolean;
  onReset: (duration?: number) => void;
  onToggle: () => void;
}

const TimerOverlay: React.FC<TimerOverlayProps> = ({ timer, isRunning, onReset, onToggle }) => {
  const isVisible = isRunning || timer < 60;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-surface-900/90 backdrop-blur-lg border-t border-surface-800 p-4 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.4)] transition-transform duration-300 ${isVisible ? "translate-y-0" : "translate-y-full"}`}
      role='timer'
      aria-live='polite'
    >
      <div className='max-w-md mx-auto flex items-center justify-between px-2'>
        <div className='flex flex-col'>
          <span className='text-[10px] uppercase tracking-widest text-slate-500 font-bold'>
            Descanso Restante
          </span>
          <span
            className={`text-4xl font-mono font-bold tracking-tighter ${timer < 10 ? "text-danger-500 animate-pulse" : "text-white"}`}
          >
            {timer}
            <span className='text-lg text-slate-600'>s</span>
          </span>
        </div>
        <div className='flex items-center gap-3'>
          <Button
            variant='outline'
            onClick={() => onReset(60)}
            className='w-12 h-12 flex items-center justify-center rounded-full p-0 border-surface-700 bg-surface-800 flex-none'
            aria-label='Reiniciar temporizador'
          >
            <RotateCcw size={20} />
          </Button>
          <Button
            variant='primary'
            onClick={onToggle}
            className={`w-14 h-14 flex items-center justify-center rounded-full p-0 shadow-lg flex-none ${isRunning ? "bg-amber-500 hover:bg-amber-600 shadow-warning-900/40 text-slate-900" : "bg-primary-600 hover:bg-primary-500 shadow-primary-900/40 text-white"}`}
            aria-label={isRunning ? "Pausar temporizador" : "Iniciar temporizador"}
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
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TimerOverlay;
