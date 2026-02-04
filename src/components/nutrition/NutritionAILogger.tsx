import React, { useState } from "react";
import { Sparkles, Loader, Plus } from "lucide-react";
import { useRateLimit } from "../../hooks/useRateLimit";
import { parseNutritionLog } from "../../api/gemini";
import { logEvent } from "../../utils/analytics";
import RateLimitError from "../errors/RateLimitError";
import type { User as FirebaseUser } from "firebase/auth";

interface NutritionAILoggerProps {
  user: FirebaseUser | null;
  onAddLog: (data: any) => Promise<boolean>;
}

const NutritionAILogger: React.FC<NutritionAILoggerProps> = ({ user, onAddLog }) => {
  const [input, setInput] = useState<string>("");
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showRateLimitError, setShowRateLimitError] = useState<boolean>(false);

  // Rate limiting: 50 logs de nutrición con IA por día
  const rateLimitNutrition = useRateLimit(user, "parse_nutrition", 50);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!input.trim()) return;

    const canParse = await rateLimitNutrition.checkAndIncrement();
    if (!canParse) {
      setShowRateLimitError(true);
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const nutritionData = await parseNutritionLog(input);
      if (nutritionData) {
        await onAddLog(nutritionData);
        logEvent("Nutrition", "Logged with AI", nutritionData.food);
        setInput("");
      } else {
        setError("No se pudo entender el alimento. Intente ser más específico.");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className='bg-linear-to-br from-indigo-900/20 to-slate-900 p-5 rounded-2xl border border-indigo-500/30 shadow-xl'>
      {showRateLimitError && (
        <RateLimitError
          message={rateLimitNutrition.error || "Límite de IA alcanzado"}
          resetAt={rateLimitNutrition.resetAt}
          onClose={() => setShowRateLimitError(false)}
        />
      )}

      <h3 className='text-sm font-bold text-indigo-300 uppercase mb-3 flex items-center gap-2 tracking-widest'>
        <Sparkles
          size={16}
          className='animate-pulse'
        />{" "}
        Log Rápido con IA
      </h3>
      <form
        onSubmit={handleSubmit}
        className='relative group'
      >
        <input
          type='text'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Ej: 2 huevos revueltos y una manzana'
          className='w-full bg-slate-950 border border-indigo-900/50 rounded-xl py-3.5 pl-4 pr-12 text-sm text-white focus:border-indigo-500 outline-none placeholder-slate-600 transition-all shadow-inner'
          disabled={analyzing}
        />
        <button
          type='submit'
          disabled={analyzing || !input.trim()}
          className='absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all disabled:bg-slate-800 disabled:text-slate-600 shadow-lg active:scale-90'
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
      </form>

      {error && (
        <p className='text-xs text-red-500 mt-2 font-medium flex items-center gap-1.5'>
          <span className='w-1 h-1 bg-red-500 rounded-full' /> {error}
        </p>
      )}

      {!error && (
        <p className='text-[10px] text-slate-500 mt-3 italic font-medium'>
          Describe tu comida y la IA calculará automáticamente los macros.
        </p>
      )}
    </div>
  );
};

export default NutritionAILogger;
