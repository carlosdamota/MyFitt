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
  sticker: string;
  setSticker: (sticker: string) => void;
  setStickerPos: (pos: { x: number; y: number }) => void;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  tab,
  setTab,
  themeKey,
  setThemeKey,
  format,
  setFormat,
  sticker,
  setSticker,
  setStickerPos,
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
                  className={`h-10 w-10 rounded-full transition-all duration-200 ${
                    themeKey === key
                      ? "ring-2 ring-slate-900 dark:ring-white scale-110 shadow-lg"
                      : "ring-1 ring-black/10 dark:ring-white/20 group-hover:ring-black/30 dark:group-hover:ring-white/50"
                  }`}
                  style={{ background: p.preview }}
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
              onClick={() => setSticker("")}
              className={`shrink-0 flex items-center justify-center rounded-xl h-10 px-3 text-xs font-medium transition-all ${
                !sticker
                  ? "bg-slate-800 text-white dark:bg-white/20"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
              }`}
            >
              <X
                size={14}
                className='mr-1'
              />{" "}
              Sin emoji
            </button>
            {STICKERS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSticker(s);
                  if (!sticker) setStickerPos({ x: 80, y: 10 });
                }}
                className={`shrink-0 flex items-center justify-center rounded-xl h-10 w-10 text-xl transition-all ${
                  sticker === s
                    ? "bg-blue-100 dark:bg-blue-500/25 ring-1 ring-blue-400 scale-110 shadow-lg shadow-blue-500/20"
                    : "bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10"
                }`}
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
