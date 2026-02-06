import React, { useState } from "react";
import { useRoutines } from "../../hooks/useRoutines";
import { useProfile } from "../../hooks/useProfile";
import { Trash2, Check, Plus, Calendar, Dumbbell, Zap, MoreVertical, X } from "lucide-react";
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
}

const RoutineManager: React.FC<RoutineManagerProps> = ({
  user,
  onClose,
  onSelectRoutine,
  isPro = false,
  onRequireAuth,
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
          groups[routine.programId] = {
            title: routine.title.replace(/ - Día \d+$/, ""), // Remove " - Día X" suffix for group title if present
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
    const sortedAllGroups = Object.entries(groups).sort(([, a], [, b]) => {
      const maxDateA = Math.max(
        ...a.routines.map((r) => new Date(r.data.createdAt || 0).getTime()),
      );
      const maxDateB = Math.max(
        ...b.routines.map((r) => new Date(r.data.createdAt || 0).getTime()),
      );
      return maxDateB - maxDateA;
    });

    const defaults = sortedAllGroups.filter(([, group]) =>
      group.routines.some((r) => r.data.isDefault),
    );
    const customGroups = sortedAllGroups.filter(
      ([, group]) => !group.routines.some((r) => r.data.isDefault),
    );

    return { defaults, customGroups, standalone };
  }, [routines]);

  return (
    <div className='fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in'>
      <div className='bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-800 shadow-2xl flex flex-col max-h-[85vh]'>
        <div className='p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 rounded-t-2xl'>
          <h2 className='text-xl font-bold text-white flex items-center gap-2'>
            <Dumbbell className='text-blue-500' /> Mis Rutinas
          </h2>
          <button
            onClick={onClose}
            className='p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors'
          >
            <X size={20} />
          </button>
        </div>

        <div className='flex-1 overflow-y-auto p-4 space-y-6'>
          {loadingRoutines ? (
            <div className='text-center py-10 text-slate-500'>Cargando rutinas...</div>
          ) : (
            <>
              {/* Default Programs Section */}
              {groupedRoutines.defaults.length > 0 && (
                <div className='space-y-3'>
                  <h3 className='text-xs font-bold text-slate-500 uppercase tracking-widest px-2'>
                    Rutinas FitForge
                  </h3>
                  {groupedRoutines.defaults.map(([programId, group]) => (
                    <ProgramCard
                      key={programId}
                      programId={programId}
                      title={group.title}
                      routines={group.routines}
                      activeRoutineId={activeRoutineId}
                      onActivate={handleSetActive}
                      onDeleteProgram={() => {}} // Disable delete for defaults
                      onDeleteRoutine={() => {}} // Disable delete for defaults
                      isDefault={true}
                    />
                  ))}
                </div>
              )}

              {/* User Programs Section */}
              {(groupedRoutines.customGroups.length > 0 ||
                groupedRoutines.standalone.length > 0) && (
                <div className='space-y-3'>
                  <h3 className='text-xs font-bold text-slate-500 uppercase tracking-widest px-2 pt-2 border-t border-slate-800/50'>
                    Mis Rutinas Generadas
                  </h3>

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
                      className={`group relative p-4 rounded-xl border transition-all cursor-pointer ${
                        activeRoutineId === id
                          ? "bg-blue-900/20 border-blue-500 ring-1 ring-blue-500/50"
                          : "bg-slate-950/50 border-slate-800 hover:border-slate-600 hover:bg-slate-800/30"
                      }`}
                    >
                      <div className='flex justify-between items-start'>
                        <div>
                          <h3
                            className={`font-bold text-lg mb-1 ${
                              activeRoutineId === id ? "text-blue-400" : "text-white"
                            }`}
                          >
                            {routine.title || "Rutina sin nombre"}
                          </h3>
                          {routine.goal && (
                            <span className='bg-slate-900 px-2 py-1 rounded border border-slate-800 uppercase flex items-center gap-1 w-fit text-xs text-slate-400'>
                              <Zap size={10} /> {routine.goal}
                            </span>
                          )}
                        </div>

                        <div className='flex items-center gap-2'>
                          {activeRoutineId === id && (
                            <span className='bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-blue-900/50'>
                              <Check size={10} /> ACTIVA
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm("¿Eliminar esta rutina?")) handleDelete(id);
                            }}
                            disabled={deletingId === id}
                            className='p-2 text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100'
                            title='Eliminar rutina'
                          >
                            {deletingId === id ? "..." : <Trash2 size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State for Custom */}
              {groupedRoutines.customGroups.length === 0 &&
                groupedRoutines.standalone.length === 0 && (
                  <div className='text-center py-8 px-4 border border-dashed border-slate-800 rounded-xl mt-4'>
                    <div className='w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-500'>
                      <Plus size={24} />
                    </div>
                    <p className='text-slate-400 text-sm'>No tienes rutinas personalizadas.</p>
                  </div>
                )}
            </>
          )}
        </div>

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
      </div>
    </div>
  );
};

export default RoutineManager;
