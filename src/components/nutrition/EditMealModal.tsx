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
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs'>
      <div className='bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col'>
        <div className='p-4 border-b border-slate-800 flex justify-between items-center'>
          <h3 className='font-bold text-white'>Editar Comida</h3>
          <button
            onClick={onClose}
            className='text-slate-400 hover:text-white'
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className='flex-1 overflow-y-auto p-4 space-y-4'
        >
          <div>
            <label className='text-xs text-slate-500 uppercase font-bold block mb-1'>Nombre</label>
            <input
              type='text'
              value={formData.food}
              onChange={(e) => handleChange(e, "food")}
              className='w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none'
            />
          </div>

          <div className='grid grid-cols-4 gap-2'>
            <div>
              <label className='text-[10px] text-slate-500 uppercase font-bold block mb-1'>
                Calculado
              </label>
              <input
                type='number'
                value={formData.calories}
                onChange={(e) => handleChange(e, "calories")}
                className='w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none'
              />
            </div>
            <div>
              <label className='text-[10px] text-blue-500 uppercase font-bold block mb-1'>
                Proteína
              </label>
              <input
                type='number'
                value={formData.protein}
                onChange={(e) => handleChange(e, "protein")}
                className='w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none'
              />
            </div>
            <div>
              <label className='text-[10px] text-purple-500 uppercase font-bold block mb-1'>
                Carbos
              </label>
              <input
                type='number'
                value={formData.carbs}
                onChange={(e) => handleChange(e, "carbs")}
                className='w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm focus:border-purple-500 outline-none'
              />
            </div>
            <div>
              <label className='text-[10px] text-yellow-500 uppercase font-bold block mb-1'>
                Grasas
              </label>
              <input
                type='number'
                value={formData.fats}
                onChange={(e) => handleChange(e, "fats")}
                className='w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm focus:border-yellow-500 outline-none'
              />
            </div>
          </div>

          <div className='space-y-2'>
            <div className='flex justify-between items-center'>
              <label className='text-xs text-slate-500 uppercase font-bold'>Ingredientes</label>
              <button
                type='button'
                onClick={addIngredient}
                className='text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded flex items-center gap-1 transition-colors'
              >
                <Plus size={10} /> Añadir
              </button>
            </div>

            <div className='space-y-2'>
              {formData.ingredients?.map((ing, idx) => (
                <div
                  key={idx}
                  className='bg-slate-950/50 p-2 rounded-lg border border-slate-800/50 flex gap-2 items-center'
                >
                  <div className='flex-1 space-y-1'>
                    <input
                      type='text'
                      value={ing.name}
                      onChange={(e) => handleBsIngredientChange(idx, "name", e.target.value)}
                      className='w-full bg-transparent text-xs text-white border-none p-0 focus:ring-0 placeholder-slate-600'
                      placeholder='Ingrediente'
                    />
                    <input
                      type='text'
                      value={ing.amount}
                      onChange={(e) => handleBsIngredientChange(idx, "amount", e.target.value)}
                      className='w-full bg-transparent text-[10px] text-slate-400 border-none p-0 focus:ring-0 placeholder-slate-600'
                      placeholder='Cantidad'
                    />
                  </div>
                  <button
                    type='button'
                    onClick={() => removeIngredient(idx)}
                    className='text-slate-600 hover:text-red-400 p-1'
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>

        <div className='p-4 border-t border-slate-800 flex justify-end gap-3 bg-slate-900'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors'
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className='px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2'
          >
            {loading ? (
              "Guardando..."
            ) : (
              <>
                <Save size={16} /> Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMealModal;
