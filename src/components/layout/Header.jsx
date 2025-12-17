import React from 'react';
import { Activity, Cloud, BarChart2, AlertCircle, Flame, Utensils, User } from 'lucide-react';

/**
 * Application header with navigation and status indicators.
 * @param {object} props
 * @param {object} props.user - Current user object.
 * @param {number} props.streak - Current workout streak.
 * @param {string} [props.dbError] - Database error message.
 * @param {string} [props.authError] - Authentication error message.
 * @param {function} props.onShowProfile - Callback to show profile modal.
 * @param {function} props.onShowNutrition - Callback to show nutrition modal.
 * @param {function} props.onShowStats - Callback to show stats modal.
 */
const Header = ({ user, streak, dbError, authError, onShowProfile, onShowNutrition, onShowStats }) => {
  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 p-3 md:p-4 sticky top-0 z-20 flex justify-between items-center">
      <div>
        <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-1 md:gap-2">
          <Activity size={18} className="text-blue-400 md:w-[22px] md:h-[22px]" />
          <span className="hidden xs:inline">FitManual</span>
          <span className="xs:hidden">FM</span>
          <span className="hidden sm:inline text-xs bg-blue-900 text-blue-200 px-1.5 py-0.5 rounded border border-blue-800">Cloud</span>
        </h1>
        {streak > 0 && (
          <div className="flex items-center gap-1 mt-1 animate-in slide-in-from-left-2">
            <Flame size={12} className="text-orange-500 fill-orange-500/20" />
            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wide">
              <span className="hidden xs:inline">{streak} Días Racha</span>
              <span className="xs:hidden">{streak}d</span>
            </span>
          </div>
        )}
      </div>
      <div className="flex gap-2 md:gap-3 items-center">
        <div className="flex items-center gap-1">
          {(dbError || authError) && <AlertCircle size={16} className="text-red-500" aria-label="Error de conexión" />}
          <Cloud size={16} className={user ? "text-green-400" : "text-slate-600"} aria-label={user ? "Conectado" : "Desconectado"} />
        </div>
        <button
          onClick={onShowProfile}
          className="p-1.5 md:p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors"
          aria-label="Abrir perfil"
        >
          <User size={16} className="md:w-[18px] md:h-[18px]" />
        </button>
        <button
          onClick={onShowNutrition}
          className="p-1.5 md:p-2 bg-slate-800 rounded-full text-green-400 hover:bg-slate-700 border border-slate-700 transition-colors"
          aria-label="Abrir nutrición"
        >
          <Utensils size={16} className="md:w-[18px] md:h-[18px]" />
        </button>
        <button
          onClick={onShowStats}
          className="p-1.5 md:p-2 bg-slate-800 rounded-full text-blue-400 hover:bg-slate-700 border border-slate-700 transition-colors"
          aria-label="Abrir estadísticas"
        >
          <BarChart2 size={16} className="md:w-[18px] md:h-[18px]" />
        </button>
      </div>
    </header>
  );
};

export default Header;
