import React from "react";
import { ChevronLeft, ChevronRight, Calendar, Loader } from "lucide-react";
import MealDetailCard from "./MealDetailCard";
import type { NutritionLogEntry, Ingredient } from "../../types";

interface MealHistoryProps {
  logs: NutritionLogEntry[];
  selectedDate: Date;
  onDateChange: (days: number) => void;
  onDeleteLog: (id: string) => Promise<boolean>;
  onDuplicate: (log: NutritionLogEntry) => Promise<boolean>;
  onEdit: (log: NutritionLogEntry) => void;
  onRefine: (log: NutritionLogEntry) => void;
  loading: boolean;
}

const MealHistory: React.FC<MealHistoryProps> = ({
  logs,
  selectedDate,
  onDateChange,
  onDeleteLog,
  onDuplicate,
  onEdit,
  onRefine,
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
            FITTWIZ Nutrición
          </p>
        </div>
      ) : (
        <div className='space-y-3'>
          {dayLogs.map((log) => (
            <MealDetailCard
              key={log.id}
              id={log.id}
              food={log.food}
              calories={log.calories}
              protein={log.protein}
              carbs={log.carbs}
              fats={log.fats}
              ingredients={log.ingredients}
              canDelete={isToday && !!log.id}
              onDelete={onDeleteLog}
              onDuplicate={() => onDuplicate(log)}
              onEdit={() => onEdit(log)}
              onRefine={() => onRefine(log)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MealHistory;
