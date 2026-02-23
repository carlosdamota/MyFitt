import React, { useState } from "react";
import { Sparkles, Loader, Plus } from "lucide-react";
import { parseNutritionLog } from "../../api/gemini";
import { logEvent } from "../../utils/analytics";
import RateLimitError from "../errors/RateLimitError";
import type { User as FirebaseUser } from "firebase/auth";
import { AiError } from "../../api/ai";
import { useEntitlement } from "../../hooks/useEntitlement";
import NutritionPhotoCapture from "./NutritionPhotoCapture";

interface NutritionAILoggerProps {
  user: FirebaseUser | null;
  onAddLog: (data: any) => Promise<boolean>;
  onRequireAuth?: () => void;
}

const NutritionAILogger: React.FC<NutritionAILoggerProps> = ({ user, onAddLog, onRequireAuth }) => {
  const [input, setInput] = useState<string>("");
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showRateLimitError, setShowRateLimitError] = useState<boolean>(false);
  const [quotaResetAt, setQuotaResetAt] = useState<string | null>(null);
  const [quotaMessage, setQuotaMessage] = useState<string>("Límite de IA alcanzado");
  const [imageData, setImageData] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const { plan } = useEntitlement(user);
  const isPro = plan === "pro";

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!input.trim() && !imageData) return;

    if (!user) {
      setError("Inicia sesión para usar la IA de nutrición.");
      onRequireAuth?.();
      return;
    }

    setAnalyzing(true);
    setError(null);
    setQuotaMessage("Límite de IA alcanzado");
    setQuotaResetAt(null);

    try {
      const nutritionData = await parseNutritionLog(
        input,
        imageData && isPro
          ? {
              data: imageData,
              mimeType: imageMimeType || undefined,
            }
          : undefined,
      );
      if (nutritionData) {
        await onAddLog(nutritionData);
        logEvent("Nutrition", "Logged with AI", nutritionData.food);
        setInput("");
        setImageData(null);
        setImageMimeType(null);
      } else {
        setError("No se pudo entender el alimento. Intente ser más específico.");
      }
    } catch (err) {
      if (err instanceof AiError && err.code === "quota_exceeded") {
        setQuotaMessage(err.message);
        setQuotaResetAt(err.resetAt ?? null);
        setShowRateLimitError(true);
      } else if (err instanceof AiError && err.code === "auth_required") {
        setError(err.message);
        onRequireAuth?.();
      } else {
        setError((err as Error).message);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className='bg-white dark:bg-surface-900 rounded-3xl border border-slate-200 dark:border-surface-800 p-5 shadow-sm transition-colors'>
      {showRateLimitError && (
        <RateLimitError
          message={quotaMessage}
          resetAt={quotaResetAt}
          onClose={() => setShowRateLimitError(false)}
          upgradeContext='nutrition_photo'
          isPro={isPro}
        />
      )}

      <h3 className='text-xs font-bold text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-indigo-400 uppercase mb-3 flex items-center gap-2 tracking-widest'>
        <Sparkles
          size={16}
          className='text-cyan-400 animate-pulse'
        />{" "}
        Log Rápido con IA
      </h3>
      <form
        onSubmit={handleSubmit}
        className='relative group flex flex-col gap-3 mb-1'
      >
        <div className='relative w-full'>
          <input
            type='text'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Ej: 2 huevos revueltos y una manzana'
            className='w-full bg-slate-50 dark:bg-surface-950 border border-slate-200 dark:border-surface-800 rounded-2xl py-3.5 pl-4 pr-12 text-sm text-slate-800 dark:text-slate-200 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none placeholder-slate-400 dark:placeholder-slate-500 transition-all shadow-sm dark:shadow-inner'
            disabled={analyzing}
          />
          <button
            type='submit'
            disabled={analyzing || (!input.trim() && !imageData)}
            className='absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-linear-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white rounded-xl transition-all disabled:opacity-50 disabled:from-surface-800 disabled:to-surface-800 disabled:text-slate-500 shadow-md active:scale-95'
          >
            {analyzing ? (
              <Loader
                size={18}
                className='animate-spin'
              />
            ) : (
              <Plus size={18} />
            )}
          </button>
        </div>
      </form>

      <NutritionPhotoCapture
        disabled={analyzing}
        isPro={isPro}
        imagePreview={imageData}
        onPhotoSelected={(dataUrl, mimeType) => {
          setImageData(dataUrl);
          setImageMimeType(mimeType);
          setError(null);
        }}
        onClearPhoto={() => {
          setImageData(null);
          setImageMimeType(null);
        }}
      />

      {error && (
        <p className='text-xs text-red-500 mt-2 font-medium flex items-center gap-1.5'>
          <span className='w-1 h-1 bg-red-500 rounded-full' /> {error}
        </p>
      )}

      {!error && (
        <p className='text-xs text-slate-500 mt-4 italic'>
          Describe tu comida o sube una foto del plato para que la IA calcule macros.
        </p>
      )}
    </div>
  );
};

export default NutritionAILogger;
