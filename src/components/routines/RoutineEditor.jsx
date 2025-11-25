import React, { useState } from 'react';
import { Save, Plus, Trash2, X, Dumbbell, Clock, AlignLeft, Hash, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableExerciseItem = ({ exercise, exIndex, blockIndex, updateExercise, removeExercise }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: `ex-${blockIndex}-${exIndex}` });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-slate-950 p-3 rounded-lg border border-slate-800 relative group flex gap-2">
      <div {...attributes} {...listeners} className="flex items-center justify-center text-slate-600 cursor-grab active:cursor-grabbing hover:text-slate-400">
        <GripVertical size={20} />
      </div>
      <div className="flex-1 grid grid-cols-1 gap-2">
        <button onClick={() => removeExercise(blockIndex, exIndex)} className="absolute top-2 right-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><X size={16} /></button>
        <div className="flex items-center gap-2">
          <Dumbbell size={16} className="text-slate-500 shrink-0" />
          <input 
            type="text" 
            value={exercise.name} 
            onChange={(e) => updateExercise(blockIndex, exIndex, 'name', e.target.value)} 
            className="w-full bg-transparent border-b border-transparent focus:border-blue-500 outline-none text-sm text-white font-bold placeholder-slate-600"
            placeholder="Nombre del ejercicio"
          />
        </div>
        <div className="flex items-center gap-2">
          <Hash size={16} className="text-slate-500 shrink-0" />
          <input 
            type="text" 
            value={exercise.reps} 
            onChange={(e) => updateExercise(blockIndex, exIndex, 'reps', e.target.value)} 
            className="w-full bg-transparent border-b border-transparent focus:border-blue-500 outline-none text-xs text-slate-300 placeholder-slate-600"
            placeholder="Reps (ej. 10-12)"
          />
        </div>
        <div className="flex items-center gap-2">
          <AlignLeft size={16} className="text-slate-500 shrink-0" />
          <input 
            type="text" 
            value={exercise.note} 
            onChange={(e) => updateExercise(blockIndex, exIndex, 'note', e.target.value)} 
            className="w-full bg-transparent border-b border-transparent focus:border-blue-500 outline-none text-xs text-slate-400 placeholder-slate-600"
            placeholder="Notas técnicas..."
          />
        </div>
      </div>
    </div>
  );
};

