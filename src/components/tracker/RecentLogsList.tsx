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
    <div className='mt-4 border-t border-slate-700/50 pt-3'>
      <p className='text-[10px] text-slate-500 uppercase font-bold mb-2 tracking-wider'>
        Últimos registros
      </p>
      <div className='space-y-2'>
        {logs.map((log, idx) => (
          <div
            key={idx}
            className='flex justify-between items-center bg-slate-900/30 p-2.5 rounded-lg border border-slate-700/50 hover:border-slate-600/50 transition-colors'
          >
            <div className='flex flex-col'>
              <span className='text-[10px] text-slate-500 font-mono'>
                {new Date(log.date).toLocaleDateString()}
              </span>
              <span className='text-xs text-slate-200'>
                <span className='text-white font-bold'>{log.weight}kg</span> x {log.reps} reps{" "}
                {log.sets ? `x ${log.sets} sets` : ""}
              </span>
            </div>
            <button
              onClick={() => onDelete(exerciseName, log)}
              className='text-red-400 hover:text-red-300 p-2 hover:bg-red-900/20 rounded-lg transition-colors'
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
