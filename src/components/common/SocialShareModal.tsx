import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X, Share2, Loader2 } from "lucide-react";
import { SocialShareCard } from "./SocialShareCard";
import type { WorkoutLogEntry } from "../../types";
import type { WorkoutImageFormat, WorkoutImageAsset } from "../../utils/generateWorkoutImage";
import { useShareWorkout } from "../../hooks/useShareWorkout";
import { useToast } from "../../hooks/useToast";

// Refactor: Modular imports
import { THEMES } from "./social-share/constants";
import { buildHashtags } from "./social-share/utils";
import { SidePanelTab } from "./social-share/types";
import { EditorPanel } from "./social-share/EditorPanel";
import { Toolbar } from "./social-share/Toolbar";
import { ActionButtons } from "./social-share/ActionButtons";

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
  const previewRef = useRef<HTMLDivElement>(null);

  /* editing state */
  const [themeKey, setThemeKey] = useState("dark");
  const [sticker, setSticker] = useState("");
  const [stickerPos, setStickerPos] = useState({ x: 80, y: 10 });
  const [format, setFormat] = useState<WorkoutImageFormat>("feed");
  const [tab, setTab] = useState<SidePanelTab>(null);
  const [isToolbarOpen, setIsToolbarOpen] = useState(true);

  /* drag state */
  const [dragging, setDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });
  const dragBounds = useRef({ left: 0, top: 0, width: 1, height: 1 });
  const frameRef = useRef<number | null>(null);
  const pendingPosRef = useRef<{ x: number; y: number } | null>(null);

  /* share logic */
  const {
    isGenerating,
    previewImage,
    error,
    capabilities,
    generate,
    share,
    download,
    copyToClipboard,
  } = useShareWorkout();

  const [asset, setAsset] = useState<WorkoutImageAsset | null>(null);
  const [copied, setCopied] = useState(false);
  const { success: toast$, error: toastErr } = useToast();

  const theme = THEMES[themeKey];
  const totalVolume = logs.reduce((s, l) => s + (l.volume || 0), 0);
  const totalExercises = logs.length;
  const totalReps = logs.reduce((s, l) => s + (l.sets ?? 0) * (l.reps ?? 0), 0);

  const hashtags = useMemo(() => buildHashtags(logs, totalExercises), [logs, totalExercises]);
  const shareText = useMemo(() => {
    const base =
      duration !== "N/A"
        ? `💪 He completado ${totalExercises} ejercicios en ${duration} con ${totalVolume}kg y ${totalReps} reps.`
        : `💪 He registrado ${totalExercises} ejercicios con ${totalVolume}kg de volumen y ${totalReps} reps.`;
    return `${base}\n\n${hashtags}`;
  }, [duration, totalExercises, totalVolume, totalReps, hashtags]);

  const fileNameBase = useMemo(() => {
    return `fittwiz-workout-${date}`;
  }, [date]);

  const token = `${themeKey}-${sticker || "·"}-${Math.round(stickerPos.x)}-${Math.round(stickerPos.y)}-${format}`;

  const ensureAsset = useCallback(
    async (mode: "preview" | "export" = "preview") => {
      if (!cardRef.current) return null;
      const img = await generate(cardRef.current, format, fileNameBase, { mode });
      if (img) setAsset(img);
      return img;
    },
    [generate, format, fileNameBase],
  );

  // Bloquear el scroll del body mientras el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (dragging) return;
    setAsset(null);
    void ensureAsset("preview");
  }, [token, isOpen, dragging]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const handleShare = async () => {
    const a = asset ?? (await ensureAsset("export"));
    if (!a) return;
    await share(a, { title: "Mi Entrenamiento en FITTWIZ", text: shareText });
  };

  const handleDownload = async () => {
    const a = asset ?? (await ensureAsset("export"));
    if (!a) return;
    download(a);
    toast$("Imagen descargada");
  };

  const handleCopy = async () => {
    const a = asset ?? (await ensureAsset("export"));
    if (!a) return;
    const r = await copyToClipboard(a);
    if (r === "copied") {
      setCopied(true);
      toast$("Copiada al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    } else toastErr("No se pudo copiar. Descarga la imagen.");
  };

  /* drag & drop logic */
  const onPtrDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    const r = previewRef.current!.getBoundingClientRect();
    dragBounds.current = {
      left: r.left,
      top: r.top,
      width: r.width,
      height: r.height,
    };
    offset.current = {
      x: e.clientX - r.left - (stickerPos.x / 100) * r.width,
      y: e.clientY - r.top - (stickerPos.y / 100) * r.height,
    };
  };

  const onPtrMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const r = dragBounds.current;
    const x = Math.max(2, Math.min(98, ((e.clientX - r.left - offset.current.x) / r.width) * 100));
    const y = Math.max(2, Math.min(98, ((e.clientY - r.top - offset.current.y) / r.height) * 100));
    pendingPosRef.current = { x, y };

    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      if (pendingPosRef.current) {
        setStickerPos(pendingPosRef.current);
      }
    });
  };

  const onPtrUp = () => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    if (pendingPosRef.current) {
      setStickerPos(pendingPosRef.current);
      pendingPosRef.current = null;
    }
    setDragging(false);
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 backdrop-blur-md'>
      <div className='flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0c0c14] shadow-2xl'>
        {/* ─── Header ─── */}
        <div className='flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-white/5'>
          <h2 className='flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white'>
            <div className='flex items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/15 p-1.5'>
              <Share2
                size={14}
                className='text-blue-600 dark:text-blue-400'
              />
            </div>
            Compartir Rutina
          </h2>
          <button
            onClick={onClose}
            className='flex items-center justify-center rounded-full bg-slate-200/50 dark:bg-white/5 p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white transition-all'
          >
            <X size={14} />
          </button>
        </div>

        {/* ─── Offscreen card ─── */}
        <div
          className='fixed -left-[9999px] top-0 pointer-events-none'
          aria-hidden='true'
        >
          <SocialShareCard
            ref={cardRef}
            date={date}
            logs={logs}
            totalVolume={totalVolume}
            totalExercises={totalExercises}
            totalReps={totalReps}
            duration={duration}
            theme={theme}
            format={format}
            sticker={sticker || null}
            stickerPosition={stickerPos}
          />
        </div>

        {/* ─── Main body ─── */}
        <div className='flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 space-y-4'>
          <div className='relative'>
            {/* Preview container */}
            <div
              ref={previewRef}
              className='overflow-hidden rounded-2xl ring-1 ring-slate-200 dark:ring-white/10 select-none bg-slate-100 dark:bg-[#1a1a24]'
              onPointerMove={onPtrMove}
              onPointerUp={onPtrUp}
            >
              {previewImage ? (
                <img
                  src={previewImage}
                  alt='Preview'
                  className='w-full pointer-events-none shadow-sm'
                  draggable={false}
                />
              ) : (
                <div className='flex h-72 items-center justify-center text-sm text-slate-500'>
                  <div className='flex flex-col items-center gap-3'>
                    <Loader2
                      className='animate-spin text-blue-500'
                      size={24}
                    />
                    <span className='text-xs font-medium tracking-wide'>Generando imagen...</span>
                  </div>
                </div>
              )}

              {sticker && previewImage && (
                <div
                  onPointerDown={onPtrDown}
                  className={`absolute text-4xl sm:text-5xl leading-none select-none transition-[filter] ${
                    dragging
                      ? "cursor-grabbing drop-shadow-[0_0_15px_rgba(59,130,246,.8)]"
                      : "cursor-grab drop-shadow-md"
                  }`}
                  style={{
                    left: `${stickerPos.x}%`,
                    top: `${stickerPos.y}%`,
                    transform: `translate(-50%, -50%) scale(${dragging ? 1.2 : 1})`,
                    touchAction: "none",
                    transition: dragging ? "none" : "transform .15s cubic-bezier(0.4, 0, 0.2, 1)",
                    zIndex: 15,
                  }}
                >
                  {sticker}
                </div>
              )}

              {sticker && previewImage && !dragging && (
                <div className='absolute top-3 inset-x-0 flex justify-center pointer-events-none z-20'>
                  <span className='rounded-full bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-white/70 shadow-lg'>
                    Arrastra el emoji para moverlo
                  </span>
                </div>
              )}
            </div>

            {/* ─── Floating side toolbar ─── */}
            <Toolbar
              tab={tab}
              setTab={setTab}
              isToolbarOpen={isToolbarOpen}
              setIsToolbarOpen={setIsToolbarOpen}
            />
          </div>

          {/* Expandable Editor Panel (Themes, Stickers, Format) */}
          <EditorPanel
            tab={tab}
            setTab={setTab}
            themeKey={themeKey}
            setThemeKey={setThemeKey}
            format={format}
            setFormat={setFormat}
            sticker={sticker}
            setSticker={setSticker}
            setStickerPos={setStickerPos}
          />

          {error && (
            <p className='text-xs text-red-400 bg-red-500/10 rounded-xl px-3 py-3 border border-red-500/20'>
              {error}
            </p>
          )}
        </div>

        <div className='p-4 sm:p-5 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0c0c14] shrink-0'>
          <ActionButtons
            handleShare={handleShare}
            handleDownload={handleDownload}
            handleCopy={handleCopy}
            isGenerating={isGenerating}
            canShareFiles={capabilities.canShareFiles}
            canWriteClipboard={capabilities.canWriteClipboard}
            copied={copied}
          />
          <p className='text-center text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-3'>
            {capabilities.canShareFiles
              ? "IG, WhatsApp, X, Tiktok..."
              : "Descarga y sube a tus redes"}
          </p>
        </div>
      </div>
    </div>
  );
};
