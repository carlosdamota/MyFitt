import React from "react";
import { Crown } from "lucide-react";

interface ProUpgradeCtaProps {
  onRequireAuth?: () => void;
  onShowSubscription?: () => void;
}

const ProUpgradeCta: React.FC<ProUpgradeCtaProps> = ({ onRequireAuth, onShowSubscription }) => {
  return (
    <div className='mb-6 p-1 rounded-2xl bg-linear-to-r from-amber-500/20 via-orange-500/20 to-red-500/20'>
      <div className='bg-slate-900/90 backdrop-blur-sm rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <div className='flex items-center gap-4'>
          <div className='p-3 rounded-2xl bg-linear-to-br from-amber-500/20 to-orange-600/20 text-amber-400 shadow-inner border border-amber-500/10'>
            <Crown size={24} />
          </div>
          <div>
            <p className='text-base font-bold text-white mb-0.5'>Desbloquea el Modo Pro</p>
            <p className='text-xs text-slate-400'>
              Accede a rutinas avanzadas, métricas detalladas y tu IA Coach.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            if (onShowSubscription) {
              onShowSubscription();
            } else {
              onRequireAuth?.();
            }
          }}
          className='px-6 py-3 rounded-xl text-sm font-bold bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-0.5'
        >
          Mejorar Plan
        </button>
      </div>
    </div>
  );
};

export default ProUpgradeCta;
