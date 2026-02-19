import React, { useMemo, useRef, useState } from "react";
import { X, Share2 } from "lucide-react";
import { SocialShareCard, type ShareCardTheme } from "./SocialShareCard";
import { WorkoutShareButton } from "./WorkoutShareButton";
import type { WorkoutLogEntry } from "../../types";

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  logs: (WorkoutLogEntry & { exercise: string; volume: number })[];
  duration?: string;
}

const THEME_PRESETS: Record<string, ShareCardTheme> = {
  default: {
    backgroundColor: "#121212",
    primaryTextColor: "#ffffff",
    secondaryTextColor: "#71717a",
    accentColor: "#3b82f6",
  },
  cobalt: {
    backgroundColor: "#0a1023",
    primaryTextColor: "#f8fafc",
    secondaryTextColor: "#93c5fd",
    accentColor: "#38bdf8",
  },
  sunset: {
    backgroundColor: "#2b0a0f",
    primaryTextColor: "#fff7ed",
    secondaryTextColor: "#fdba74",
    accentColor: "#fb7185",
  },
};

const STICKERS = ["", "🔥", "💪", "⚡", "🏆", "🚀", "😤"];

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  date,
  logs,
  duration = "N/A",
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [presetKey, setPresetKey] = useState<keyof typeof THEME_PRESETS>("default");
  const [sticker, setSticker] = useState<string>("");

  if (!isOpen) return null;

  const theme = THEME_PRESETS[presetKey];
  const totalVolume = logs.reduce((acc, log) => acc + (log.volume || 0), 0);
  const totalExercises = logs.length;

  const shareText = useMemo(() => {
    if (duration !== "N/A") {
      return `He completado un entrenamiento de ${totalExercises} ejercicios en ${duration} con ${totalVolume}kg de volumen.`;
    }
    return `He registrado ${totalExercises} ejercicios con ${totalVolume}kg de volumen total.`;
  }, [duration, totalExercises, totalVolume]);

  const previewToken = `${presetKey}-${sticker || "none"}`;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm'>
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
            theme={theme}
            sticker={sticker || null}
          />
        </div>

        <div className='flex-1 space-y-4 overflow-y-auto bg-slate-950/50 p-6'>
          <div className='rounded-xl border border-slate-800 bg-slate-900/50 p-4'>
            <p className='mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400'>Apariencia</p>
            <div className='grid grid-cols-2 gap-3'>
              <label className='space-y-1'>
                <span className='text-xs text-slate-400'>Preset</span>
                <select
                  value={presetKey}
                  onChange={(event) => setPresetKey(event.target.value as keyof typeof THEME_PRESETS)}
                  className='w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white'
                >
                  <option value='default'>Default Dark</option>
                  <option value='cobalt'>Cobalt Night</option>
                  <option value='sunset'>Sunset Punch</option>
                </select>
              </label>

              <label className='space-y-1'>
                <span className='text-xs text-slate-400'>Sticker/Emoji</span>
                <select
                  value={sticker}
                  onChange={(event) => setSticker(event.target.value)}
                  className='w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white'
                >
                  {STICKERS.map((item) => (
                    <option
                      key={item || "none"}
                      value={item}
                    >
                      {item || "Sin sticker"}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <WorkoutShareButton
            captureRef={cardRef}
            shareTitle='Mi Entrenamiento en FITTWIZ'
            shareText={shareText}
            previewToken={previewToken}
          />
        </div>
      </div>
    </div>
  );
};
