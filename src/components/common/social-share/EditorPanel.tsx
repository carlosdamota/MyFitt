import React from "react";
import { X, Check, LayoutGrid } from "lucide-react";
import { THEMES, STICKERS } from "./constants";
import { SidePanelTab } from "./types";
import { WorkoutImageFormat } from "../../../utils/generateWorkoutImage";

interface EditorPanelProps {
  tab: SidePanelTab;
  setTab: (tab: SidePanelTab) => void;
  themeKey: string;
  setThemeKey: (key: string) => void;
  format: WorkoutImageFormat;
  setFormat: (format: WorkoutImageFormat) => void;
  stickers: import("../../../utils/social-share/types").StickerData[];
  onAddSticker: (emoji: string) => void;
  onClearStickers: () => void;
  selectedId: string | null;
  onRemoveSticker: (id: string) => void;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  tab,
  setTab,
  themeKey,
  setThemeKey,
  format,
  setFormat,
  stickers,
  onAddSticker,
  onClearStickers,
  selectedId,
  onRemoveSticker,
}) => {
  if (!tab) return null;

  return (
    <div className='mt-2 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-3 animate-in fade-in slide-in-from-top-1 shadow-sm'>
      <div className='flex items-center justify-between mb-2'>
        <p className='text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold'>
          {tab === "theme" && "Selecciona un Tema"}
          {tab === "format" && "Selecciona Formato"}
          {tab === "sticker" && "Añade un Sticker"}
        </p>
        <button
          onClick={() => setTab(null)}
          className='text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-white transition-colors'
        >
          <X size={14} />
        </button>
      </div>

      {tab === "theme" && (
        <div
          className='overflow-x-auto py-2 -my-1 scrollbar-custom'
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <style>{`
            .scrollbar-custom::-webkit-scrollbar { height: 4px; }
            .scrollbar-custom::-webkit-scrollbar-track { background: transparent; }
            .scrollbar-custom::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
            .dark .scrollbar-custom::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
            .scrollbar-custom::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
            .dark .scrollbar-custom::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
          `}</style>
          <div className='flex gap-4 px-2 items-center w-max min-w-full'>
            {Object.entries(THEMES).map(([key, p]) => (
              <button
                key={key}
                onClick={() => setThemeKey(key)}
                className='flex flex-col items-center gap-1.5 shrink-0 group'
              >
                <div
                  className={`h-10 w-10 rounded-full border border-black/5 dark:border-white/10 transition-all duration-200 ${
                    themeKey === key
                      ? "ring-2 ring-slate-900 dark:ring-white scale-110 shadow-lg"
                      : "ring-1 ring-black/10 dark:ring-white/20 group-hover:ring-black/30 dark:group-hover:ring-white/50"
                  }`}
                  style={{
                    background: p.preview,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {themeKey === key && (
                    <div className='h-full w-full flex items-center justify-center bg-black/20 rounded-full'>
                      <Check
                        size={14}
                        className='text-white'
                      />
                    </div>
                  )}
                </div>
                <span
                  className={`text-[10px] ${
                    themeKey === key
                      ? "text-slate-900 dark:text-white font-medium"
                      : "text-slate-500"
                  }`}
                >
                  {p.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === "format" && (
        <div className='flex gap-2'>
          {(["feed", "story"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`flex-1 flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 transition-all ${
                format === f
                  ? "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/50 text-blue-600 dark:text-blue-400"
                  : "bg-slate-50 dark:bg-white/5 border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
              }`}
            >
              <LayoutGrid
                size={20}
                className={
                  format === f
                    ? "text-blue-500 dark:text-blue-400"
                    : "text-slate-400 dark:text-slate-500"
                }
              />
              <span className='text-xs font-medium'>
                {f === "feed" ? "Post (1:1)" : "Historia (4:5)"}
              </span>
            </button>
          ))}
        </div>
      )}

      {tab === "sticker" && (
        <div
          className='overflow-x-auto py-2 -my-1 scrollbar-custom'
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className='flex gap-3 px-2 items-center w-max min-w-full'>
            <button
              onClick={onClearStickers}
              disabled={stickers.length === 0}
              className={`shrink-0 flex items-center justify-center rounded-xl h-10 px-3 text-xs font-medium transition-all ${
                stickers.length === 0
                  ? "opacity-50 grayscale cursor-not-allowed bg-slate-100 dark:bg-white/5 text-slate-400"
                  : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20"
              }`}
            >
              <X
                size={14}
                className='mr-1'
              />{" "}
              Borrar todos
            </button>
            {selectedId && (
              <button
                onClick={() => onRemoveSticker(selectedId)}
                className='shrink-0 flex items-center justify-center rounded-xl h-10 px-3 text-xs font-medium transition-all bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20'
              >
                <X
                  size={14}
                  className='mr-1'
                />{" "}
                Borrar seleccionado
              </button>
            )}
            <div className='w-px h-6 bg-slate-200 dark:bg-white/10 mx-1' />
            {STICKERS.map((s) => (
              <button
                key={s}
                onClick={() => onAddSticker(s)}
                className='shrink-0 flex items-center justify-center rounded-xl h-10 w-10 text-xl transition-all bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 hover:scale-110 active:scale-95'
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
