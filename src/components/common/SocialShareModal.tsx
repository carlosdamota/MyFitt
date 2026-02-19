import React, { useMemo, useRef } from "react";
import { X, Share2 } from "lucide-react";
import { SocialShareCard } from "./SocialShareCard";
import { WorkoutShareButton } from "./WorkoutShareButton";
import type { WorkoutLogEntry } from "../../types";

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  logs: (WorkoutLogEntry & { exercise: string; volume: number })[];
  duration?: string;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  date,
  logs,
  duration = "N/A",
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const totalVolume = logs.reduce((acc, log) => acc + (log.volume || 0), 0);
  const totalExercises = logs.length;

  const shareText = useMemo(() => {
    if (duration !== "N/A") {
      return `He completado un entrenamiento de ${totalExercises} ejercicios en ${duration} con ${totalVolume}kg de volumen.`;
    }
    return `He registrado ${totalExercises} ejercicios con ${totalVolume}kg de volumen total.`;
  }, [duration, totalExercises, totalVolume]);

  return (
    <div className='fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm'>
      <div className='flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900'>
        <div className='flex items-center justify-between border-b border-slate-800 p-4'>
          <h2 className='flex items-center gap-2 text-lg font-bold text-white'>
            <Share2
              size={18}
              className='text-blue-400'
            />
            Compartir Entrenamiento
          </h2>
          <button
            onClick={onClose}
            className='text-slate-400 hover:text-white'
          >
            <X size={20} />
          </button>
        </div>

        <div className='absolute left-0 top-0 -z-50 h-0 w-0 overflow-hidden opacity-0 pointer-events-none'>
          <SocialShareCard
            ref={cardRef}
            date={date}
            logs={logs}
            totalVolume={totalVolume}
            totalExercises={totalExercises}
            duration={duration}
          />
        </div>

        <div className='flex-1 overflow-y-auto bg-slate-950/50 p-6'>
          <WorkoutShareButton
            captureRef={cardRef}
            shareTitle='Mi Entrenamiento en FITTWIZ'
            shareText={shareText}
          />
        </div>
      </div>
    </div>
  );
};
