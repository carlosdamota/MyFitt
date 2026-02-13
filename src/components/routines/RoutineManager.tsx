import React, { useState } from "react";
import { useRoutines } from "../../hooks/useRoutines";
import { useProfile } from "../../hooks/useProfile";
import { Trash2, Check, Plus, Calendar, Dumbbell, Zap, X } from "lucide-react";
import type { User } from "firebase/auth";
import type { Routine } from "../../types";
import ProgramCard from "./ProgramCard";
import ProBanner from "../common/ProBanner";

interface RoutineManagerProps {
  user: User | null;
  onClose: () => void;
  onSelectRoutine?: (routineId: string) => void;
  isPro?: boolean;
  onRequireAuth?: () => void;
  viewMode?: "modal" | "page";
}

const RoutineManager: React.FC<RoutineManagerProps> = ({
  user,
  onClose,
  onSelectRoutine,
  isPro = false,
  onRequireAuth,
  viewMode = "modal",
}) => {
  const { routines, deleteRoutine, loading: loadingRoutines } = useRoutines(user);
  const { profile, saveProfile } = useProfile(user);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const activeRoutineId = profile?.activeRoutineId;

  const handleSetActive = async (routineId: string) => {
    if (activeRoutineId === routineId) return;
    await saveProfile({ activeRoutineId: routineId });
    if (onSelectRoutine) onSelectRoutine(routineId);
  };

  const handleDelete = async (routineId: string) => {
    setDeletingId(routineId);
    await deleteRoutine(routineId);
    setDeletingId(null);
    if (activeRoutineId === routineId) {
      await saveProfile({ activeRoutineId: undefined });
    }
  };

  const handleDeleteProgram = async (programId: string) => {
    // Find all routines with this programId
    const routinesToDelete = Object.entries(routines).filter(([, r]) => r.programId === programId);

    setDeletingId("program"); // Block UI
    for (const [id] of routinesToDelete) {
      await deleteRoutine(id);
    }
    setDeletingId(null);

    // If active routine was in this program, clear it
    if (routinesToDelete.some(([id]) => id === activeRoutineId)) {
      await saveProfile({ activeRoutineId: undefined });
    }
  };

  // Group routines by programId
  const groupedRoutines = React.useMemo(() => {
    const groups: Record<
      string,
      { title: string; routines: Array<{ id: string; data: Routine }> }
    > = {};
    const standalone: Array<{ id: string; data: Routine }> = [];

    Object.entries(routines).forEach(([id, routine]) => {
      if (routine.programId) {
        if (!groups[routine.programId]) {
          let programTitle = routine.title;

          // 1. Check for known default programs
          const defaultTitles: Record<string, string> = {
            default_base_5: "Rutina Base (5 Días)",
            default_fullbody_3: "Full Body (3 Días)",
            default_upperlower_4: "Torso / Pierna (4 Días)",
          };

          if (defaultTitles[routine.programId]) {
            programTitle = defaultTitles[routine.programId];
          }
          // 2. Try to extract program name from "ProgramName: Day X" format
          else if (routine.title.includes(":")) {
            const potentialName = routine.title.split(":")[0].trim();
            // If the prefix is just "Día X", ignores it. If it's "My Plan", keeps it.
            if (!potentialName.match(/^Día \d+$/i) && !potentialName.match(/^Day \d+$/i)) {
              programTitle = potentialName;
            }
          }

          // 3. Fallback cleanup
          if (programTitle === routine.title) {
            programTitle = programTitle.replace(/^(Día|Day)\s*\d+[:\s-]*/i, "").trim();
            programTitle = programTitle.replace(/ - Día \d+$/, "");
            if (!programTitle) programTitle = "Programa Personalizado";
          }

          groups[routine.programId] = {
            title: programTitle,
            routines: [],
          };
        }
        groups[routine.programId].routines.push({ id, data: routine });
      } else {
        standalone.push({ id, data: routine });
      }
    });

    // Sort standalone by date
    standalone.sort(
      (a, b) =>
        new Date(b.data.createdAt || 0).getTime() - new Date(a.data.createdAt || 0).getTime(),
    );

    // Sort groups by date
    const sortedGroups = Object.entries(groups).sort(([, a], [, b]) => {
      const maxDateA = Math.max(
        ...a.routines.map((r) => new Date(r.data.createdAt || 0).getTime()),
      );
      const maxDateB = Math.max(
        ...b.routines.map((r) => new Date(r.data.createdAt || 0).getTime()),
      );
      return maxDateB - maxDateA;
    });

    return {
      defaults: sortedGroups.filter(([, g]) => g.routines.some((r) => r.data.isDefault)),
      customGroups: sortedGroups.filter(([, g]) => !g.routines.some((r) => r.data.isDefault)),
      standalone,
    };
  }, [routines]);

  const containerClass =
    viewMode === "modal"
      ? "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      : "w-full max-w-7xl mx-auto animate-in slide-in-from-bottom-4 duration-500";

  const contentClass =
    viewMode === "modal"
      ? "bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-800 shadow-2xl flex flex-col max-h-[85vh]"
      : "flex flex-col gap-8";

  return (
    <div className={containerClass}>
      <div className={contentClass}>
        {/* Header */}
        <div
          className={`${
            viewMode === "modal"
              ? "p-4 border-b border-slate-800 bg-slate-900/50 rounded-t-2xl flex justify-between items-center"
              : "mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          }`}
        >
          <div>
            <h2 className='text-2xl font-bold text-white flex items-center gap-3'>
              <div className='p-2 bg-blue-500/10 rounded-xl'>
                <Dumbbell className='text-blue-500' />
              </div>
              Mis Rutinas
            </h2>
            {viewMode === "page" && (
              <p className='text-slate-400 mt-1'>Gestiona y organiza tus planes de entrenamiento</p>
            )}
          </div>

          {viewMode === "modal" && (
            <button
              onClick={onClose}
              className='p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors'
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        <div
          className={`${
            viewMode === "modal" ? "flex-1 overflow-y-auto p-4 space-y-6" : "space-y-8"
          }`}
        >
          {loadingRoutines ? (
            <div className='flex flex-col items-center justify-center py-20 gap-4 text-slate-500'>
              <div className='w-8 h-8 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin' />
              <p>Cargando tu arsenal...</p>
            </div>
          ) : (
            <>
              {/* Default Programs */}
              {groupedRoutines.defaults.length > 0 && (
                <div className='space-y-4'>
                  <h3 className='flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-widest px-1'>
                    <Zap size={14} /> Rutinas FITTWIZ
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {groupedRoutines.defaults.map(([programId, group]) => (
                      <ProgramCard
                        key={programId}
                        programId={programId}
                        title={group.title}
                        routines={group.routines}
                        activeRoutineId={activeRoutineId}
                        onActivate={handleSetActive}
                        onDeleteProgram={() => {}}
                        onDeleteRoutine={() => {}}
                        isDefault={true}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* User Programs & Standalone */}
              {(groupedRoutines.customGroups.length > 0 ||
                groupedRoutines.standalone.length > 0) && (
                <div className='space-y-4'>
                  <div className='flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-widest px-1 pt-4 border-t border-slate-800/50'>
                    <Calendar size={14} /> Mis Planes
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {/* Custom Programs */}
                    {groupedRoutines.customGroups.map(([programId, group]) => (
                      <ProgramCard
                        key={programId}
                        programId={programId}
                        title={group.title}
                        routines={group.routines}
                        activeRoutineId={activeRoutineId}
                        onActivate={handleSetActive}
                        onDeleteProgram={handleDeleteProgram}
                        onDeleteRoutine={handleDelete}
                      />
                    ))}

                    {/* Standalone Routines */}
                    {groupedRoutines.standalone.map(({ id, data: routine }) => (
                      <div
                        key={id}
                        onClick={() => handleSetActive(id)}
                        className={`group relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                          activeRoutineId === id
                            ? "bg-blue-900/10 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/30"
                            : "bg-slate-900/40 border-slate-800 hover:border-slate-600 hover:bg-slate-800/60 hover:-translate-y-1 hover:shadow-lg"
                        }`}
                      >
                        {/* Background Decoration */}
                        <div className='absolute -right-6 -top-6 w-24 h-24 bg-linear-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500' />

                        <div className='relative z-10 flex flex-col h-full'>
                          <div className='flex justify-between items-start mb-3'>
                            <div className='p-2 bg-slate-800/50 rounded-lg group-hover:bg-slate-800 transition-colors'>
                              <Dumbbell
                                size={20}
                                className={
                                  activeRoutineId === id ? "text-blue-400" : "text-slate-400"
                                }
                              />
                            </div>
                            <div className='flex items-center gap-1'>
                              {activeRoutineId === id && (
                                <span className='bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1'>
                                  <Check size={10} /> ACTIVA
                                </span>
                              )}
                            </div>
                          </div>

                          <h3
                            className={`font-bold text-lg mb-1 line-clamp-1 ${
                              activeRoutineId === id
                                ? "text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-400"
                                : "text-white group-hover:text-blue-200"
                            }`}
                          >
                            {routine.title || "Rutina sin nombre"}
                          </h3>

                          {routine.goal && (
                            <span className='text-xs text-slate-500 mb-4 line-clamp-1 flex items-center gap-1'>
                              <Zap size={10} /> {routine.goal}
                            </span>
                          )}

                          <div className='mt-auto pt-3 border-t border-slate-800/50 flex justify-end'>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("¿Eliminar esta rutina?")) handleDelete(id);
                              }}
                              disabled={deletingId === id}
                              className='p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100'
                              title='Eliminar rutina'
                            >
                              {deletingId === id ? "..." : <Trash2 size={16} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Add New Routine Card (could be added here in future) */}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {groupedRoutines.customGroups.length === 0 &&
                groupedRoutines.standalone.length === 0 && (
                  <div className='text-center py-16 px-4 border border-dashed border-slate-800 rounded-3xl bg-slate-900/20'>
                    <div className='w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500'>
                      <Plus size={32} />
                    </div>
                    <h3 className='text-lg font-bold text-white mb-2'>Comienza tu viaje</h3>
                    <p className='text-slate-400 text-sm max-w-sm mx-auto'>
                      Crea tu primera rutina personalizada o elige una de nuestras rutinas
                      prediseñadas para empezar.
                    </p>
                  </div>
                )}
            </>
          )}
        </div>

        {/* Footer (only for modal) */}
        {viewMode === "modal" && (
          <div className='p-4 border-t border-slate-800 bg-slate-900/50 rounded-b-2xl space-y-3'>
            {!isPro && onRequireAuth && (
              <ProBanner
                isPro={isPro}
                onUpgrade={onRequireAuth}
                variant='subtle'
              />
            )}
            <div className='flex justify-end'>
              <button
                onClick={onClose}
                className='px-4 py-2 text-sm font-bold text-slate-400 hover:text-white transition-colors'
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoutineManager;
