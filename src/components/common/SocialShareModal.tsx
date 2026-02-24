import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  X,
  Share2,
  Check,
  ClipboardCopy,
  Download,
  Loader2,
  Palette,
  LayoutGrid,
  Smile,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { SocialShareCard, type ShareCardTheme } from "./SocialShareCard";
import type { WorkoutLogEntry } from "../../types";
import type { WorkoutImageFormat, WorkoutImageAsset } from "../../utils/generateWorkoutImage";
import { useShareWorkout } from "../../hooks/useShareWorkout";
import { useToast } from "../../hooks/useToast";

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  logs: (WorkoutLogEntry & { exercise: string; volume: number })[];
  duration?: string;
}

/* ── Theme presets ── */
const THEMES: Record<string, ShareCardTheme & { preview: string; label: string }> = {
  dark: {
    backgroundColor: "#121212",
    primaryTextColor: "#fff",
    secondaryTextColor: "#71717a",
    accentColor: "#3b82f6",
    preview: "linear-gradient(135deg,#121212,#1e293b)",
    label: "Dark",
  },
  cobalt: {
    backgroundColor: "#0a1023",
    primaryTextColor: "#f8fafc",
    secondaryTextColor: "#93c5fd",
    accentColor: "#38bdf8",
    preview: "linear-gradient(135deg,#0a1023,#1e3a5f)",
    label: "Cobalt",
  },
  sunset: {
    backgroundColor: "#2b0a0f",
    primaryTextColor: "#fff7ed",
    secondaryTextColor: "#fdba74",
    accentColor: "#fb7185",
    preview: "linear-gradient(135deg,#2b0a0f,#4c1d2d)",
    label: "Sunset",
  },
  emerald: {
    backgroundColor: "#0a1f1a",
    primaryTextColor: "#ecfdf5",
    secondaryTextColor: "#6ee7b7",
    accentColor: "#34d399",
    preview: "linear-gradient(135deg,#0a1f1a,#064e3b)",
    label: "Emerald",
  },
  violet: {
    backgroundColor: "#1a0a2e",
    primaryTextColor: "#faf5ff",
    secondaryTextColor: "#c4b5fd",
    accentColor: "#a78bfa",
    preview: "linear-gradient(135deg,#1a0a2e,#3b1f6e)",
    label: "Violet",
  },
};

const STICKERS = [
  "🔥",
  "💪",
  "⚡",
  "🏆",
  "🚀",
  "😤",
  "🎯",
  "👊",
  "🫡",
  "✨",
  "🦍",
  "🏋️‍♂️",
  "💦",
  "📈",
  "👑",
  "🔋",
  "🦾",
  "🤯",
  "🥵",
  "✅",
  "🎉",
  "🤝",
  "💯",
  "😎",
  "💪🏽",
  "🍎",
  "🥩",
  "🥞",
  "💊",
];

type SidePanelTab = "theme" | "format" | "sticker" | null;

function buildHashtags(logs: { exercise: string }[], n: number): string {
  const tags = new Set(["#FITTWIZ", "#workout", "#fitness"]);
  const names = logs.map((l) => l.exercise.toLowerCase());
  (
    [
      [["press", "pecho", "bench", "chest"], "#chestday"],
      [["sentadilla", "squat", "pierna", "leg"], "#legday"],
      [["espalda", "remo", "pull", "dorsal", "back"], "#backday"],
      [["hombro", "shoulder", "militar"], "#shoulderday"],
      [["bicep", "curl", "brazo", "arm", "tricep"], "#armday"],
      [["peso muerto", "deadlift", "hip thrust"], "#glutes"],
    ] as [string[], string][]
  ).forEach(([t, tag]) => {
    if (names.some((n) => t.some((k) => n.includes(k)))) tags.add(tag);
  });
  if (n >= 6) tags.add("#fullbody");
  return [...tags].join(" ");
}

