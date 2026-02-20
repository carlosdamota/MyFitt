import React from "react";
import { Trash2 } from "lucide-react";
import type { WorkoutLogEntry } from "../../types";

interface RecentLogsListProps {
  logs: WorkoutLogEntry[];
  exerciseName: string;
  onDelete: (exerciseName: string, entry: WorkoutLogEntry) => Promise<void>;
}

const RecentLogsList: React.FC<RecentLogsListProps> = ({ logs, exerciseName, onDelete }) => {
  if (logs.length === 0) return null;

  return (
    <div className='mt-4 border-t border-surface-800/50 pt-3'>
      <p className='text-[10px] text-primary-400/60 uppercase font-black mb-3 tracking-widest pl-1'>
        Historial Reciente
      </p>
      <div className='space-y-2'>
        {logs.map((log, idx) => (
          <div
            key={idx}
            className='flex justify-between items-center bg-surface-950/50 p-3 rounded-xl border border-surface-800/80 hover:border-surface-700/80 transition-all hover:bg-surface-900/50 group'
          >
            <div className='flex flex-col gap-0.5'>
              <span className='text-[9px] text-slate-500 font-bold uppercase tracking-tighter opacity-70 group-hover:opacity-100 transition-opacity'>
                {new Date(log.date).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "short",
                })}
              </span>
              <span className='text-xs text-slate-300'>
                <span className='text-white font-black'>{log.weight}kg</span> x{" "}
                <span className='text-primary-400'>{log.reps}</span> reps{" "}
                {log.sets ? <span className='text-slate-500'> ({log.sets} series)</span> : ""}
              </span>
            </div>
            <button
              onClick={() => onDelete(exerciseName, log)}
              className='text-danger-400 hover:text-danger-300 p-2 hover:bg-danger-900/20 rounded-lg transition-colors'
              title='Borrar registro'
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentLogsList;