const RoutineEditor = ({ initialData, onSave, onCancel }) => {
  const [routine, setRoutine] = useState(initialData || {
    title: 'Nueva Rutina',
    focus: 'Full Body',
    mode: 'heavy', // heavy | metabolic
    weight: 'Carga Alta',
    bg: 'bg-slate-900',
    border: 'border-slate-800',
    blocks: []
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event, blockIndex) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = parseInt(active.id.split('-')[2]);
      const newIndex = parseInt(over.id.split('-')[2]);
      
      const newBlocks = [...routine.blocks];
      newBlocks[blockIndex].exercises = arrayMove(newBlocks[blockIndex].exercises, oldIndex, newIndex);
      setRoutine(prev => ({ ...prev, blocks: newBlocks }));
    }
  };


  const handleChange = (field, value) => {
    setRoutine(prev => ({ ...prev, [field]: value }));
  };

  const addBlock = () => {
    const newBlock = {
      id: routine.blocks.length + 1,
      rest: 60,
      exercises: []
    };
    setRoutine(prev => ({ ...prev, blocks: [...prev.blocks, newBlock] }));
  };

  const removeBlock = (blockIndex) => {
    setRoutine(prev => ({
      ...prev,
      blocks: prev.blocks.filter((_, idx) => idx !== blockIndex)
    }));
  };

  const updateBlock = (blockIndex, field, value) => {
    const newBlocks = [...routine.blocks];
    newBlocks[blockIndex] = { ...newBlocks[blockIndex], [field]: value };
    setRoutine(prev => ({ ...prev, blocks: newBlocks }));
  };

  const addExercise = (blockIndex) => {
    const newBlocks = [...routine.blocks];
    newBlocks[blockIndex].exercises.push({
      name: 'Nuevo Ejercicio',
      reps: '10-12',
      note: '',
      svg: 'dumbbell'
    });
    setRoutine(prev => ({ ...prev, blocks: newBlocks }));
  };

  const removeExercise = (blockIndex, exerciseIndex) => {
    const newBlocks = [...routine.blocks];
    newBlocks[blockIndex].exercises = newBlocks[blockIndex].exercises.filter((_, idx) => idx !== exerciseIndex);
    setRoutine(prev => ({ ...prev, blocks: newBlocks }));
  };

  const updateExercise = (blockIndex, exerciseIndex, field, value) => {
    const newBlocks = [...routine.blocks];
    newBlocks[blockIndex].exercises[exerciseIndex] = { 
      ...newBlocks[blockIndex].exercises[exerciseIndex], 
      [field]: value 
    };
    setRoutine(prev => ({ ...prev, blocks: newBlocks }));
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 overflow-y-auto pb-20">
      <div className="sticky top-0 bg-slate-900/90 backdrop-blur border-b border-slate-800 p-4 flex justify-between items-center z-10">
        <h2 className="text-lg font-bold text-white">Editar Rutina</h2>
        <div className="flex gap-2">
          <button onClick={onCancel} className="p-2 text-slate-400 hover:text-white"><X size={20} /></button>
          <button onClick={() => onSave(routine)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-500"><Save size={16} /> Guardar</button>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-md mx-auto">
        {/* Configuración General */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Configuración General</h3>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Título</label>
            <input type="text" value={routine.title} onChange={(e) => handleChange('title', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Enfoque</label>
              <input type="text" value={routine.focus} onChange={(e) => handleChange('focus', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Modo</label>
              <select value={routine.mode} onChange={(e) => handleChange('mode', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm">
                <option value="heavy">Fuerza (Heavy)</option>
                <option value="metabolic">Metabólico</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bloques */}
        <div className="space-y-4">
          {routine.blocks.map((block, blockIndex) => (
            <div key={blockIndex} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <div className="bg-slate-800/50 p-3 flex justify-between items-center border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-300">Bloque {blockIndex + 1}</span>
                  <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-700">
                    <Clock size={12} className="text-slate-500" />
                    <input 
                      type="number" 
                      value={block.rest} 
                      onChange={(e) => updateBlock(blockIndex, 'rest', parseInt(e.target.value))} 
                      className="w-12 bg-transparent text-xs text-white outline-none text-center"
                    />
                    <span className="text-xs text-slate-500">s</span>
                  </div>
                </div>
                <button onClick={() => removeBlock(blockIndex)} className="text-red-400 p-1 hover:bg-red-900/20 rounded"><Trash2 size={16} /></button>
              </div>
              
              <div className="p-3 space-y-3">
                <DndContext 
                  sensors={sensors} 
                  collisionDetection={closestCenter} 
                  onDragEnd={(event) => handleDragEnd(event, blockIndex)}
                >
                  <SortableContext 
                    items={block.exercises.map((_, idx) => `ex-${blockIndex}-${idx}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    {block.exercises.map((ex, exIndex) => (
                      <SortableExerciseItem 
                        key={`ex-${blockIndex}-${exIndex}`}
                        exercise={ex} 
                        exIndex={exIndex} 
                        blockIndex={blockIndex} 
                        updateExercise={updateExercise} 
                        removeExercise={removeExercise} 
                      />
                    ))}
                  </SortableContext>
                </DndContext>
                <button onClick={() => addExercise(blockIndex)} className="w-full py-2 border border-dashed border-slate-700 rounded-lg text-xs text-slate-500 hover:text-blue-400 hover:border-blue-500/50 transition-colors flex items-center justify-center gap-1">
                  <Plus size={14} /> Añadir Ejercicio
                </button>
              </div>
            </div>
          ))}
          
          <button onClick={addBlock} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors border border-slate-700">
            <Plus size={18} /> Añadir Bloque
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoutineEditor;
