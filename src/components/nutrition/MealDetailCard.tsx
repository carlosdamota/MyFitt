import React, { useState } from "react";
import { ChevronDown, Trash2, Edit2, Copy, Sparkles, MoreHorizontal } from "lucide-react";
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
  onDuplicate?: (id: string) => void;
  onEdit?: (id: string) => void;
  onRefine?: (id: string) => void;
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
  onDuplicate,
  onEdit,
  onRefine,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const hasIngredients = ingredients && ingredients.length > 0;

  return (
    <div className='bg-slate-900/80 rounded-2xl border border-slate-800 animate-in slide-in-from-bottom-2 duration-300 hover:border-slate-700 transition-colors group relative'>
      {/* Main Row */}
      <div className='flex items-center p-4 relative'>
        {/* Ingredient Toggle */}
        <button
          onClick={() => setExpanded((prev) => !prev)}
          disabled={!hasIngredients}
          className={`mr-3 p-1.5 rounded-lg transition-all ${
            hasIngredients
              ? "hover:bg-slate-800 text-slate-500 hover:text-indigo-400 cursor-pointer"
              : "text-slate-700 cursor-default opacity-50"
          }`}
        >
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </button>

        {/* Meal Info */}
        <div className='flex-1 min-w-0 pr-2'>
          <h4 className='font-bold text-slate-200 text-sm group-hover:text-white transition-colors truncate'>
            {food}
          </h4>
          <div className='flex gap-3 text-[10px] text-slate-500 mt-1.5 font-mono font-bold uppercase tracking-wide'>
            <span className='text-slate-400'>{calories} kcal</span>
            <span className='text-slate-600'>|</span>
            <span className='text-blue-500/80'>{protein}p</span>
            <span className='text-purple-500/80'>{carbs}c</span>
            <span className='text-yellow-500/80'>{fats}f</span>
          </div>
        </div>

        {/* Actions Section */}
        {id && (
          <div className='relative flex items-center'>
            {/* Mobile Trigger */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className='p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors md:hidden'
            >
              <MoreHorizontal size={18} />
            </button>

            {/* Mobile Actions Menu (Popover) */}
            {showActions && (
              <>
                <div
                  className='fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px] md:hidden'
                  onClick={() => setShowActions(false)}
                />
                <div className='absolute right-0 top-full mt-2 flex flex-col gap-1 bg-slate-950 border border-slate-800 shadow-2xl p-1.5 rounded-xl z-50 animate-in zoom-in-95 duration-200 min-w-[40px] md:hidden'>
                  {onDuplicate && (
                    <button
                      onClick={() => {
                        onDuplicate(id);
                        setShowActions(false);
                      }}
                      className='p-2.5 text-slate-400 hover:text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors flex items-center justify-center'
                    >
                      <Copy size={18} />
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => {
                        onEdit(id);
                        setShowActions(false);
                      }}
                      className='p-2.5 text-slate-400 hover:text-green-400 hover:bg-green-900/20 rounded-lg transition-colors flex items-center justify-center'
                    >
                      <Edit2 size={18} />
                    </button>
                  )}
                  {onRefine && (
                    <button
                      onClick={() => {
                        onRefine(id);
                        setShowActions(false);
                      }}
                      className='p-2.5 text-slate-400 hover:text-purple-400 hover:bg-purple-900/20 rounded-lg transition-colors flex items-center justify-center'
                    >
                      <Sparkles size={18} />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => {
                        onDelete(id);
                        setShowActions(false);
                      }}
                      className='p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-center'
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Desktop Actions (Always visible) */}
            <div className='hidden md:flex items-center gap-1'>
              {onDuplicate && (
                <button
                  onClick={() => onDuplicate(id)}
                  className='p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-900/10 rounded-lg transition-colors'
                  title='Duplicar'
                >
                  <Copy size={16} />
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => onEdit(id)}
                  className='p-2 text-slate-500 hover:text-green-400 hover:bg-green-900/10 rounded-lg transition-colors'
                  title='Editar'
                >
                  <Edit2 size={16} />
                </button>
              )}
              {onRefine && (
                <button
                  onClick={() => onRefine(id)}
                  className='p-2 text-slate-500 hover:text-purple-400 hover:bg-purple-900/10 rounded-lg transition-colors'
                  title='Refinar con IA'
                >
                  <Sparkles size={16} />
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => onDelete(id)}
                  className='p-2 text-slate-500 hover:text-red-400 hover:bg-red-900/10 rounded-lg transition-colors'
                  title='Borrar'
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Ingredients Panel */}
      {hasIngredients && expanded && (
        <div className='border-t border-slate-800/60 bg-slate-950/30 px-4 py-3 space-y-2 animate-in slide-in-from-top-1 duration-200 rounded-b-2xl'>
          {ingredients.map((ing, idx) => (
            <div
              key={idx}
              className='flex items-center justify-between text-[11px] py-1.5 border-b border-slate-800/30 last:border-0'
            >
              <div className='flex items-center gap-2 min-w-0 flex-1'>
                <span className='text-slate-300 font-medium truncate'>{ing.name}</span>
                <span className='text-slate-600 text-[10px] shrink-0 font-mono'>{ing.amount}</span>
              </div>
              <div className='flex gap-3 font-mono text-[10px] shrink-0 ml-3 opacity-70'>
                <span className='text-blue-400'>{ing.p}p</span>
                <span className='text-purple-400'>{ing.c}c</span>
                <span className='text-yellow-400'>{ing.f}f</span>
                <span className='text-slate-300 font-bold ml-1'>{ing.cal}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MealDetailCard;
