import React from "react";
import { Download, RefreshCw } from "lucide-react";
import { useRegisterSW } from "virtual:pwa-register/react";

const UpdateToast: React.FC = () => {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div className='fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-[380px] z-[100]'>
      <div className='rounded-2xl border border-blue-400/20 bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-blue-900/20 p-4'>
        <div className='flex items-start gap-3'>
          <div className='mt-0.5 rounded-xl p-2 bg-blue-500/15 text-blue-300 border border-blue-400/20'>
            <Download size={18} />
          </div>

          <div className='min-w-0 flex-1'>
            <p className='text-sm font-bold text-white'>Nueva version disponible</p>
            <p className='text-xs text-slate-300 mt-0.5'>
              Actualiza para aplicar las mejoras mas recientes.
            </p>

            <button
              type='button'
              onClick={() => updateServiceWorker(true)}
              className='mt-3 inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-md shadow-blue-900/25 transition-transform hover:-translate-y-0.5 active:translate-y-0'
            >
              <RefreshCw size={14} />
              Actualizar ahora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateToast;
