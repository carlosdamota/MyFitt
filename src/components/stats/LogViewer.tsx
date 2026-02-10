import React, { useMemo } from "react";
import { FileText, Download, Share2 } from "lucide-react";
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
  // Aplanar logs para una visualización sencilla
  const flatLogs = useMemo(() => {
    let allLogs: FlatLogEntry[] = [];
    Object.entries(logs).forEach(([exercise, entries]) => {
      entries.forEach((entry) => {
        const weight = parseFloat(String(entry.weight)) || 0;
        // Volumen real (Tonelaje)
        const volume = weight * (entry.reps || 0) * (entry.sets || 0);

        allLogs.push({
          exercise,
          ...entry,
          volume,
        });
      });
    });
    // Ordenar por fecha descendente
    return allLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [logs, userWeight]);

  // Agrupar por Fecha
  const groupedByDate = useMemo(() => {
    const groups: Record<string, FlatLogEntry[]> = {};
    flatLogs.forEach((log) => {
      const dateKey = new Date(log.date).toLocaleDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(log);
    });
    return groups;
  }, [flatLogs]);

  const [shareData, setShareData] = React.useState<{ date: string; logs: FlatLogEntry[] } | null>(
    null,
  );

  const handleExportCSV = (): void => {
    // Encabezado CSV
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
    <div className='mt-4'>
      <div className='flex justify-between items-center mb-4'>
        <h3 className='text-sm text-slate-400 font-bold uppercase flex items-center gap-2'>
          <FileText size={14} /> Diario Detallado
        </h3>
        <button
          onClick={handleExportCSV}
          className='text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 font-bold transition-colors'
        >
          <Download size={12} /> Descargar CSV
        </button>
      </div>

      <div className='space-y-4'>
        {Object.keys(groupedByDate).length === 0 && (
          <p className='text-center text-slate-500 text-xs py-4'>No hay registros aún.</p>
        )}

        {Object.entries(groupedByDate).map(([date, daysLogs]) => (
          <div
            key={date}
            className='bg-slate-900 rounded-lg border border-slate-800 overflow-hidden'
          >
            <div className='bg-slate-800/50 px-3 py-2 border-b border-slate-800 flex justify-between items-center'>
              <span className='text-slate-300 font-bold text-xs'>{date}</span>
              <div className='flex items-center gap-3'>
                <span className='text-[10px] text-slate-500 font-mono'>
                  {daysLogs.length} Ejercicios
                </span>
                <button
                  onClick={() => setShareData({ date, logs: daysLogs })}
                  className='text-blue-400 hover:text-blue-300 transition-colors p-1'
                  title='Compartir en Redes'
                >
                  <Share2 size={14} />
                </button>
              </div>
            </div>
            <div className='divide-y divide-slate-800'>
              {daysLogs.map((log, i) => (
                <div
                  key={i}
                  className='grid grid-cols-12 gap-2 p-2 text-xs items-center hover:bg-slate-800/30 transition-colors'
                >
                  <div className='col-span-5 font-medium text-slate-200 truncate'>
                    {log.exercise}
                  </div>
                  <div className='col-span-3 text-right text-slate-400'>
                    {log.weight}kg <span className='text-slate-600'>x</span> {log.reps}
                  </div>
                  <div className='col-span-2 text-right text-slate-400'>{log.sets} series</div>
                  <div className='col-span-2 text-right font-mono'>
                    {log.volume > 0 ? (
                      <span className='text-blue-400'>{log.volume}</span>
                    ) : (
                      <span className='text-emerald-400'>
                        {log.reps ? log.reps * (log.sets || 1) : 0} reps
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className='bg-slate-950/30 px-3 py-1.5 text-right border-t border-slate-800'>
              <span className='text-[10px] text-slate-500 uppercase mr-2'>Volumen Diario:</span>
              <span className='text-xs font-bold text-white'>
                {daysLogs.reduce((acc, l) => acc + l.volume, 0)}
              </span>
            </div>
          </div>
        ))}
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
