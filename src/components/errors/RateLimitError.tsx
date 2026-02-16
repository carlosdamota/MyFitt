import React, { useState, useEffect } from "react";
import { AlertTriangle, Clock, X } from "lucide-react";
import ProUpgrade from "../common/ProUpgrade";

interface RateLimitErrorProps {
  message: string;
  resetAt: string | null;
  onClose: () => void;
  onUpgrade?: () => void;
}

const RateLimitError: React.FC<RateLimitErrorProps> = ({
  message,
  resetAt,
  onClose,
  onUpgrade,
}) => {
  const [timeUntilReset, setTimeUntilReset] = useState<string>("");

  useEffect(() => {
    if (!resetAt) return;

    const updateCountdown = (): void => {
      const now = new Date();
      const reset = new Date(resetAt);
      const diff = reset.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeUntilReset("¡Ya puedes intentarlo de nuevo!");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeUntilReset(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeUntilReset(`${minutes}m ${seconds}s`);
      } else {
        setTimeUntilReset(`${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [resetAt]);

  return (
    <div className='fixed inset-0 z-200 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300'>
      <div className='bg-slate-900 border border-red-500/50 rounded-2xl p-6 max-w-md mx-4 animate-in zoom-in-95 duration-200 shadow-2xl'>
        <div className='flex items-start gap-3 mb-4'>
          <div className='p-2 bg-red-600/20 rounded-lg'>
            <AlertTriangle
              size={24}
              className='text-red-400'
            />
          </div>
          <div className='flex-1'>
            <h3 className='text-lg font-bold text-white mb-1'>Límite Alcanzado</h3>
            <p className='text-sm text-slate-300'>{message}</p>
          </div>
          <button
            onClick={onClose}
            className='text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded'
          >
            <X size={20} />
          </button>
        </div>

        {resetAt && (
          <div className='bg-slate-950 border border-slate-800 rounded-lg p-4 mb-4'>
            <div className='flex items-center gap-2 text-sm text-slate-400 mb-2'>
              <Clock
                size={16}
                className='text-blue-400'
              />
              <span>Próximo reset:</span>
            </div>
            <div className='text-2xl font-bold text-white font-mono'>{timeUntilReset}</div>
          </div>
        )}

        <div className='bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 mb-4'>
          <p className='text-xs text-blue-200'>
            💡 <strong>¿Por qué hay límites?</strong> Para mantener la app estable y cubrir costos
            de API. Los límites se resetean según tu plan (semanal o mensual).
          </p>
        </div>

        <div className='flex gap-3'>
          {onUpgrade && (
            <ProUpgrade
              mini
              context='unlimited_usage'
              buttonText='Pasar a Pro'
              onClick={onClose}
              className='flex-1 justify-center py-2.5 h-auto bg-blue-600 text-white hover:bg-blue-500 border-none'
            />
          )}
          <button
            onClick={onClose}
            className='flex-1 py-2.5 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors'
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default RateLimitError;
