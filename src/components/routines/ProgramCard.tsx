import React, { useState } from "react";
import { ChevronDown, ChevronUp, Calendar, Trash2, Check, Dumbbell, Zap } from "lucide-react";
import type { Routine } from "../../types";

interface RoutineWithId {
  id: string;
  data: Routine;
}

interface ProgramCardProps {
  programId: string;
  title: string;
  routines: RoutineWithId[];
  activeRoutineId?: string;
  onActivate: (routineId: string) => void;
  onDeleteProgram: (programId: string) => void;
  onDeleteRoutine: (routineId: string) => void;
  isDefault?: boolean;
}

const ProgramCard: React.FC<ProgramCardProps> = ({
  programId,
  title,
  routines,
  activeRoutineId,
  onActivate,
  onDeleteProgram,
  onDeleteRoutine,
  isDefault,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Sort routines by dayNumber
  const sortedRoutines = [...routines].sort(
    (a, b) => (a.data.dayNumber || 0) - (b.data.dayNumber || 0),
  );
  const goal = sortedRoutines[0]?.data.goal;
  const totalDays = sortedRoutines.length;

  return (
    <div className='bg-slate-950/50 border border-slate-800 rounded-xl overflow-hidden mb-3'>
      {/* Header del Programa */}
      <div
        className='p-4 flex items-center justify-between cursor-pointer hover:bg-slate-900/50 transition-colors'
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className='flex items-center gap-3'>
          <div className='bg-purple-900/20 p-2 rounded-lg text-purple-400'>
            <Calendar size={20} />
          </div>
          <div>
            <h3 className='font-bold text-white text-lg flex items-center gap-2'>
              {title}
              <span className='text-xs font-normal text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800'>
                {totalDays} Días
              </span>
              {isDefault && (
                <span className='text-[10px] font-bold text-amber-500 bg-amber-900/20 px-1.5 py-0.5 rounded border border-amber-900/50 uppercase'>
                  Oficial
                </span>
              )}
            </h3>
            <div className='flex items-center gap-2 text-xs text-slate-500'>
              {goal && (
                <span className='flex items-center gap-1'>
                  <Zap size={10} /> {goal}
                </span>
              )}
              {sortedRoutines.some((r) => r.id === activeRoutineId) && (
                <span className='text-blue-400 font-bold ml-2 text-[10px] uppercase border border-blue-900 bg-blue-900/10 px-1 rounded'>
                  Activo
                </span>
              )}
            </div>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          {!isDefault && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("¿Borrar todo el programa y sus rutinas?")) onDeleteProgram(programId);
              }}
              className='p-2 text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors'
              title='Borrar Programa'
            >
              <Trash2 size={16} />
            </button>
          )}
          {isExpanded ? (
            <ChevronUp
              size={20}
              className='text-slate-500'
            />
          ) : (
            <ChevronDown
              size={20}
              className='text-slate-500'
            />
          )}
        </div>
      </div>

      {/* Lista de Días */}
      {isExpanded && (
        <div className='border-t border-slate-800 bg-slate-900/20 p-2 space-y-2'>
          {sortedRoutines.map(({ id, data }) => (
            <div
              key={id}
              onClick={() => onActivate(id)}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                activeRoutineId === id
                  ? "bg-blue-900/20 border-blue-500 ring-1 ring-blue-500/50"
                  : "bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800"
              }`}
            >
              <div className='flex items-center gap-3'>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${activeRoutineId === id ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"}`}
                >
                  {data.dayNumber || 0}
                </div>
                <div>
                  <h4
                    className={`font-medium text-sm ${activeRoutineId === id ? "text-blue-300" : "text-slate-300"}`}
                  >
                    {data.title || `Día ${data.dayNumber}`}
                  </h4>
                  <div className='text-[10px] text-slate-500 flex gap-2'>
                    <span>{data.focus}</span>
                    <span>•</span>
                    <span>{data.blocks.length} Bloques</span>
                  </div>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                {activeRoutineId === id && (
                  <Check
                    size={16}
                    className='text-blue-500'
                  />
                )}
                {!isDefault && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("¿Borrar este día?")) onDeleteRoutine(id);
                    }}
                    className='p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-900/20 rounded-md transition-colors'
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgramCard;
