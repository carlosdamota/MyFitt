import React, { useMemo } from "react";
import { FileText, Download, Share2, Calendar } from "lucide-react";
import { isBodyweightExercise } from "../../utils/stats";
import type { WorkoutLogs, WorkoutLogEntry } from "../../types";
import { SocialShareModal } from "../common/SocialShareModal";

interface LogViewerProps {
  logs: WorkoutLogs;
  userWeight: string | number;
}

interface FlatLogEntry extends WorkoutLogEntry {
  exercise: string;
  volume: number;
}

const LogViewer: React.FC<LogViewerProps> = ({ logs, userWeight }) => {
  const flatLogs = useMemo(() => {
    let allLogs: FlatLogEntry[] = [];
    Object.entries(logs).forEach(([exercise, entries]) => {
      entries.forEach((entry) => {
        const weight = parseFloat(String(entry.weight)) || 0;
        const volume = weight * (entry.reps || 0) * (entry.sets || 0);
        allLogs.push({ exercise, ...entry, volume });
      });
    });
    return allLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [logs, userWeight]);

  const groupedByDate = useMemo(() => {
    const groups: Record<string, FlatLogEntry[]> = {};
    flatLogs.forEach((log) => {
      const dateKey = log.date.split("T")[0];
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(log);
    });
    return groups;
  }, [flatLogs]);

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

  const [shareData, setShareData] = React.useState<{ date: string; logs: FlatLogEntry[] } | null>(
    null,
  );

  const handleExportCSV = (): void => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Fecha,Ejercicio,Peso (kg),Reps,Series,Volumen Total\n";
    flatLogs.forEach((log) => {
      const date = new Date(log.date).toLocaleDateString();
      const row = `${date},${log.exercise},${log.weight},${log.reps},${log.sets},${log.volume}`;
      csvContent += row + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "historial_entrenamiento.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-xs text-slate-400 font-bold uppercase flex items-center gap-2 tracking-wider'>
          <FileText
            size={14}
            className='text-emerald-400'
          />{" "}
          Diario Detallado
        </h3>
        <button
          onClick={handleExportCSV}
          className='text-[10px] bg-emerald-600/80 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all active:scale-95'
        >
          <Download size={12} /> CSV
        </button>
      </div>

      <div className='space-y-3'>
        {Object.keys(groupedByDate).length === 0 && (
          <p className='text-center text-slate-500 text-xs py-8'>No hay registros aún.</p>
        )}

        {Object.entries(groupedByDate).map(([date, daysLogs]) => {
          const dailyVolume = daysLogs.reduce((acc, l) => acc + l.volume, 0);
          return (
            <div
              key={date}
              className='bg-surface-900 rounded-3xl border border-surface-800 shadow-xl overflow-hidden relative'
            >
              {/* Date Header */}
              <div className='flex items-center justify-between px-5 py-3 bg-surface-800/30 border-b border-surface-800'>
                <div className='flex items-center gap-2'>
                  <Calendar
                    size={14}
                    className='text-slate-400'
                  />
                  <span className='text-slate-200 font-bold text-sm'>{formatDate(date)}</span>
                </div>
                <div className='flex items-center gap-3'>
                  <span className='text-[10px] text-slate-500 font-mono'>
                    {daysLogs.length} ej.
                  </span>
                  <button
                    onClick={() => setShareData({ date, logs: daysLogs })}
                    className='text-primary-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-primary-500/20'
                    title='Compartir'
                  >
                    <Share2 size={14} />
                  </button>
                </div>
              </div>

              {/* Exercise Rows */}
              <div className='divide-y divide-surface-800/50'>
                {daysLogs.map((log, i) => (
                  <div
                    key={i}
                    className='flex items-center gap-4 px-5 py-3.5 hover:bg-surface-800/30 transition-colors'
                  >
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-semibold text-slate-200 truncate'>
                        {log.exercise}
                      </p>
                      <p className='text-[11px] text-slate-400 font-medium mt-0.5'>
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

              {/* Daily Footer */}
              <div className='flex items-center justify-between px-5 py-3.5 bg-surface-950/50 border-t border-surface-800/50'>
                <span className='text-[10px] text-slate-500 uppercase font-bold tracking-widest'>
                  Vol. Diario
                </span>
                <span className='text-sm font-black text-white font-mono'>
                  {dailyVolume >= 1000 ? `${(dailyVolume / 1000).toFixed(1)}k` : dailyVolume}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Share Modal */}
      {shareData && (
        <SocialShareModal
          isOpen={!!shareData}
          onClose={() => setShareData(null)}
          date={shareData.date}
          logs={shareData.logs}
        />
      )}
    </div>
  );
};

export default LogViewer;
