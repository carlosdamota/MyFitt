import React, { useRef } from "react";
import { Camera, X } from "lucide-react";
import ProUpgrade from "../common/ProUpgrade";

interface NutritionPhotoCaptureProps {
  disabled?: boolean;
  isPro: boolean;
  imagePreview: string | null;
  onPhotoSelected: (dataUrl: string, mimeType: string) => void;
  onClearPhoto: () => void;
  onUpgrade?: () => void;
}

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(file);
  });

const NutritionPhotoCapture: React.FC<NutritionPhotoCaptureProps> = ({
  disabled,
  isPro,
  imagePreview,
  onPhotoSelected,
  onClearPhoto,
  onUpgrade,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    if (!isPro) {
      onUpgrade?.();
      return;
    }
    inputRef.current?.click();
  };

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      onPhotoSelected(dataUrl, file.type || "image/jpeg");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div className='mt-3'>
      <input
        ref={inputRef}
        type='file'
        accept='image/*'
        capture='environment'
        onChange={handleChange}
        className='hidden'
        disabled={disabled || !isPro}
      />

      {!imagePreview ? (
        isPro ? (
          <button
            type='button'
            onClick={handleClick}
            disabled={disabled}
            className='inline-flex items-center gap-2 rounded-lg border border-indigo-500/40 bg-indigo-950/30 px-3 py-2 text-xs font-bold text-indigo-200 hover:bg-indigo-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <Camera size={14} />
            Foto al plato
          </button>
        ) : (
          <ProUpgrade
            mini
            context='nutrition_photo'
            buttonText='Foto al plato (Pro)'
            className='border-indigo-500/30 bg-indigo-900/10 text-indigo-300 hover:from-indigo-500/20 hover:to-purple-500/20'
          />
        )
      ) : (
        <div className='relative w-full max-w-[220px] rounded-xl overflow-hidden border border-indigo-500/30'>
          <img
            src={imagePreview}
            alt='Foto del plato'
            className='w-full h-32 object-cover'
          />
          <button
            type='button'
            onClick={onClearPhoto}
            className='absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-slate-800 transition-colors'
            aria-label='Quitar foto'
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default NutritionPhotoCapture;
