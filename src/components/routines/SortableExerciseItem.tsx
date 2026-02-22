import React from "react";
import { X, GripVertical, Dumbbell, Hash, AlignLeft } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Exercise } from "../../types";
import ExerciseIcon from "../icons/ExerciseIcons";
import { getExerciseIcon } from "../../utils/exerciseIcons";

export interface SortableExerciseItemProps {
  exercise: Exercise;
  exIndex: number;
  blockIndex: number;
  updateExercise: (
    blockIndex: number,
    exIndex: number,
    field: keyof Exercise,
    value: string,
  ) => void;
  removeExercise: (blockIndex: number, exIndex: number) => void;
}

export const SortableExerciseItem: React.FC<SortableExerciseItemProps> = ({
  exercise,
  exIndex,
  blockIndex,
  updateExercise,
  removeExercise,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: `ex-${blockIndex}-${exIndex}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className='bg-surface-950 p-3 rounded-lg border border-surface-800 relative group flex gap-2'
    >
      <div
        {...attributes}
        {...listeners}
        className='flex items-center justify-center text-slate-600 cursor-grab active:cursor-grabbing hover:text-slate-400'
      >
        <GripVertical size={20} />
      </div>
      <div className='flex-1 grid grid-cols-1 gap-2'>
        <button
          onClick={() => removeExercise(blockIndex, exIndex)}
          className='absolute top-2 right-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity'
        >
          <X size={16} />
        </button>
        <div className='flex items-center gap-2'>
          {(() => {
            const iconType = getExerciseIcon(exercise.name, exercise.svg);
            return iconType ? (
              <div className='w-4 h-4 shrink-0 text-slate-500'>
                <ExerciseIcon
                  type={iconType}
                  className='w-full h-full fill-current'
                />
              </div>
            ) : (
              <Dumbbell
                size={16}
                className='text-slate-500 shrink-0'
              />
            );
          })()}
          <input
            type='text'
            value={exercise.name}
            onChange={(e) => updateExercise(blockIndex, exIndex, "name", e.target.value)}
            className='w-full bg-transparent border-b border-transparent focus:border-blue-500 outline-none text-sm text-white font-bold placeholder-slate-600'
            placeholder='Nombre del ejercicio'
          />
        </div>
        <div className='flex items-center gap-2'>
          <Hash
            size={16}
            className='text-slate-500 shrink-0'
          />
          <input
            type='text'
            value={exercise.reps}
            onChange={(e) => updateExercise(blockIndex, exIndex, "reps", e.target.value)}
            className='w-full bg-transparent border-b border-transparent focus:border-blue-500 outline-none text-xs text-slate-300 placeholder-slate-600'
            placeholder='Reps (ej. 10-12)'
          />
        </div>
        <div className='flex items-center gap-2'>
          <AlignLeft
            size={16}
            className='text-slate-500 shrink-0'
          />
          <input
            type='text'
            value={exercise.note ?? ""}
            onChange={(e) => updateExercise(blockIndex, exIndex, "note", e.target.value)}
            className='w-full bg-transparent border-b border-transparent focus:border-blue-500 outline-none text-xs text-slate-400 placeholder-slate-600'
            placeholder='Notas técnicas...'
          />
        </div>
      </div>
    </div>
  );
};
