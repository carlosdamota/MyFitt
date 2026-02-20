import React, { useState } from "react";
import { X, Sparkles, Loader } from "lucide-react";
import type { NutritionLogEntry } from "../../types";
import { parseNutritionLog } from "../../api/gemini";

interface RefineMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal: NutritionLogEntry | null;
  onSave: (id: string, data: Partial<NutritionLogEntry>) => Promise<boolean>;
}

const RefineMealModal: React.FC<RefineMealModalProps> = ({ isOpen, onClose, meal, onSave }) => {
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !meal) return null;

  const handleRefine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Construct a prompt that includes the original food + refinement instruction
      const fullPrompt = `Comida original: "${meal.food}". Cambios: "${instruction}". Devuélveme el JSON actualizado.`;

      const newData = await parseNutritionLog(fullPrompt);
      if (newData) {
        // We only update the core nutrition data, keeping ID and Date from original if needed (though onSave might handle that)
        await onSave(meal.id, {
          food: newData.food,
          calories: newData.calories,
          protein: newData.protein,
          carbs: newData.carbs,
          fats: newData.fats,
          ingredients: newData.ingredients,
        });
        onClose();
      } else {
        setError("No se pudo regenerar la comida. Intenta ser más claro.");
      }
    } catch (err) {
      console.error("Error refining meal:", err);
      setError("Error conectando con la IA.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/95 backdrop-blur-sm'>
      <div className='bg-surface-900 border border-surface-800 rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl'>
        <div className='p-4 border-b border-surface-800 flex justify-between items-center bg-indigo-900/10'>
          <h3 className='font-bold text-indigo-300 flex items-center gap-2'>
            <Sparkles
              size={18}
              className='text-indigo-400'
            />{" "}
            Refinar con IA
          </h3>
          <button
            onClick={onClose}
            className='text-slate-400 hover:text-white'
          >
            <X size={20} />
          </button>
        </div>

        <div className='p-5'>
          <div className='bg-surface-950/50 p-3 rounded-xl border border-surface-800/50 mb-4'>
            <p className='text-[10px] text-slate-500 uppercase font-bold mb-1'>Comida Actual</p>
            <p className='text-slate-300 text-sm font-medium'>{meal.food}</p>
            <div className='flex gap-3 mt-2 text-xs font-mono text-slate-400'>
              <span>{meal.calories} kcal</span>
              <span>{meal.protein}p</span>
              <span>{meal.carbs}c</span>
              <span>{meal.fats}f</span>
            </div>
          </div>

          <form
            onSubmit={handleRefine}
            className='space-y-4'
          >
            <div>
              <label className='text-sm text-slate-300 font-medium block mb-2'>
                ¿Qué quieres cambiar?
              </label>
              <textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder='Ej: Añade 50g más de arroz, quita el queso, cambia a 2 huevos...'
                className='w-full bg-surface-950 border border-surface-700 rounded-xl p-3 text-white text-sm focus:border-indigo-500 outline-none h-24 resize-none placeholder-slate-600 focus:ring-1 focus:ring-indigo-500/50 transition-all'
                autoFocus
              />
            </div>

            {error && (
              <p className='text-xs text-red-400 bg-red-900/10 p-2 rounded-lg border border-red-900/20'>
                {error}
              </p>
            )}

            <div className='flex justify-end gap-3 pt-2'>
              <button
                type='button'
                onClick={onClose}
                className='px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors'
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type='submit'
                disabled={loading || !instruction.trim()}
                className='px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {loading ? (
                  <>
                    <Loader
                      size={16}
                      className='animate-spin'
                    />{" "}
                    Procesando...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Refinar
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RefineMealModal;
