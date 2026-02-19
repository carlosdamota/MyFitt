import React, { useEffect, useMemo, useState } from "react";
import { Download, Facebook, Instagram, Loader2, Share2, Smartphone, Twitter } from "lucide-react";
import { useShareWorkout } from "../../hooks/useShareWorkout";
import type { WorkoutImageAsset, WorkoutImageFormat } from "../../utils/generateWorkoutImage";

interface WorkoutShareButtonProps {
  captureRef: React.RefObject<HTMLElement | null>;
  shareTitle: string;
  shareText: string;
}

export const WorkoutShareButton: React.FC<WorkoutShareButtonProps> = ({
  captureRef,
  shareTitle,
  shareText,
}) => {
  const { isGenerating, previewImage, error, capabilities, generate, share, download } =
    useShareWorkout();
  const [format, setFormat] = useState<WorkoutImageFormat>("feed");
  const [cachedAsset, setCachedAsset] = useState<WorkoutImageAsset | null>(null);

  const formatLabel = useMemo(
    () => ({
      feed: "Instagram Feed (1080x1350)",
      story: "Stories / TikTok (1080x1920)",
    }),
    [],
  );

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
  }, [format, captureRef]);

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
      // Instagram web doesn't accept direct prefilled post text/images.
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
        <label className='text-sm text-slate-300'>Formato</label>
        <select
          value={format}
          onChange={(event) => {
            setCachedAsset(null);
            setFormat(event.target.value as WorkoutImageFormat);
          }}
          className='w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white'
        >
          <option value='feed'>{formatLabel.feed}</option>
          <option value='story'>{formatLabel.story}</option>
        </select>
      </div>

      {previewImage && (
        <div className='space-y-2'>
          <p className='text-xs text-slate-400'>Vista previa de la card seleccionada</p>
          <img
            src={previewImage}
            alt='Workout share preview'
            className='w-full rounded-xl border border-slate-800'
          />
        </div>
      )}

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
