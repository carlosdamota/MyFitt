import React from "react";
import { FileText, Download, Share2, Calendar, Clock, Dumbbell } from "lucide-react";
import type { WorkoutLogEntry, WorkoutSession } from "../../types";
import { SocialShareModal } from "../common/SocialShareModal";

interface LogViewerProps {
  sessions: WorkoutSession[];
  userWeight: string | number;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

interface FlatLogEntry extends WorkoutLogEntry {
  exercise: string;
  volume: number;
}

const LogViewer: React.FC<LogViewerProps> = ({
  sessions,
  userWeight,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}) => {
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "";
    }
  };

  const [shareData, setShareData] = React.useState<{
    date: string;
    logs: FlatLogEntry[];
    title?: string;
  } | null>(null);

  const flattenSessionLogs = (sessionLogs: Record<string, WorkoutLogEntry[]>): FlatLogEntry[] => {
    let flat: FlatLogEntry[] = [];
    Object.entries(sessionLogs).forEach(([exercise, entries]) => {
      entries.forEach((entry) => {
        const weight = parseFloat(String(entry.weight)) || 0;
        const volume = weight * (entry.reps || 0) * (entry.sets || 0);
        flat.push({ exercise, ...entry, volume });
      });
    });
    return flat;
  };

  const handleExportCSV = (): void => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Fecha,Sesion,Ejercicio,Peso (kg),Reps,Series,Volumen Total\n";

    sessions.forEach((session) => {
      const flat = flattenSessionLogs(session.logs);
      const date = new Date(session.date).toLocaleDateString();
      const title = session.routineTitle || "Sesión General";
      flat.forEach((log) => {
        const row = `${date},${title},${log.exercise},${log.weight},${log.reps},${log.sets},${log.volume}`;
        csvContent += row + "\n";
      });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "historial_entrenamiento_sesiones.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-xs text-slate-500 dark:text-slate-400 font-bold uppercase flex items-center gap-2 tracking-wider transition-colors'>
          <FileText
            size={14}
            className='text-emerald-400'
          />{" "}
          Historial por Sesión
        </h3>
        <button
          onClick={handleExportCSV}
          className='text-[10px] bg-emerald-600/80 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all active:scale-95'
        >
          <Download size={12} /> CSV
        </button>
      </div>

      <div className='space-y-4'>
        {sessions.length === 0 && (
          <p className='text-center text-slate-500 text-xs py-8'>
            No hay sesiones registradas aún.
          </p>
        )}

        {sessions.map((session) => {
          const flatLogs = flattenSessionLogs(session.logs);
          const sessionVolume = flatLogs.reduce((acc, l) => acc + l.volume, 0);

          return (
            <div
              key={session.id}
              className='bg-white dark:bg-surface-900 rounded-3xl border border-slate-200 dark:border-surface-800 shadow-sm overflow-hidden transition-colors'
            >
              {/* Session Header */}
              <div className='px-5 py-4 bg-slate-50/50 dark:bg-surface-800/20 border-b border-slate-200 dark:border-surface-800 transition-colors'>
                <div className='flex items-start justify-between'>
                  <div className='space-y-1'>
                    <div className='flex items-center gap-2'>
                      <Dumbbell
                        size={14}
                        className='text-primary-400'
                      />
                      <h4 className='text-slate-900 dark:text-white font-bold text-sm transition-colors'>
                        {session.routineTitle || "Sesión de Entrenamiento"}
                      </h4>
                    </div>
                    <div className='flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 transition-colors'>
                      <div className='flex items-center gap-1.5'>
                        <Calendar
                          size={12}
                          className='text-slate-400'
                        />
                        {formatDate(session.date)}
                      </div>
                      <div className='flex items-center gap-1.5'>
                        <Clock
                          size={12}
                          className='text-slate-400'
                        />
                        {formatTime(session.date)}
                        {session.duration && ` • ${session.duration}`}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setShareData({
                        date: session.date,
                        logs: flatLogs,
                        title: session.routineTitle,
                      })
                    }
                    className='text-slate-400 hover:text-primary-400 transition-colors p-2 rounded-xl hover:bg-primary-500/10'
                    title='Compartir Sesión'
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </div>

              {/* Exercise List */}
              <div className='divide-y divide-slate-100 dark:divide-surface-800/50'>
                {flatLogs.map((log, i) => (
                  <div
                    key={`${session.id}-${i}`}
                    className='flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/30 dark:hover:bg-surface-800/10 transition-colors'
                  >
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-semibold text-slate-800 dark:text-slate-200 truncate transition-colors'>
                        {log.exercise}
                      </p>
                      <p className='text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 transition-colors'>
                        {log.weight}kg × {log.reps} reps × {log.sets} series
                      </p>
                    </div>
                    <div className='shrink-0 text-right'>
                      {log.volume > 0 ? (
                        <span className='text-sm font-mono font-bold text-primary-400'>
                          {log.volume >= 1000 ? `${(log.volume / 1000).toFixed(1)}k` : log.volume}
                        </span>
                      ) : (
                        <span className='text-sm font-mono font-bold text-emerald-400'>
                          {log.reps ? log.reps * (log.sets || 1) : 0} reps
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Session Footer */}
              <div className='flex items-center justify-between px-5 py-3 bg-slate-50/30 dark:bg-surface-950/20 border-t border-slate-200/60 dark:border-surface-800/50 transition-colors'>
                <div className='flex items-center gap-2'>
                  <span className='text-[10px] text-slate-400 uppercase font-bold tracking-widest'>
                    Volumen Total
                  </span>
                  <span className='text-[10px] text-slate-400 font-mono'>
                    ({flatLogs.length} ejercicios)
                  </span>
                </div>
                <span className='text-sm font-black text-slate-900 dark:text-white font-mono transition-colors'>
                  {sessionVolume >= 1000 ? `${(sessionVolume / 1000).toFixed(1)}k` : sessionVolume}
                </span>
              </div>
            </div>
          );
        })}

        {hasNextPage && (
          <div className='flex justify-center pt-4'>
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className='text-sm font-bold text-primary-500 hover:text-primary-600 disabled:opacity-50 transition-colors'
            >
              {isFetchingNextPage ? "Cargando..." : "Cargar más sesiones"}
            </button>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {shareData && (
        <SocialShareModal
          isOpen={!!shareData}
          onClose={() => setShareData(null)}
          date={shareData.date}
          logs={shareData.logs}
          routineTitle={shareData.title}
        />
      )}
    </div>
  );
};

export default LogViewer;
