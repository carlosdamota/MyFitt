import React from "react";
import { Sparkles, Zap } from "lucide-react";
import { useProUpgrade } from "./ProUpgradeContext";

interface ProBannerProps {
  isPro: boolean;
  remaining?: number;
  variant?: "subtle" | "prominent";
}

const ProBanner: React.FC<ProBannerProps> = ({
  isPro,
  remaining,
  variant = "subtle",
}) => {
  const { openProUpgradeModal } = useProUpgrade();

  if (isPro) return null;

  const handleUpgrade = () => openProUpgradeModal("routine_generation");

  if (variant === "prominent") {
    return (
      <div className='rounded-2xl border border-blue-500/30 bg-linear-to-r from-blue-900/30 to-purple-900/30 p-4'>
        <div className='flex items-center gap-3'>
          <div className='p-2 rounded-xl bg-blue-500/20'>
            <Sparkles
              size={20}
              className='text-blue-400'
            />
          </div>
          <div className='flex-1'>
            <p className='text-sm font-bold text-white'>Desbloquea más generaciones con Pro</p>
            <p className='text-xs text-slate-400'>20 rutinas de IA al mes</p>
          </div>
          <button
            onClick={handleUpgrade}
            className='px-4 py-2 rounded-xl bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-bold transition-all'
          >
            Pasar a Pro
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleUpgrade}
      className='w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-linear-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 hover:border-blue-500/40 transition-colors group'
    >
      <Zap
        size={14}
        className='text-blue-400 group-hover:text-blue-300'
      />
      <span className='text-xs font-semibold text-slate-300 group-hover:text-white'>
        {remaining !== undefined && remaining <= 3
          ? `Solo ${remaining} generaciones restantes. `
          : ""}
        Hazte Pro para +20/mes
      </span>
    </button>
  );
};

export default ProBanner;
