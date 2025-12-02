import React from 'react';
import { Cookie, X, Settings } from 'lucide-react';

/**
 * Banner de consentimiento de cookies (GDPR compliant)
 * @param {function} onAcceptAll - Callback al aceptar todas las cookies
 * @param {function} onRejectAll - Callback al rechazar cookies opcionales
 * @param {function} onConfigure - Callback para abrir configuración
 */
const CookieBanner = ({ onAcceptAll, onRejectAll, onConfigure }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[300] bg-slate-900/95 backdrop-blur-md border-t border-slate-700 p-4 md:p-6 animate-in slide-in-from-bottom duration-300 shadow-2xl">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          {/* Icon and Message */}
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-blue-600/20 rounded-lg shrink-0">
              <Cookie size={24} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">🍪 Usamos cookies</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Utilizamos cookies esenciales para el funcionamiento de la app (autenticación) y cookies analíticas opcionales para mejorar tu experiencia. 
                Puedes aceptar todas, rechazar las opcionales, o configurar tus preferencias.
              </p>
              <a 
                href="/privacy" 
                className="text-xs text-blue-400 hover:text-blue-300 underline mt-1 inline-block"
                onClick={(e) => e.stopPropagation()}
              >
                Leer Política de Privacidad
              </a>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto shrink-0">
            <button
              onClick={onConfigure}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <Settings size={16} />
              <span className="hidden sm:inline">Configurar</span>
            </button>
            <button
              onClick={onRejectAll}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
            >
              Rechazar opcionales
            </button>
            <button
              onClick={onAcceptAll}
              className="px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg transition-all"
            >
              Aceptar todas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
