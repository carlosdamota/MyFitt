import React from "react";
import { Share2, X, CheckCircle, Clock } from "lucide-react";
import { useToast } from "../../hooks/useToast";
import { useScrollLock } from "../../hooks/useScrollLock";

interface WorkoutFinishModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalTime: string; // Formatted string, e.g. "45:30"
  routineTitle: string;
}

const WorkoutFinishModal: React.FC<WorkoutFinishModalProps> = ({
  isOpen,
  onClose,
  totalTime,
  routineTitle,
}) => {
  const { success } = useToast();

  useScrollLock(isOpen);

  if (!isOpen) return null;

  const handleShare = async () => {
    const shareData = {
      title: "¡Entrenamiento Completado!",
      text: `Acabo de terminar mi rutina "${routineTitle}" en ${totalTime} minutos con FittWiz. ¡A por todas! 💪`,
      url: window.location.href, // Or a specific app URL
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.text}\n${shareData.url}`,
        );
        success("¡Texto copiado al portapapeles!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 dark:bg-surface-950/80 backdrop-blur-sm animate-in fade-in duration-200 transition-colors'>
      <div className='bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-800 rounded-3xl p-6 max-w-sm w-full relative shadow-xl dark:shadow-2xl animate-in zoom-in-95 duration-300 transition-colors'>
        <button
          onClick={onClose}
          className='absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-surface-800 transition-colors'
        >
          <X size={20} />
        </button>

        <div className='flex flex-col items-center text-center space-y-6 pt-4'>
          <div className='w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center border-4 border-green-500/10 shadow-[0_0_30px_rgba(34,197,94,0.3)]'>
            <CheckCircle size={40} />
          </div>

          <div>
            <h2 className='text-2xl font-black text-slate-900 dark:text-white mb-2 transition-colors'>
              ¡Rutina Completada!
            </h2>
            <p className='text-slate-500 dark:text-slate-400 text-sm transition-colors'>
              Has finalizado{" "}
              <span className='text-blue-500 dark:text-blue-400 font-bold'>"{routineTitle}"</span>
            </p>
          </div>

          <div className='flex items-center gap-3 bg-slate-50 dark:bg-surface-800/50 px-6 py-4 rounded-2xl border border-slate-200 dark:border-surface-700/50 w-full justify-center transition-colors'>
            <Clock
              size={24}
              className='text-blue-400'
            />
            <div className='flex flex-col items-start'>
              <span className='text-xs font-bold text-slate-500 uppercase'>Tiempo Total</span>
              <span className='text-2xl font-mono font-bold text-slate-900 dark:text-white leading-none transition-colors'>
                {totalTime}
              </span>
            </div>
          </div>

          <button
            onClick={handleShare}
            className='w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-600/20'
          >
            <Share2 size={20} />
            Compartir Logro
          </button>

          <button
            onClick={onClose}
            className='text-slate-500 text-sm hover:text-slate-900 dark:hover:text-white transition-colors'
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutFinishModal;
