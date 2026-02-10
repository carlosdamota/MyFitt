import React, { useState } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import type { Ingredient } from "../../types";

interface MealDetailCardProps {
  id?: string;
  food: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients?: Ingredient[];
  canDelete: boolean;
  onDelete: (id: string) => Promise<boolean>;
}

const MealDetailCard: React.FC<MealDetailCardProps> = ({
  id,
  food,
  calories,
  protein,
  carbs,
  fats,
  ingredients,
  canDelete,
  onDelete,
}) => {
  const [expanded, setExpanded] = useState(false);
  const hasIngredients = ingredients && ingredients.length > 0;

  return (
    <div className='bg-slate-900/80 rounded-2xl border border-slate-800 animate-in slide-in-from-bottom-2 duration-300 hover:border-slate-700 transition-colors group overflow-hidden'>
      {/* Main Row */}
      <div className='flex items-center p-4'>
        {/* Expand Toggle */}
        {hasIngredients && (
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className='mr-3 p-1.5 rounded-lg hover:bg-slate-800 transition-all text-slate-500 hover:text-indigo-400'
            aria-label={expanded ? "Ocultar ingredientes" : "Ver ingredientes"}
          >
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        )}

        {/* Meal Info */}
        <div className='flex-1 min-w-0'>
          <h4 className='font-bold text-slate-200 text-sm group-hover:text-white transition-colors truncate'>
            {food}
          </h4>
          <div className='flex gap-4 text-[11px] text-slate-500 mt-1.5 font-mono font-bold'>
            <span className='text-blue-500/80 flex items-center gap-1'>
              <span className='w-1 h-1 bg-blue-500 rounded-full' /> {protein}p
            </span>
            <span className='text-purple-500/80 flex items-center gap-1'>
              <span className='w-1 h-1 bg-purple-500 rounded-full' /> {carbs}c
            </span>
            <span className='text-yellow-500/80 flex items-center gap-1'>
              <span className='w-1 h-1 bg-yellow-500 rounded-full' /> {fats}f
            </span>
            <span className='text-white ml-auto bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800'>
              {calories} KCAL
            </span>
          </div>
        </div>

        {/* Delete Button */}
        {canDelete && id && (
          <button
            onClick={() => onDelete(id)}
            className='ml-4 text-slate-700 hover:text-red-400 p-2.5 hover:bg-red-900/10 rounded-xl transition-all opacity-40 group-hover:opacity-100'
            title='Borrar comida'
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Ingredients Panel */}
      {hasIngredients && expanded && (
        <div className='border-t border-slate-800/60 bg-slate-950/50 px-4 py-3 space-y-2 animate-in slide-in-from-top-1 duration-200'>
          <span className='text-[9px] font-bold text-slate-600 uppercase tracking-widest'>
            Ingredientes
          </span>
          {ingredients.map((ing, idx) => (
            <div
              key={idx}
              className='flex items-center justify-between text-[11px] py-1.5 border-b border-slate-800/30 last:border-0'
            >
              <div className='flex items-center gap-2 min-w-0 flex-1'>
                <span className='text-slate-300 font-medium truncate'>{ing.name}</span>
                <span className='text-slate-600 text-[10px] shrink-0'>· {ing.amount}</span>
              </div>
              <div className='flex gap-3 font-mono text-[10px] shrink-0 ml-3'>
                <span className='text-blue-500/60'>{ing.p}p</span>
                <span className='text-purple-500/60'>{ing.c}c</span>
                <span className='text-yellow-500/60'>{ing.f}f</span>
                <span className='text-slate-400 font-bold'>{ing.cal}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MealDetailCard;
