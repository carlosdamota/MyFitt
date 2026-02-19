import React, { useEffect, useState } from "react";
import {
  Download,
  Facebook,
  Instagram,
  Layers,
  Loader2,
  Palette,
  Share2,
  Smile,
  Smartphone,
  Twitter,
} from "lucide-react";
import { useShareWorkout } from "../../hooks/useShareWorkout";
import type { WorkoutImageAsset, WorkoutImageFormat } from "../../utils/generateWorkoutImage";

interface ThemeOption {
  key: string;
  label: string;
}

interface WorkoutShareButtonProps {
  captureRef: React.RefObject<HTMLElement | null>;
  shareTitle: string;
  shareText: string;
  previewToken?: string;
  themeOptions: ThemeOption[];
  selectedThemeKey: string;
  onThemeChange: (key: string) => void;
  stickerOptions: string[];
  selectedSticker: string;
  onStickerChange: (sticker: string) => void;
}

export const WorkoutShareButton: React.FC<WorkoutShareButtonProps> = ({
  captureRef,
  shareTitle,
  shareText,
  previewToken,
  themeOptions,
  selectedThemeKey,
  onThemeChange,
  stickerOptions,
  selectedSticker,
  onStickerChange,
}) => {
  const { isGenerating, previewImage, error, capabilities, generate, share, download } =
    useShareWorkout();
  const [format, setFormat] = useState<WorkoutImageFormat>("feed");
  const [cachedAsset, setCachedAsset] = useState<WorkoutImageAsset | null>(null);
  const [activeMenu, setActiveMenu] = useState<"format" | "theme" | "sticker" | null>(null);

  const ensureAsset = async () => {
    if (!captureRef.current) return null;
    const image = await generate(captureRef.current, format);
    if (image) setCachedAsset(image);
    return image;
  };

  useEffect(() => {
    if (!captureRef.current) return;
    void ensureAsset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format, captureRef, previewToken]);

  const handleShare = async () => {
    const image = cachedAsset ?? (await ensureAsset());
    if (!image) return;
    await share(image, { title: shareTitle, text: shareText });
  };

  const handleDownload = async () => {
    const image = cachedAsset ?? (await ensureAsset());
    if (!image) return;
    download(image);
  };

  const openSocialShare = (platform: "instagram" | "facebook" | "x") => {
    const pageUrl = window.location.href;
    const message = `${shareTitle}\n${shareText}`;

    if (platform === "instagram") {
      alert("Instagram no permite publicar directo desde web. Usa el icono de descarga y sube la imagen en la app.");
      return;
    }

    const targetUrl =
      platform === "facebook"
        ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}&quote=${encodeURIComponent(message)}`
        : `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(pageUrl)}`;

    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <p className='text-xs text-slate-400'>Vista previa editable</p>

        <div className='relative overflow-hidden rounded-xl border border-slate-800'>
          {previewImage ? (
            <img
              src={previewImage}
              alt='Workout share preview'
              className='w-full'
            />
          ) : (
            <div className='flex h-64 items-center justify-center bg-slate-900 text-sm text-slate-500'>
              Generando vista previa...
            </div>
          )}

          <div className='absolute right-3 top-3 flex flex-col gap-2.5'>
            <button
              onClick={() => setActiveMenu((prev) => (prev === "format" ? null : "format"))}
              className='rounded-full border border-white/20 bg-black/45 p-3 text-white shadow-lg backdrop-blur-md transition-colors hover:bg-black/60'
              title='Formato'
            >
              <Layers size={20} />
            </button>
            <button
              onClick={() => setActiveMenu((prev) => (prev === "theme" ? null : "theme"))}
              className='rounded-full border border-white/20 bg-black/45 p-3 text-white shadow-lg backdrop-blur-md transition-colors hover:bg-black/60'
              title='Tema'
            >
              <Palette size={20} />
            </button>
            <button
              onClick={() => setActiveMenu((prev) => (prev === "sticker" ? null : "sticker"))}
              className='rounded-full border border-white/20 bg-black/45 p-3 text-white shadow-lg backdrop-blur-md transition-colors hover:bg-black/60'
              title='Sticker'
            >
              <Smile size={20} />
            </button>
          </div>

          {activeMenu && (
            <div className='absolute inset-x-2 bottom-2 rounded-xl border border-slate-700 bg-black/75 p-2 backdrop-blur'>
              {activeMenu === "format" && (
                <div className='flex gap-2'>
                  <button
                    onClick={() => {
                      setCachedAsset(null);
                      setFormat("feed");
                    }}
                    className={`flex-1 rounded-lg px-3 py-2 text-xs ${
                      format === "feed" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    Feed
                  </button>
                  <button
                    onClick={() => {
                      setCachedAsset(null);
                      setFormat("story");
                    }}
                    className={`flex-1 rounded-lg px-3 py-2 text-xs ${
                      format === "story" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    Story
                  </button>
                </div>
              )}

              {activeMenu === "theme" && (
                <div className='flex gap-2 overflow-x-auto'>
                  {themeOptions.map((theme) => (
                    <button
                      key={theme.key}
                      onClick={() => onThemeChange(theme.key)}
                      className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs ${
                        selectedThemeKey === theme.key
                          ? "bg-blue-600 text-white"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {theme.label}
                    </button>
                  ))}
                </div>
              )}

              {activeMenu === "sticker" && (
                <div className='flex gap-2 overflow-x-auto'>
                  {stickerOptions.map((item) => (
                    <button
                      key={item || "none"}
                      onClick={() => onStickerChange(item)}
                      className={`rounded-lg px-3 py-2 text-xs ${
                        selectedSticker === item ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {item || "Sin"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {error && <p className='text-xs text-red-400'>{error}</p>}

      <div className='grid grid-cols-5 gap-2'>
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          title='Descargar'
          className='flex items-center justify-center rounded-xl bg-slate-800 py-3 text-white disabled:opacity-50'
        >
          {isGenerating ? <Loader2 className='animate-spin' size={16} /> : <Download size={16} />}
        </button>
        <button
          onClick={() => openSocialShare("instagram")}
          title='Instagram'
          className='flex items-center justify-center rounded-xl bg-slate-800 py-3 text-white'
        >
          <Instagram size={16} />
        </button>
        <button
          onClick={() => openSocialShare("facebook")}
          title='Facebook'
          className='flex items-center justify-center rounded-xl bg-slate-800 py-3 text-white'
        >
          <Facebook size={16} />
        </button>
        <button
          onClick={() => openSocialShare("x")}
          title='X / Twitter'
          className='flex items-center justify-center rounded-xl bg-slate-800 py-3 text-white'
        >
          <Twitter size={16} />
        </button>
        <button
          onClick={handleShare}
          disabled={isGenerating}
          title='Compartir en otras apps'
          className='flex items-center justify-center rounded-xl bg-blue-600 py-3 text-white disabled:opacity-50'
        >
          {isGenerating ? <Loader2 className='animate-spin' size={16} /> : <Share2 size={16} />}
        </button>
      </div>

      <p className='flex items-center gap-2 text-xs text-slate-500'>
        <Smartphone size={14} />
        {capabilities.canShareFiles
          ? "Puedes compartir directo en apps compatibles."
          : "Si tu navegador no soporta compartir archivos, se descargará la imagen."}
      </p>
    </div>
  );
};
