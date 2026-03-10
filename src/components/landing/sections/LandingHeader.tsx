import React from "react";
import { useNavigate } from "react-router";
import { User, Chrome } from "lucide-react";
import { Button } from "../../ui/Button";
import { iconLogo } from "../../../branding/logoConfig";

interface LandingHeaderProps {
  user: any | null;
  loading?: boolean;
  onLoginClick: () => void;
  onGoogleLogin: () => Promise<void>;
  onMouseEnter?: () => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({
  user,
  loading = false,
  onLoginClick,
  onGoogleLogin,
  onMouseEnter,
}) => {
  const navigate = useNavigate();

  return (
    <header className='bg-white/80 dark:bg-surface-900/80 backdrop-blur-md border-b border-slate-200 dark:border-surface-800 p-3 md:p-4 fixed top-0 left-0 right-0 z-50 transition-colors'>
      <div className='max-w-6xl mx-auto flex items-center justify-between px-2'>
        {/* Logo */}
        <div className='flex items-center gap-2'>
          <div 
            className='text-lg md:text-xl font-bold flex items-center gap-1 md:gap-2 relative cursor-pointer'
            onClick={() => navigate("/")}
            role="link"
            aria-label="FITTWIZ - Ir al inicio"
          >
            <div className='absolute inset-0 bg-linear-to-r from-cyan-500/20 to-amber-500/20 blur-xl -z-10 animate-pulse' />
            <img
              src={iconLogo.src}
              alt={iconLogo.alt}
              width={24}
              height={24}
              className='w-5 h-5 md:w-6 md:h-6'
              loading='eager'
              fetchPriority='high'
            />
            <span className='text-slate-900 dark:text-white hidden sm:inline font-black italic tracking-tighter text-xl'>
              FITTWIZ
            </span>
            <span className='text-slate-900 dark:text-white sm:hidden font-black italic tracking-tighter'>
              FW
            </span>
          </div>
        </div>

        {/* Auth Actions */}
        <div 
          className='flex items-center gap-3'
          onMouseEnter={onMouseEnter}
        >
          {loading ? (
            // Skeleton mientras Firebase resuelve el estado de auth (evita flash de botones)
            <div className='flex items-center gap-3'>
              <div className='w-16 h-8 rounded-lg bg-slate-200 dark:bg-surface-800 animate-pulse hidden sm:block' />
              <div className='w-24 h-8 rounded-lg bg-slate-200 dark:bg-surface-800 animate-pulse hidden sm:block' />
              <div className='w-16 h-8 rounded-lg bg-slate-200 dark:bg-surface-800 animate-pulse sm:hidden' />
            </div>
          ) : !user ? (
            <>
              <Button
                variant='primary'
                size='sm'
                onClick={onLoginClick}
                className='sm:hidden'
                leftIcon={<User size={16} />}
              >
                Entrar
              </Button>
              <Button
                variant='ghost'
                onClick={onLoginClick}
                className='hidden sm:flex text-slate-600 dark:text-slate-300'
              >
                Entrar
              </Button>
              <div className='h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block' />
              <Button
                variant='secondary'
                className='bg-white text-slate-900 border-none hover:bg-slate-100 hidden sm:flex'
                onClick={async () => {
                  await onGoogleLogin();
                  navigate("/app");
                }}
                leftIcon={<Chrome size={16} />}
              >
                <span>Con Google</span>
              </Button>
            </>
          ) : (
            <Button
              variant='secondary'
              size='sm'
              onClick={() => navigate("/app")}
            >
              Ir al panel
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
