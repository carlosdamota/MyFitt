import React, { useMemo, useState } from "react";
import { Download, Loader2, Share2, Smartphone } from "lucide-react";
import { useShareWorkout } from "../../hooks/useShareWorkout";
import type { WorkoutImageFormat } from "../../utils/generateWorkoutImage";

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

  const formatLabel = useMemo(
    () => ({
      feed: "Instagram Feed (1080x1350)",
      story: "Stories / TikTok (1080x1920)",
    }),
    [],
  );

  const ensureAsset = async () => {
    if (!captureRef.current) return null;
    return generate(captureRef.current, format);
  };

  const handleShare = async () => {
    const image = await ensureAsset();
    if (!image) return;
    await share(image, { title: shareTitle, text: shareText });
  };

  const handleDownload = async () => {
    const image = await ensureAsset();
    if (!image) return;
    download(image);
  };

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <label className='text-sm text-slate-300'>Formato</label>
        <select
          value={format}
          onChange={(event) => setFormat(event.target.value as WorkoutImageFormat)}
          className='w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white'
        >
          <option value='feed'>{formatLabel.feed}</option>
          <option value='story'>{formatLabel.story}</option>
        </select>
      </div>

      {previewImage && (
        <div className='space-y-2'>
          <p className='text-xs text-slate-400'>Preview</p>
          <img
            src={previewImage}
            alt='Workout share preview'
            className='w-full rounded-xl border border-slate-800'
          />
        </div>
      )}

      {error && <p className='text-xs text-red-400'>{error}</p>}

      <div className='grid grid-cols-2 gap-3'>
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className='flex items-center justify-center gap-2 rounded-xl bg-slate-800 py-3 text-white disabled:opacity-50'
        >
          {isGenerating ? <Loader2 className='animate-spin' size={16} /> : <Download size={16} />}
          Descargar
        </button>
        <button
          onClick={handleShare}
          disabled={isGenerating}
          className='flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white disabled:opacity-50'
        >
          {isGenerating ? <Loader2 className='animate-spin' size={16} /> : <Share2 size={16} />}
          Compartir
        </button>
      </div>

      <p className='flex items-center gap-2 text-xs text-slate-500'>
        <Smartphone size={14} />
        {capabilities.canShareFiles
          ? "Tu dispositivo soporta compartir con apps nativas."
          : "Se usará descarga automática como fallback."}
      </p>
    </div>
  );
};
