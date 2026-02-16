import React from "react";
import { Lock, Sparkles } from "lucide-react";
import { useProUpgrade } from "./ProUpgradeContext";

interface ProUpgradeProps {
  context?:
    | "general"
    | "nutrition_photo"
    | "routine_generation"
    | "unlimited_usage"
    | "stats"
    | "ai_coach";
  title?: string;
  description?: string;
  buttonText?: string;
  className?: string;
  mini?: boolean; // If true, shows a smaller inline version
  onClick?: () => void;
}

const ProUpgrade: React.FC<ProUpgradeProps> = ({
  context = "general",
  title = "Función Pro",
  description = "Desbloquea esta funcionalidad con el plan Pro.",
  buttonText = "Desbloquear",
  className = "",
  mini = false,
  onClick,
}) => {
  const { openProUpgradeModal } = useProUpgrade();

  const handleClick = () => {
    if (onClick) onClick();
    openProUpgradeModal(context);
  };

  if (mini) {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-linear-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-500 hover:from-amber-500/20 hover:to-orange-500/20 transition-all ${className}`}
      >
        <Lock size={12} />
        <span className='text-xs font-bold'>{buttonText}</span>
      </button>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-slate-900/50 border border-slate-800/50 p-6 flex flex-col items-center justify-center text-center gap-4 group hover:border-amber-500/20 transition-all ${className}`}
    >
      <div className='absolute inset-0 bg-linear-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />

      <div className='p-3 rounded-full bg-slate-800/50 text-slate-400 group-hover:bg-amber-500/10 group-hover:text-amber-500 transition-colors'>
        <Lock size={24} />
      </div>

      <div>
        <h3 className='text-lg font-bold text-white mb-1 flex items-center justify-center gap-2'>
          {title}
          <Sparkles
            size={16}
            className='text-amber-400'
          />
        </h3>
        <p className='text-sm text-slate-400 max-w-xs mx-auto'>{description}</p>
      </div>

      <button
        onClick={handleClick}
        className='px-5 py-2.5 rounded-xl bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-sm shadow-lg shadow-amber-900/20 transition-all hover:-translate-y-0.5 relative z-10'
      >
        {buttonText}
      </button>
    </div>
  );
};

export default ProUpgrade;
