import React, { useEffect, useState } from "react";
import { Check, ClipboardCopy, Download, Loader2, Share2 } from "lucide-react";
import { useShareWorkout } from "../../hooks/useShareWorkout";
import { useToast } from "../../hooks/useToast";
import type { WorkoutImageAsset, WorkoutImageFormat } from "../../utils/generateWorkoutImage";

interface WorkoutShareButtonProps {
  captureRef: React.RefObject<HTMLElement | null>;
  shareTitle: string;
  shareText: string;
  previewToken?: string;
  format?: WorkoutImageFormat;
}

export const WorkoutShareButton: React.FC<WorkoutShareButtonProps> = ({
  captureRef,
  shareTitle,
  shareText,
  previewToken,
  format = "feed",
}) => {
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
  // format is now controlled by the parent via props
  const [cachedAsset, setCachedAsset] = useState<WorkoutImageAsset | null>(null);
  const [copied, setCopied] = useState(false);
  const { success: showSuccess, error: showError } = useToast();

  const ensureAsset = async (mode: "preview" | "export" = "preview") => {
    if (!captureRef.current) return null;
    const image = await generate(captureRef.current, format, undefined, { mode });
    if (image) setCachedAsset(image);
    return image;
  };

  useEffect(() => {
    if (!captureRef.current) return;
    setCachedAsset(null);
    void ensureAsset("preview");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format, captureRef, previewToken]);

  const handleShare = async () => {
    const image = cachedAsset ?? (await ensureAsset("export"));
    if (!image) return;
    await share(image, { title: shareTitle, text: shareText });
  };

  const handleDownload = async () => {
    const image = cachedAsset ?? (await ensureAsset("export"));
    if (!image) return;
    download(image);
    showSuccess("Imagen descargada");
  };

  const handleCopy = async () => {
    const image = cachedAsset ?? (await ensureAsset("export"));
    if (!image) return;
    const result = await copyToClipboard(image);
    if (result === "copied") {
      setCopied(true);
      showSuccess("Imagen copiada al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    } else {
      showError("No se pudo copiar. Intenta descargar la imagen.");
    }
  };

  return (
    <div className='space-y-4'>
      {/* Preview */}
      <div className='relative overflow-hidden rounded-2xl ring-1 ring-white/10'>
        {previewImage ? (
          <img
            src={previewImage}
            alt='Preview del entrenamiento'
            className='w-full'
          />
        ) : (
          <div className='flex h-60 items-center justify-center bg-white/3 text-sm text-slate-500'>
            <div className='flex flex-col items-center gap-2'>
              <Loader2
                className='animate-spin text-blue-400'
                size={20}
              />
              <span className='text-xs'>Generando vista previa...</span>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && <p className='text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2'>{error}</p>}

      {/* Action buttons */}
      <div className='space-y-2'>
        {/* Primary CTA */}
        <button
          onClick={handleShare}
          disabled={isGenerating}
          className='flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-400 active:scale-[0.98] disabled:opacity-50'
        >
          {isGenerating ? (
            <Loader2
              className='animate-spin'
              size={16}
            />
          ) : (
            <Share2 size={16} />
          )}
          {capabilities.canShareFiles ? "Compartir" : "Descargar imagen"}
        </button>

        {/* Secondary actions */}
        <div className='grid grid-cols-2 gap-2'>
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className='flex items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-xs font-medium text-slate-300 ring-1 ring-white/10 transition-all hover:bg-white/10 active:scale-[0.98] disabled:opacity-50'
          >
            <Download size={14} />
            Descargar
          </button>
          <button
            onClick={handleCopy}
            disabled={isGenerating || !capabilities.canWriteClipboard}
            className='flex items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-xs font-medium text-slate-300 ring-1 ring-white/10 transition-all hover:bg-white/10 active:scale-[0.98] disabled:opacity-50'
          >
            {copied ? (
              <>
                <Check
                  size={14}
                  className='text-emerald-400'
                />
                <span className='text-emerald-400'>Copiado</span>
              </>
            ) : (
              <>
                <ClipboardCopy size={14} />
                Copiar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hint */}
      <p className='text-center text-[11px] text-slate-600'>
        {capabilities.canShareFiles
          ? "Comparte directo a Instagram, WhatsApp, X, y más"
          : "Descarga la imagen y compártela en tus redes"}
      </p>
    </div>
  );
};
