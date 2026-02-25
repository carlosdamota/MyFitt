import React, { useState } from "react";
import { Trash2, ChevronDown } from "lucide-react";
import type { WorkoutLogEntry } from "../../types";

interface RecentLogsListProps {
  logs: WorkoutLogEntry[];
  exerciseName: string;
  onDelete: (exerciseName: string, entry: WorkoutLogEntry) => Promise<void>;
}

const RecentLogsList: React.FC<RecentLogsListProps> = ({ logs, exerciseName, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (logs.length === 0) return null;

  const displayLogs = logs.slice(0, 5);

  return (
    <div className='mt-4 border-t border-slate-200 dark:border-surface-800/50 pt-3 transition-colors'>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='w-full flex items-center justify-between mb-2 group pl-1'
      >
        <p className='text-[10px] text-primary-400/60 uppercase font-black tracking-widest'>
          Historial Reciente {logs.length > 5 ? "(Últimos 5)" : ""}
        </p>
        <div className='p-1 rounded-md bg-slate-100 dark:bg-surface-800 text-slate-400 group-hover:text-primary-500 transition-colors'>
          <ChevronDown
            size={14}
            className={`transform transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {isExpanded && (
        <div className='space-y-2 mt-3 animate-in fade-in slide-in-from-top-2 duration-200'>
          {displayLogs.map((log, idx) => (
            <div
              key={idx}
              className='flex justify-between items-center bg-slate-50 dark:bg-surface-950/50 p-3 rounded-xl border border-slate-200 dark:border-surface-800/80 hover:border-slate-300 dark:hover:border-surface-700/80 transition-all hover:bg-slate-100 dark:hover:bg-surface-900/50 group'
            >
              <div className='flex flex-col gap-0.5'>
                <span className='text-[9px] text-slate-500 font-bold uppercase tracking-tighter opacity-70 group-hover:opacity-100 transition-opacity'>
                  {new Date(log.date).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
                <span className='text-xs text-slate-600 dark:text-slate-300'>
                  <span className='text-slate-900 dark:text-white font-black'>{log.weight}kg</span>{" "}
                  x <span className='text-primary-500 dark:text-primary-400'>{log.reps}</span> reps{" "}
                  {log.sets ? (
                    <span className='text-slate-500 dark:text-slate-500'> ({log.sets} series)</span>
                  ) : (
                    ""
                  )}
                </span>
              </div>
              <button
                onClick={() => onDelete(exerciseName, log)}
                className='text-danger-500 dark:text-danger-400 hover:text-danger-600 dark:hover:text-danger-300 p-2 hover:bg-red-50 dark:hover:bg-danger-900/20 rounded-lg transition-colors'
                title='Borrar registro'
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentLogsList;
