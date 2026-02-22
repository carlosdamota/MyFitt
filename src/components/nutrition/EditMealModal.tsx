import React, { useState, useEffect } from "react";
import { X, Save, Trash2, Plus } from "lucide-react";
import type { NutritionLogEntry, Ingredient } from "../../types";

interface EditMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal: NutritionLogEntry | null;
  onSave: (id: string, data: Partial<NutritionLogEntry>) => Promise<boolean>;
}

const EditMealModal: React.FC<EditMealModalProps> = ({ isOpen, onClose, meal, onSave }) => {
  const [formData, setFormData] = useState<Partial<NutritionLogEntry>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (meal) {
      setFormData({
        food: meal.food,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fats: meal.fats,
        ingredients: meal.ingredients || [],
      });
    }
  }, [meal]);

  if (!isOpen || !meal) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const value = e.target.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBsIngredientChange = (
    index: number,
    field: keyof Ingredient,
    value: string | number,
  ) => {
    const newIngredients = [...(formData.ingredients || [])];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setFormData((prev) => ({ ...prev, ingredients: newIngredients }));
  };

  const removeIngredient = (index: number) => {
    const newIngredients = [...(formData.ingredients || [])];
    newIngredients.splice(index, 1);
    setFormData((prev) => ({ ...prev, ingredients: newIngredients }));
  };

  const addIngredient = () => {
    const newIngredients = [
      ...(formData.ingredients || []),
      { name: "Nuevo Ingrediente", amount: "100g", cal: 0, p: 0, c: 0, f: 0 },
    ];
    setFormData((prev) => ({ ...prev, ingredients: newIngredients }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave(meal.id, formData);
    setLoading(false);
    onClose();
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/90 backdrop-blur-md animate-in fade-in'>
      <div className='bg-surface-900 border border-surface-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300'>
        <div className='p-5 border-b border-surface-800 flex justify-between items-center bg-surface-900'>
          <h3 className='text-lg font-bold text-white'>Editar Comida</h3>
          <button
            onClick={onClose}
            className='p-2 bg-surface-800 rounded-full text-slate-400 hover:text-white transition-colors'
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className='flex-1 overflow-y-auto p-5 space-y-6'
        >
          {/* Nombre de la comida */}
          <div>
            <label className='text-xs text-slate-400 uppercase font-bold tracking-wider block mb-2'>
              Nombre de la Comida
            </label>
            <input
              type='text'
              value={formData.food}
              onChange={(e) => handleChange(e, "food")}
              className='w-full bg-surface-950 border border-surface-800 rounded-xl p-3 text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all shadow-inner'
            />
          </div>

          {/* Macros Grid */}
          <div className='bg-surface-950/50 p-4 rounded-xl border border-surface-800/50 space-y-3'>
            <label className='text-xs text-slate-400 uppercase font-bold tracking-wider block mb-1'>
              Macros Totales
            </label>
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
              <div className='space-y-1'>
                <label className='text-[10px] text-slate-500 font-bold block'>Kcal</label>
                <input
                  type='number'
                  value={formData.calories}
                  onChange={(e) => handleChange(e, "calories")}
                  className='w-full bg-surface-900 border border-surface-800 rounded-lg p-2.5 text-white font-mono text-sm focus:border-blue-500 outline-none text-center'
                />
              </div>
              <div className='space-y-1'>
                <label className='text-[10px] text-blue-400 font-bold block'>Prot (g)</label>
                <input
                  type='number'
                  value={formData.protein}
                  onChange={(e) => handleChange(e, "protein")}
                  className='w-full bg-surface-900 border border-surface-800 rounded-lg p-2.5 text-white font-mono text-sm focus:border-blue-500 outline-none text-center'
                />
              </div>
              <div className='space-y-1'>
                <label className='text-[10px] text-purple-400 font-bold block'>Carb (g)</label>
                <input
                  type='number'
                  value={formData.carbs}
                  onChange={(e) => handleChange(e, "carbs")}
                  className='w-full bg-surface-900 border border-surface-800 rounded-lg p-2.5 text-white font-mono text-sm focus:border-purple-500 outline-none text-center'
                />
              </div>
              <div className='space-y-1'>
                <label className='text-[10px] text-yellow-500 font-bold block'>Grasa (g)</label>
                <input
                  type='number'
                  value={formData.fats}
                  onChange={(e) => handleChange(e, "fats")}
                  className='w-full bg-surface-900 border border-surface-800 rounded-lg p-2.5 text-white font-mono text-sm focus:border-yellow-500 outline-none text-center'
                />
              </div>
            </div>
          </div>

          {/* Ingredientes */}
          <div className='space-y-3'>
            <div className='flex justify-between items-center'>
              <label className='text-xs text-slate-400 uppercase font-bold tracking-wider'>
                Ingredientes
              </label>
              <button
                type='button'
                onClick={addIngredient}
                className='text-[10px] bg-surface-800 hover:bg-surface-700 text-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors font-bold'
              >
                <Plus size={12} /> Añadir
              </button>
            </div>

            <div className='space-y-2'>
              {formData.ingredients?.map((ing, idx) => (
                <div
                  key={idx}
                  className='bg-surface-950 p-2 sm:p-3 rounded-xl border border-surface-800 flex gap-2 sm:gap-3 items-center'
                >
                  <div className='flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2'>
                    <input
                      type='text'
                      value={ing.name}
                      onChange={(e) => handleBsIngredientChange(idx, "name", e.target.value)}
                      className='w-full bg-transparent text-sm text-white border border-surface-800 rounded-md p-2 focus:border-cyan-500 outline-none placeholder-slate-600'
                      placeholder='Nombre ingrediente'
                    />
                    <input
                      type='text'
                      value={ing.amount}
                      onChange={(e) => handleBsIngredientChange(idx, "amount", e.target.value)}
                      className='w-full bg-transparent text-sm text-slate-300 border border-surface-800 rounded-md p-2 focus:border-cyan-500 outline-none placeholder-slate-600'
                      placeholder='Cantidad (ej. 100g)'
                    />
                  </div>
                  <button
                    type='button'
                    onClick={() => removeIngredient(idx)}
                    className='text-slate-500 hover:text-red-400 p-2 bg-surface-900 rounded-lg transition-colors'
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {(!formData.ingredients || formData.ingredients.length === 0) && (
                <p className='text-xs text-slate-500 text-center py-4 bg-surface-950/50 rounded-xl border border-dashed border-surface-800'>
                  No hay ingredientes registrados.
                </p>
              )}
            </div>
          </div>
        </form>

        <div className='p-5 border-t border-surface-800 flex justify-end gap-3 bg-surface-900'>
          <button
            onClick={onClose}
            className='px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-surface-800 transition-colors'
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className='px-5 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none'
          >
            {loading ? (
              "Guardando..."
            ) : (
              <>
                <Save size={16} /> Guardar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMealModal;
