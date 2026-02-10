import React, { useState } from "react";
import { NavLink, Link } from "react-router";
import {
  Cloud,
  BarChart2,
  AlertCircle,
  Flame,
  Utensils,
  User,
  Home,
  LayoutGrid,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import type { User as FirebaseUser } from "firebase/auth";
import { useEntitlement } from "../../hooks/useEntitlement";

interface HeaderProps {
  user: FirebaseUser | null;
  streak: number;
  dbError: string | null;
  authError: string | null;
  onLogin: () => void;
  onLogout: () => void | Promise<void>;
  isPro?: boolean;
}

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: "Home",
    to: "/app",
    icon: (
      <Home
        size={18}
        className='text-cyan-300'
      />
    ),
  },
  {
    label: "Mis Rutinas",
    to: "/app/routines",
    icon: (
      <LayoutGrid
        size={18}
        className='text-slate-300'
      />
    ),
  },
  {
    label: "Nutrición",
    to: "/app/nutrition",
    icon: (
      <Utensils
        size={18}
        className='text-amber-300'
      />
    ),
  },
  {
    label: "IA Coach",
    to: "/app/coach",
    icon: (
      <Sparkles
        size={18}
        className='text-emerald-300'
      />
    ),
  },
  {
    label: "Estadísticas",
    to: "/app/stats",
    icon: (
      <BarChart2
        size={18}
        className='text-indigo-300'
      />
    ),
  },
  {
    label: "Perfil",
    to: "/app/profile",
    icon: (
      <User
        size={18}
        className='text-slate-200'
      />
    ),
  },
];

const Header: React.FC<HeaderProps> = ({
  user,
  streak,
  dbError,
  authError,
  onLogin,
  onLogout,
  isPro,
}) => {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const { plan: hookPlan, currentPeriodEnd } = useEntitlement(user);

  const plan = isPro !== undefined ? (isPro ? "pro" : "free") : hookPlan;
  const renewalLabel = currentPeriodEnd ? new Date(currentPeriodEnd).toLocaleDateString() : "";

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? "text-white bg-slate-800 shadow-inner"
        : "text-slate-300 hover:text-white hover:bg-slate-800/70"
    }`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-colors ${
      isActive
        ? "text-white bg-slate-800 shadow-inner"
        : "text-slate-200 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <>
      <header className='bg-slate-900/80 backdrop-blur-md border-b border-slate-800 p-3 md:p-4 sticky top-0 z-20'>
        <div className='flex justify-between items-center'>
          {/* Logo & Streak */}
          <div className='flex items-center gap-3'>
            <div>
              <Link
                to='/app'
                className='text-lg md:text-xl font-bold flex items-center gap-1 md:gap-2 relative hover:opacity-80 transition-opacity'
              >
                <div className='absolute inset-0 bg-linear-to-r from-cyan-500/20 to-amber-500/20 blur-2xl -z-10 animate-pulse' />
                <img
                  src='/favicon.svg'
                  alt='FitForge Logo'
                  className='w-5 h-5 md:w-6 md:h-6'
                />
                <span className='text-white hidden sm:inline'>FitForge</span>
                <span className='text-white sm:hidden'>FM</span>
              </Link>
              {streak > 0 && (
                <div className='flex items-center gap-1 mt-1'>
                  <Flame
                    size={12}
                    className='text-orange-500 fill-orange-500/20'
                  />
                  <span className='text-[10px] font-bold text-orange-400 uppercase tracking-wide'>
                    {streak} días racha
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className='hidden lg:flex items-center gap-1'>
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.to === "/app"}
                className={linkClass}
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right side: Status + Auth + Mobile Menu */}
          <div className='flex gap-2 items-center'>
            {/* Connection status */}
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

            {user && plan && (
              <div
                className='hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900/70 text-[10px] uppercase tracking-wider text-slate-300'
                title={
                  plan === "pro"
                    ? renewalLabel
                      ? `Renueva el ${renewalLabel}`
                      : "Renueva automaticamente"
                    : "Plan gratuito"
                }
              >
                <span className={plan === "pro" ? "text-cyan-300" : "text-slate-400"}>
                  {plan === "pro" ? "PRO" : "FREE"}
                </span>
                {plan === "pro" && renewalLabel && (
                  <span className='text-slate-400'>Renueva {renewalLabel}</span>
                )}
              </div>
            )}

            {/* Auth buttons */}
            {!user && (
              <button
                onClick={onLogin}
                className='text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-3 py-1.5 rounded-xl transition-colors hidden sm:flex items-center gap-1'
              >
                <User size={12} /> Iniciar sesión
              </button>
            )}
            {user && (
              <button
                onClick={onLogout}
                className='text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl transition-colors hidden sm:block'
              >
                Salir
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(true)}
              className='p-2 bg-slate-800 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors lg:hidden'
              aria-label='Abrir menú'
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className='fixed inset-0 z-50 lg:hidden'
          onClick={() => setMobileOpen(false)}
        >
          <div className='absolute inset-0 bg-black/60 backdrop-blur-sm' />
        </div>
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-slate-900 border-r border-slate-800 z-50 transform transition-transform duration-300 ease-out lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className='p-4 border-b border-slate-800 flex justify-between items-center'>
          <div className='flex items-center gap-2'>
            <img
              src='/favicon.svg'
              alt='FitForge Logo'
              className='w-6 h-6'
            />
            <span className='text-lg font-bold text-white'>FitForge</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className='p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors'
            aria-label='Cerrar menú'
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <nav className='p-4 space-y-2'>
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === "/app"}
              className={mobileLinkClass}
              onClick={() => setMobileOpen(false)}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer - Auth */}
        <div className='absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800'>
          {!user && (
            <button
              onClick={() => {
                onLogin();
                setMobileOpen(false);
              }}
              className='w-full py-3 rounded-xl font-bold text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-900 transition-colors flex items-center justify-center gap-2'
            >
              <User size={16} /> Iniciar sesión
            </button>
          )}
          {user && (
            <button
              onClick={() => {
                onLogout();
                setMobileOpen(false);
              }}
              className='w-full py-3 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors'
            >
              Cerrar sesión
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Header;