/* ══════════════════════════════════════════════════════════ */

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  date,
  logs,
  duration = "N/A",
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  /* editing */
  const [themeKey, setThemeKey] = useState("dark");
  const [sticker, setSticker] = useState("");
  const [stickerPos, setStickerPos] = useState({ x: 80, y: 10 });
  const [format, setFormat] = useState<WorkoutImageFormat>("feed");
  const [tab, setTab] = useState<SidePanelTab>(null);
  const [isToolbarOpen, setIsToolbarOpen] = useState(true);

  /* drag */
  const [dragging, setDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });

  /* share */
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
  const hashtags = useMemo(() => buildHashtags(logs, totalExercises), [logs, totalExercises]);
  const shareText = useMemo(() => {
    const base =
      duration !== "N/A"
        ? `💪 He completado ${totalExercises} ejercicios en ${duration} con ${totalVolume}kg.`
        : `💪 He registrado ${totalExercises} ejercicios con ${totalVolume}kg de volumen.`;
    return `${base}\n\n${hashtags}`;
  }, [duration, totalExercises, totalVolume, hashtags]);

  const token = `${themeKey}-${sticker || "·"}-${Math.round(stickerPos.x)}-${Math.round(stickerPos.y)}-${format}`;

  const ensureAsset = useCallback(async () => {
    if (!cardRef.current) return null;
    const img = await generate(cardRef.current, format);
    if (img) setAsset(img);
    return img;
  }, [generate, format]);

  useEffect(() => {
    if (!isOpen) return;
    setAsset(null);
    void ensureAsset();
  }, [token, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Bloquear scroll del body cuando el modal está abierto
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

  const handleShare = async () => {
    const a = asset ?? (await ensureAsset());
    if (!a) return;
    await share(a, { title: "Mi Entrenamiento en FITTWIZ", text: shareText });
  };
  const handleDownload = async () => {
    const a = asset ?? (await ensureAsset());
    if (!a) return;
    download(a);
    toast$("Imagen descargada");
  };
  const handleCopy = async () => {
    const a = asset ?? (await ensureAsset());
    if (!a) return;
    const r = await copyToClipboard(a);
    if (r === "copied") {
      setCopied(true);
      toast$("Copiada al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    } else toastErr("No se pudo copiar. Descarga la imagen.");
  };

  /* drag & drop */
  const onPtrDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    const r = previewRef.current!.getBoundingClientRect();
    offset.current = {
      x: e.clientX - r.left - (stickerPos.x / 100) * r.width,
      y: e.clientY - r.top - (stickerPos.y / 100) * r.height,
    };
  };
  const onPtrMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const r = previewRef.current!.getBoundingClientRect();
    const x = Math.max(2, Math.min(98, ((e.clientX - r.left - offset.current.x) / r.width) * 100));
    const y = Math.max(2, Math.min(98, ((e.clientY - r.top - offset.current.y) / r.height) * 100));
    setStickerPos({ x, y });
  };
  const onPtrUp = () => setDragging(false);

  if (!isOpen) return null;

  /* ─── Expandable Bottom Panel ─── */
  const BottomPanel = () => {
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

  /* ─── Toolbar pill buttons ─── */
  const toolButtons: { id: SidePanelTab; icon: React.ReactNode; label: string }[] = [
    { id: "theme", icon: <Palette size={22} />, label: "Tema" },
    { id: "format", icon: <LayoutGrid size={22} />, label: "Formato" },
    { id: "sticker", icon: <Smile size={22} />, label: "Sticker" },
  ];

  return (
    <div className='fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 dark:bg-black/80 backdrop-blur-md'>
      <div className='flex max-h-[95vh] sm:max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0c0c14] shadow-2xl'>
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
            duration={duration}
            theme={theme}
            sticker={sticker || null}
            stickerPosition={stickerPos}
          />
        </div>

        {/* ─── Main body ─── */}
        <div className='flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 space-y-4'>
          {/* Preview + side toolbar wrapper */}
          <div className='relative'>
            {/* Preview container */}
            <div
              ref={previewRef}
              className='overflow-hidden rounded-2xl ring-1 ring-slate-200 dark:ring-white/10 select-none bg-slate-100 dark:bg-[#1a1a24]'
              style={{ touchAction: "none" }}
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

              {/* Draggable sticker */}
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

              {/* Drag hint */}
              {sticker && previewImage && !dragging && (
                <div className='absolute top-3 inset-x-0 flex justify-center pointer-events-none z-20'>
                  <span className='rounded-full bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-white/70 shadow-lg'>
                    Arrastra el emoji para moverlo
                  </span>
                </div>
              )}
            </div>

            {/* ─── Floating side toolbar ─── */}
            <div
              className={`absolute -right-4 inset-y-0 flex flex-col justify-center pointer-events-none z-20 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                isToolbarOpen ? "-translate-x-4" : "translate-x-full"
              }`}
            >
              <div className='relative flex flex-col gap-3 rounded-l-3xl border-y border-l border-slate-300/50 dark:border-white/10 bg-slate-200/50 dark:bg-black/20 backdrop-blur-sm p-3 pointer-events-auto shadow-[-10px_0_30px_-10px_rgba(0,0,0,0.1)] dark:shadow-[-10px_0_30px_-10px_rgba(0,0,0,0.5)]'>
                {/* ─── Collapse Toggle ─── */}
                <button
                  onClick={() => setIsToolbarOpen((prev) => !prev)}
                  className='absolute top-1/2 -translate-y-1/2 -left-6 w-6 h-14 flex flex-col items-center justify-center bg-slate-200/50 dark:bg-black/30 backdrop-blur-sm border-y border-l border-slate-300/50 dark:border-white/10 rounded-l-xl text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white transition-colors shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.05)] dark:shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.3)] group'
                >
                  <div className='transition-transform duration-300 group-hover:scale-110'>
                    {isToolbarOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                  </div>
                </button>
                {toolButtons.map(({ id, icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setTab(tab === id ? null : id)}
                    title={label}
                    className={`flex items-center justify-center rounded-2xl h-12 w-12 transition-all ${
                      tab === id
                        ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                        : "text-white/50 bg-black/10 hover:bg-black/30 hover:text-white"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Expandable Bottom Panel */}
          <BottomPanel />

          {error && (
            <p className='text-xs text-red-400 bg-red-500/10 rounded-xl px-3 py-3 border border-red-500/20'>
              {error}
            </p>
          )}

          {/* ─── Action buttons ─── */}
          <div className='space-y-2 pt-2'>
            <button
              onClick={handleShare}
              disabled={isGenerating}
              className='flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 dark:hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 transition-all'
            >
              {isGenerating ? (
                <Loader2
                  className='animate-spin'
                  size={18}
                />
              ) : (
                <Share2 size={18} />
              )}
              {capabilities.canShareFiles ? "Compartir" : "Guardar y Compartir"}
            </button>
            <div className='grid grid-cols-2 gap-2'>
              <button
                onClick={handleDownload}
                disabled={isGenerating}
                className='flex items-center justify-center gap-2 rounded-xl bg-slate-200/50 dark:bg-white/5 px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-white/10 hover:bg-slate-200 dark:hover:bg-white/10 active:scale-[0.98] disabled:opacity-50 transition-all'
              >
                <Download size={14} /> Descargar
              </button>
              <button
                onClick={handleCopy}
                disabled={isGenerating || !capabilities.canWriteClipboard}
                className='flex items-center justify-center gap-2 rounded-xl bg-slate-200/50 dark:bg-white/5 px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-white/10 hover:bg-slate-200 dark:hover:bg-white/10 active:scale-[0.98] disabled:opacity-50 transition-all'
              >
                {copied ? (
                  <>
                    <Check
                      size={14}
                      className='text-emerald-500 dark:text-emerald-400'
                    />
                    <span className='text-emerald-500 dark:text-emerald-400'>Copiado</span>
                  </>
                ) : (
                  <>
                    <ClipboardCopy size={14} /> Copiar
                  </>
                )}
              </button>
            </div>
          </div>

          <p className='text-center text-[10px] uppercase font-bold tracking-widest text-slate-600 pb-1'>
            {capabilities.canShareFiles
              ? "IG, WhatsApp, X, Tiktok..."
              : "Descarga y sube a tus redes"}
          </p>
        </div>
      </div>
    </div>
  );
};
