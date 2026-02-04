import React from "react";
import {
  Activity,
  Cloud,
  BarChart2,
  AlertCircle,
  Flame,
  Utensils,
  User,
  Dumbbell,
} from "lucide-react";
import type { User as FirebaseUser } from "firebase/auth";

interface HeaderProps {
  user: FirebaseUser | null;
  streak: number;
  dbError: string | null;
  authError: string | null;
  onShowProfile: () => void;
  onShowNutrition: () => void;
  onShowRoutines: () => void;
  onShowStats: () => void;
  onLogin: () => void;
  guestMode: boolean;
}

const Header: React.FC<HeaderProps> = ({
  user,
  streak,
  dbError,
  authError,
  onShowProfile,
  onShowNutrition,
  onShowRoutines,
  onShowStats,
  onLogin,
  guestMode,
}) => {
  return (
    <header className='bg-slate-900/80 backdrop-blur-md border-b border-slate-800 p-3 md:p-4 sticky top-0 z-20 flex justify-between items-center'>
      <div className='flex items-center gap-3'>
        <div>
          <h1 className='text-lg md:text-xl font-bold bg-clip-text text-transparent flex items-center gap-1 md:gap-2 relative'>
            <div className='absolute inset-0 bg-linear-to-r from-blue-500/20 to-purple-500/20 blur-2xl -z-10 animate-pulse' />
            <Activity
              size={18}
              className='text-blue-400 md:w-[22px] md:h-[22px]'
            />
            <span className='hidden xs:inline'>FitManual</span>
            <span className='xs:hidden'>FM</span>
          </h1>
          {streak > 0 && (
            <div className='flex items-center gap-1 mt-1 animate-in slide-in-from-left-2'>
              <Flame
                size={12}
                className='text-orange-500 fill-orange-500/20'
              />
              <span className='text-[10px] font-bold text-orange-400 uppercase tracking-wide'>
                <span className='hidden xs:inline'>{streak} Días Racha</span>
                <span className='xs:hidden'>{streak}d</span>
              </span>
            </div>
          )}
        </div>

        {guestMode && !user && (
          <button
            onClick={onLogin}
            className='text-[10px] font-bold bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded-lg transition-colors flex items-center gap-1'
          >
            <User size={10} /> INICIAR SESIÓN
          </button>
        )}
      </div>
      <div className='flex gap-2 md:gap-3 items-center'>
        <div className='flex items-center gap-1'>
          {(dbError || authError) && (
            <AlertCircle
              size={16}
              className='text-red-500'
              aria-label='Error de conexión'
            />
          )}
          <Cloud
            size={16}
            className={user ? "text-green-400" : "text-slate-600"}
            aria-label={user ? "Conectado" : "Desconectado"}
          />
        </div>
        <button
          onClick={onShowProfile}
          className='p-1.5 md:p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors'
          aria-label='Abrir perfil'
        >
          <User
            size={16}
            className='md:w-[18px] md:h-[18px]'
          />
        </button>
        <button
          onClick={onShowRoutines}
          className='p-1.5 md:p-2 bg-slate-800 rounded-full text-purple-400 hover:bg-slate-700 border border-slate-700 transition-colors'
          aria-label='Abrir rutinas'
        >
          <Dumbbell
            size={16}
            className='md:w-[18px] md:h-[18px]'
          />
        </button>
        <button
          onClick={onShowNutrition}
          className='p-1.5 md:p-2 bg-slate-800 rounded-full text-green-400 hover:bg-slate-700 border border-slate-700 transition-colors'
          aria-label='Abrir nutrición'
        >
          <Utensils
            size={16}
            className='md:w-[18px] md:h-[18px]'
          />
        </button>
        <button
          onClick={onShowStats}
          className='p-1.5 md:p-2 bg-slate-800 rounded-full text-blue-400 hover:bg-slate-700 border border-slate-700 transition-colors'
          aria-label='Abrir estadísticas'
        >
          <BarChart2
            size={16}
            className='md:w-[18px] md:h-[18px]'
          />
        </button>
      </div>
    </header>
  );
};

export default Header;
