import React, { useState } from "react";
import { X, Cookie, Shield, BarChart3 } from "lucide-react";
import type { CookieConsent } from "../../types";

interface CookieSettingsProps {
  currentConsent: CookieConsent;
  onSave: (consent: Partial<CookieConsent>) => void;
  onClose: () => void;
}

const CookieSettings: React.FC<CookieSettingsProps> = ({ currentConsent, onSave, onClose }) => {
  const [analytics, setAnalytics] = useState<boolean>(currentConsent.analytics);

  const handleSave = (): void => {
    onSave({ analytics });
    onClose();
  };

  return (
    <div className='fixed inset-0 z-400 flex items-center justify-center p-4 bg-surface-950/80 backdrop-blur-sm animate-in fade-in duration-300'>
      <div className='bg-surface-900 border border-surface-800 rounded-2xl p-6 max-w-2xl mx-4 animate-in zoom-in-95 duration-200 shadow-2xl max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-start gap-3 mb-6'>
          <div className='p-2 bg-blue-600/20 rounded-lg'>
            <Cookie
              size={24}
              className='text-blue-400'
            />
          </div>
          <div className='flex-1'>
            <h2 className='text-xl font-bold text-white mb-1'>Configuración de Cookies</h2>
            <p className='text-sm text-slate-400'>Personaliza qué cookies quieres permitir</p>
          </div>
          <button
            onClick={onClose}
            className='text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded'
          >
            <X size={20} />
          </button>
        </div>

        {/* Cookie Types */}
        <div className='space-y-4 mb-6'>
          {/* Essential Cookies */}
          <div className='bg-surface-950 border border-surface-800 rounded-lg p-4'>
            <div className='flex items-start justify-between gap-4'>
              <div className='flex items-start gap-3 flex-1'>
                <div className='p-2 bg-green-600/20 rounded-lg'>
                  <Shield
                    size={20}
                    className='text-green-400'
                  />
                </div>
                <div>
                  <h3 className='text-sm font-bold text-white mb-1'>Cookies Esenciales</h3>
                  <p className='text-xs text-slate-400 leading-relaxed'>
                    Necesarias para el funcionamiento básico de la app (autenticación, sesión). No
                    se pueden desactivar.
                  </p>
                  <div className='mt-2 text-xs text-slate-500'>
                    <strong>Ejemplos:</strong> Firebase Auth, sesión de usuario
                  </div>
                </div>
              </div>
              <div className='shrink-0'>
                <div className='px-3 py-1 bg-green-900/30 text-green-300 text-xs font-bold rounded-full border border-green-700'>
                  Siempre activas
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Cookies */}
          <div className='bg-surface-950 border border-surface-800 rounded-lg p-4'>
            <div className='flex items-start justify-between gap-4'>
              <div className='flex items-start gap-3 flex-1'>
                <div className='p-2 bg-blue-600/20 rounded-lg'>
                  <BarChart3
                    size={20}
                    className='text-blue-400'
                  />
                </div>
                <div>
                  <h3 className='text-sm font-bold text-white mb-1'>Cookies Analíticas</h3>
                  <p className='text-xs text-slate-400 leading-relaxed'>
                    Nos ayudan a entender cómo usas la app para mejorarla. Datos anónimos procesados
                    por Google Analytics.
                  </p>
                  <div className='mt-2 text-xs text-slate-500'>
                    <strong>Ejemplos:</strong> Páginas visitadas, tiempo de uso, funciones más
                    usadas
                  </div>
                </div>
              </div>
              <div className='shrink-0'>
                <label className='relative inline-flex items-center cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className='sr-only peer'
                  />
                  <div className="w-11 h-6 bg-surface-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className='bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 mb-6'>
          <p className='text-xs text-blue-200'>
            💡 <strong>Tu privacidad es importante.</strong> Puedes cambiar estas preferencias en
            cualquier momento desde el footer de la app.
          </p>
        </div>

        {/* Actions */}
        <div className='flex gap-3'>
          <button
            onClick={onClose}
            className='flex-1 py-2.5 rounded-xl font-bold text-sm bg-surface-800 hover:bg-surface-700 text-white border border-surface-700 transition-colors'
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className='flex-1 py-2.5 rounded-xl font-bold text-sm bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-900/40 transition-all active:scale-95'
          >
            Guardar Preferencias
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieSettings;
