import React from "react";
import { ChevronLeft, ChevronRight, Calendar, Trash2, Loader } from "lucide-react";

interface Meal {
  id?: string;
  food: string;
  date: string;
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
}

interface MealHistoryProps {
  logs: Meal[];
  selectedDate: Date;
  onDateChange: (days: number) => void;
  onDeleteLog: (id: string) => Promise<boolean>;
  loading: boolean;
}

const MealHistory: React.FC<MealHistoryProps> = ({
  logs,
  selectedDate,
  onDateChange,
  onDeleteLog,
  loading,
}) => {
  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const dayLogs = logs.filter(
    (l) => new Date(l.date).toDateString() === selectedDate.toDateString(),
  );

  return (
    <div className='space-y-4'>
      {/* Date Navigator */}
      <div className='bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex items-center justify-between shadow-lg'>
        <button
          onClick={() => onDateChange(-1)}
          className='p-2 hover:bg-slate-800 rounded-xl transition-all active:scale-90 text-slate-400 hover:text-white'
        >
          <ChevronLeft size={20} />
        </button>
        <div className='flex items-center gap-3'>
          <div className='bg-blue-500/10 p-2 rounded-lg border border-blue-500/20'>
            <Calendar
              size={18}
              className='text-blue-400'
            />
          </div>
          <span className='text-sm font-bold text-white tracking-wide'>
            {isToday
              ? "HOY"
              : selectedDate
                  .toLocaleDateString("es-ES", { day: "numeric", month: "long" })
                  .toUpperCase()}
          </span>
        </div>
        <button
          onClick={() => onDateChange(1)}
          disabled={isToday}
          className='p-2 hover:bg-slate-800 rounded-xl transition-all active:scale-90 disabled:opacity-20 text-slate-400 hover:text-white'
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Meal List */}
      <h3 className='text-xs font-bold text-slate-500 uppercase px-1 tracking-widest flex items-center gap-2'>
        <span className='w-1 h-1 bg-slate-500 rounded-full' /> Comidas Registradas
      </h3>

      {loading ? (
        <div className='flex flex-col items-center justify-center py-10 text-slate-600 gap-3'>
          <Loader
            className='animate-spin'
            size={24}
          />
          <span className='text-xs font-medium'>Sincronizando diario...</span>
        </div>
      ) : dayLogs.length === 0 ? (
        <div className='bg-slate-900/30 rounded-2xl border border-dashed border-slate-800 py-10 flex flex-col items-center justify-center gap-2'>
          <p className='text-slate-600 text-sm font-medium italic'>Nada registrado para este día</p>
          <p className='text-[10px] text-slate-700 uppercase font-bold tracking-tighter'>
            FitForge Nutrición
          </p>
        </div>
      ) : (
        <div className='space-y-3'>
          {dayLogs.map((log) => (
            <div
              key={log.id}
              className='bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex justify-between items-center animate-in slide-in-from-bottom-2 duration-300 hover:border-slate-700 transition-colors group'
            >
              <div className='flex-1'>
                <h4 className='font-bold text-slate-200 text-sm group-hover:text-white transition-colors'>
                  {log.food}
                </h4>
                <div className='flex gap-4 text-[11px] text-slate-500 mt-1.5 font-mono font-bold'>
                  <span className='text-blue-500/80 flex items-center gap-1'>
                    <span className='w-1 h-1 bg-blue-500 rounded-full' /> {log.protein}p
                  </span>
                  <span className='text-purple-500/80 flex items-center gap-1'>
                    <span className='w-1 h-1 bg-purple-500 rounded-full' /> {log.carbs}c
                  </span>
                  <span className='text-yellow-500/80 flex items-center gap-1'>
                    <span className='w-1 h-1 bg-yellow-500 rounded-full' /> {log.fats}f
                  </span>
                  <span className='text-white ml-auto bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800'>
                    {log.calories} KCAL
                  </span>
                </div>
              </div>
              {isToday && log.id && (
                <button
                  onClick={() => onDeleteLog(log.id!)}
                  className='ml-4 text-slate-700 hover:text-red-400 p-2.5 hover:bg-red-900/10 rounded-xl transition-all opacity-40 group-hover:opacity-100'
                  title='Borrar comida'
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MealHistory;
