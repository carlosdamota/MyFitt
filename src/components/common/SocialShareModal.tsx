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

const THEME_OPTIONS = [
  { key: "default", label: "Default" },
  { key: "cobalt", label: "Cobalt" },
  { key: "sunset", label: "Sunset" },
];

const STICKERS = ["", "🔥", "💪", "⚡", "🏆", "🚀", "😤"];
const STICKER_POSITIONS = ["top-left", "top-right", "bottom-left", "bottom-right"] as const;

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
  const [stickerPosition, setStickerPosition] =
    useState<(typeof STICKER_POSITIONS)[number]>("top-left");

  const theme = THEME_PRESETS[presetKey];
  const totalVolume = logs.reduce((acc, log) => acc + (log.volume || 0), 0);
  const totalExercises = logs.length;

  const shareText = useMemo(() => {
    if (duration !== "N/A") {
      return `He completado un entrenamiento de ${totalExercises} ejercicios en ${duration} con ${totalVolume}kg de volumen.`;
    }
    return `He registrado ${totalExercises} ejercicios con ${totalVolume}kg de volumen total.`;
  }, [duration, totalExercises, totalVolume]);

  const previewToken = `${presetKey}-${sticker || "none"}-${stickerPosition}`;

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/80 p-4 backdrop-blur-sm transition-colors'>
      <div className='flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-surface-800 bg-white dark:bg-surface-950 shadow-xl dark:shadow-2xl transition-colors'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-slate-200 dark:border-surface-800 bg-white dark:bg-surface-950 px-4 py-3 transition-colors'>
          <h2 className='flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white transition-colors'>
            <Share2
              size={18}
              className='text-blue-400'
            />
            Compartir Entrenamiento
          </h2>
          <button
            onClick={onClose}
            className='text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors'
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
            stickerPosition={stickerPosition}
          />
        </div>

        <div className='flex-1 space-y-4 overflow-y-auto bg-slate-50 dark:bg-surface-950/50 p-6 transition-colors'>
          <WorkoutShareButton
            captureRef={cardRef}
            shareTitle='Mi Entrenamiento en FITTWIZ'
            shareText={shareText}
            previewToken={previewToken}
            themeOptions={THEME_OPTIONS}
            selectedThemeKey={presetKey}
            onThemeChange={(key) => setPresetKey(key as keyof typeof THEME_PRESETS)}
            stickerOptions={STICKERS}
            selectedSticker={sticker}
            onStickerChange={setSticker}
            stickerPositionOptions={Array.from(STICKER_POSITIONS)}
            selectedStickerPosition={stickerPosition}
            onStickerPositionChange={(position) =>
              setStickerPosition(position as (typeof STICKER_POSITIONS)[number])
            }
          />
        </div>
      </div>
    </div>
  );
};
