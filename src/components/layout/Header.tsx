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
import { iconLogo } from "../../branding/logoConfig";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";

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
        className='text-cyan-600 dark:text-cyan-300'
      />
    ),
  },
  {
    label: "Mis Rutinas",
    to: "/app/routines",
    icon: (
      <LayoutGrid
        size={18}
        className='text-slate-500 dark:text-slate-300'
      />
    ),
  },
  {
    label: "Nutrición",
    to: "/app/nutrition",
    icon: (
      <Utensils
        size={18}
        className='text-amber-600 dark:text-amber-300'
      />
    ),
  },
  {
    label: "IA Coach",
    to: "/app/coach",
    icon: (
      <Sparkles
        size={18}
        className='text-emerald-600 dark:text-emerald-300'
      />
    ),
  },
  {
    label: "Estadísticas",
    to: "/app/stats",
    icon: (
      <BarChart2
        size={18}
        className='text-indigo-600 dark:text-indigo-300'
      />
    ),
  },
  {
    label: "Perfil",
    to: "/app/profile",
    icon: (
      <User
        size={18}
        className='text-slate-500 dark:text-slate-200'
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
        ? "text-slate-900 dark:text-white bg-slate-100 dark:bg-surface-800 shadow-sm dark:shadow-inner"
        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-800/70"
    }`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-colors ${
      isActive
        ? "text-slate-900 dark:text-white bg-slate-100 dark:bg-surface-800 shadow-sm dark:shadow-inner"
        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-surface-800 hover:text-slate-900 dark:hover:text-white"
    }`;

  return (
    <>
      <header className='bg-white/80 dark:bg-surface-900/80 backdrop-blur-md border-b border-slate-200 dark:border-surface-800 p-3 md:p-4 sticky top-0 z-20 transition-colors'>
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
                  src={iconLogo.src}
                  alt={iconLogo.alt}
                  className='w-5 h-5 md:w-6 md:h-6'
                />
                <span className='text-slate-900 dark:text-white hidden sm:inline font-black italic tracking-tighter text-xl transition-colors'>
                  FITTWIZ
                </span>
                <span className='text-slate-900 dark:text-white sm:hidden font-black italic tracking-tighter transition-colors'>
                  FW
                </span>
              </Link>
              {streak > 0 && (
                <div className='flex items-center gap-1 mt-1'>
                  <Flame
                    size={12}
                    className='text-orange-500 fill-orange-500/20'
                  />
                  <span className='text-[10px] font-bold text-orange-400 uppercase tracking-wide'>
                    {streak} {streak === 1 ? "semana" : "semanas"} racha
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
                className={
                  user ? "text-green-500 dark:text-green-400" : "text-slate-400 dark:text-slate-600"
                }
                aria-label={user ? "Conectado" : "Desconectado"}
              />
            </div>

            {user && plan && (
              <Badge
                variant={plan === "pro" ? "primary" : "outline"}
                className='hidden sm:inline-flex uppercase tracking-wider'
                title={
                  plan === "pro"
                    ? renewalLabel
                      ? `Renueva el ${renewalLabel}`
                      : "Renueva automaticamente"
                    : "Plan gratuito"
                }
              >
                {plan === "pro" ? "PRO" : "FREE"}
                {plan === "pro" && renewalLabel && (
                  <span className='ml-1 opacity-70'>Renueva {renewalLabel}</span>
                )}
              </Badge>
            )}

            {/* Auth buttons */}
            {!user && (
              <Button
                variant='primary'
                size='sm'
                onClick={onLogin}
                className='hidden sm:flex'
                leftIcon={<User size={14} />}
              >
                Iniciar sesión
              </Button>
            )}
            {user && (
              <Button
                variant='secondary'
                size='sm'
                onClick={onLogout}
                className='hidden sm:flex'
              >
                Salir
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant='secondary'
              size='icon'
              onClick={() => setMobileOpen(true)}
              className='lg:hidden bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-surface-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shrink-0 transition-colors'
              aria-label='Abrir menú'
            >
              <Menu size={20} />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className='fixed inset-0 z-50 lg:hidden'
          onClick={() => setMobileOpen(false)}
        >
          <div className='absolute inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm' />
        </div>
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-surface-900 border-r border-slate-200 dark:border-surface-800 z-50 transform transition-transform duration-300 ease-out lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className='p-4 border-b border-slate-200 dark:border-surface-800 flex justify-between items-center transition-colors'>
          <div className='flex items-center gap-2'>
            <img
              src={iconLogo.src}
              alt={iconLogo.alt}
              className='w-6 h-6'
            />
            <span className='text-lg font-black italic tracking-tighter text-slate-900 dark:text-white transition-colors'>
              FITTWIZ
            </span>
          </div>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setMobileOpen(false)}
            aria-label='Cerrar menú'
            className='w-10 h-10'
          >
            <X size={20} />
          </Button>
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
        <div className='absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-surface-800 bg-white dark:bg-surface-900 transition-colors'>
          {!user && (
            <Button
              variant='primary'
              className='w-full justify-center'
              onClick={() => {
                onLogin();
                setMobileOpen(false);
              }}
              leftIcon={<User size={16} />}
            >
              Iniciar sesión
            </Button>
          )}
          {user && (
            <Button
              variant='secondary'
              className='w-full justify-center'
              onClick={() => {
                onLogout();
                setMobileOpen(false);
              }}
            >
              Cerrar sesión
            </Button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Header;
