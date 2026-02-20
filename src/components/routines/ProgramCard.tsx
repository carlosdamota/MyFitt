import React, { useState } from "react";
import { ChevronDown, ChevronUp, Calendar, Trash2, Check, Zap } from "lucide-react";
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

  const sortedRoutines = [...routines].sort(
    (a, b) => (a.data.dayNumber || 0) - (b.data.dayNumber || 0),
  );
  const goal = sortedRoutines[0]?.data.goal;
  const totalDays = sortedRoutines.length;
  const isActiveProgram = sortedRoutines.some((r) => r.id === activeRoutineId);

  const cleanRoutineTitle = (routineTitle: string) => {
    if (!routineTitle) return "";

    // If it starts with the program title followed by a separator, remove it
    const programPrefixMatch = new RegExp(`^${title}[:\\s-]+`, "i");
    let cleaned = routineTitle.replace(programPrefixMatch, "").trim();

    // If after removing the program title it starts with "Día X:", keep just the custom part
    cleaned = cleaned.replace(/^(Día|Day)\s*\d+[:\s-]*/i, "").trim();

    // Fallback if everything was removed (e.g. title was just the program name + Day X)
    return cleaned || routineTitle;
  };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden mb-4 transition-all duration-300 group ${
        isActiveProgram
          ? "bg-surface-900 border border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.15)]"
          : "bg-surface-900/40 border border-surface-800 hover:border-surface-700 hover:bg-surface-900/60"
      }`}
    >
      {/* Active glow */}
      {isActiveProgram && (
        <div className='absolute inset-0 bg-linear-to-r from-blue-500/5 to-purple-500/5 pointer-events-none' />
      )}

      {/* Header */}
      <div
        className='relative p-4 sm:p-5 flex flex-col gap-3 cursor-pointer'
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Row 1: Icon + Title */}
        <div className='flex items-start gap-3'>
          <div
            className={`shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg ${
              isActiveProgram
                ? "bg-linear-to-br from-blue-600 to-purple-600 text-white shadow-blue-900/30"
                : "bg-surface-800 text-slate-400"
            }`}
          >
            <Calendar size={20} />
          </div>

          <div className='flex-1 min-w-0'>
            <h3
              className={`font-bold text-base sm:text-lg leading-tight mb-1 ${
                isActiveProgram ? "text-white" : "text-slate-200"
              }`}
            >
              {title}
            </h3>

            {/* Badges row */}
            <div className='flex flex-wrap items-center gap-2'>
              {isDefault && (
                <span className='inline-flex items-center gap-1 text-[10px] font-bold text-amber-200 bg-linear-to-r from-amber-600/80 to-yellow-600/80 px-2 py-0.5 rounded-full shadow-sm border border-amber-500/30 uppercase tracking-wide'>
                  <span className='w-1 h-1 rounded-full bg-white animate-pulse' />
                  Oficial
                </span>
              )}
              <span className='inline-flex items-center gap-1.5 text-[11px] text-slate-400 bg-surface-800/60 px-2 py-0.5 rounded-md border border-surface-700/50'>
                <span className='w-1.5 h-1.5 rounded-full bg-slate-400' />
                {totalDays} Días
              </span>
              {goal && (
                <span className='inline-flex items-center gap-1 text-[11px] text-slate-400'>
                  <Zap
                    size={10}
                    className={isActiveProgram ? "text-blue-400" : "text-slate-500"}
                  />
                  {goal}
                </span>
              )}
            </div>
          </div>

          {/* Chevron (top-right, always visible) */}
          <button
            className={`shrink-0 p-1.5 rounded-lg transition-colors ${
              isExpanded ? "bg-surface-800 text-slate-300" : "text-slate-500"
            }`}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {/* Row 2: Action button */}
        <div className='flex items-center gap-2'>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (sortedRoutines.length > 0) {
                onActivate(sortedRoutines[0].id);
              }
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-[0.97] ${
              isActiveProgram
                ? "bg-blue-600 text-white shadow-blue-900/30 hover:bg-blue-500"
                : "bg-surface-800 text-slate-300 border border-surface-700 hover:bg-surface-700 hover:text-white"
            }`}
          >
            {isActiveProgram ? (
              <>
                <Check size={14} /> Activo
              </>
            ) : (
              "Seleccionar"
            )}
          </button>

          {!isDefault && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("¿Borrar todo el programa y sus rutinas?")) onDeleteProgram(programId);
              }}
              className='shrink-0 p-2 text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded-xl transition-colors border border-surface-800'
              title='Borrar Programa'
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Day List */}
      {isExpanded && (
        <div className='border-t border-surface-800/50 bg-surface-950/30 p-2 space-y-1'>
          {sortedRoutines.map(({ id, data }) => (
            <div
              key={id}
              onClick={() => onActivate(id)}
              className={`group/day flex items-center gap-3 p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer ${
                activeRoutineId === id
                  ? "bg-blue-500/10 border-blue-500/50"
                  : "bg-transparent border-transparent hover:bg-surface-800/40 hover:border-surface-700/50"
              }`}
            >
              {/* Day number */}
              <div
                className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition-colors ${
                  activeRoutineId === id
                    ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40"
                    : "bg-surface-800/80 border-surface-700 text-slate-400"
                }`}
              >
                {data.dayNumber || 0}
              </div>

              {/* Text */}
              <div className='flex-1 min-w-0'>
                <h4
                  className={`font-semibold text-sm truncate ${
                    activeRoutineId === id ? "text-blue-100" : "text-slate-300"
                  }`}
                >
                  {cleanRoutineTitle(data.title) || `Día ${data.dayNumber}`}
                </h4>
                <p className='text-[10px] text-slate-500 truncate'>
                  {data.focus}
                  <span className='mx-1'>·</span>
                  {data.blocks.length} Bloques
                </p>
              </div>

              {/* Right side */}
              <div className='shrink-0 flex items-center gap-2'>
                {activeRoutineId === id && (
                  <span className='w-2 h-2 rounded-full bg-blue-400 animate-pulse' />
                )}
                {!isDefault && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("¿Borrar este día?")) onDeleteRoutine(id);
                    }}
                    className='p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-900/10 rounded-lg transition-colors sm:opacity-0 group-hover/day:opacity-100 focus:opacity-100'
                    title='Eliminar día'
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
