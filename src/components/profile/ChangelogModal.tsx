import React from "react";
import { X, Sparkles } from "lucide-react";
import { APP_VERSION } from "../../config/version";

interface ChangelogEntry {
  version: string;
  date: string;
  change: string;
  reason: string;
}

// Parsed from CHANGELOG.md — update alongside the file
const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.0.9",
    date: "2026-03-04",
    change: "Integración completa con Strava",
    reason:
      "Sincronización automática de actividades, botón para compartir en Strava en el resumen de sesión y actualización de políticas de privacidad para cumplimiento oficial.",
  },
  {
    version: "1.0.8",
    date: "2026-03-04",
    change: "Fix: Persistencia en cuentas antiguas",
    reason:
      "Se resolvió un problema que impedía guardar cambios en el perfil a usuarios antiguos por falta de migración de campos y restricciones en las reglas de Firestore.",
  },
  {
    version: "1.0.7",
    date: "2026-03-04",
    change: "Mejoras de UX mobile en Perfil",
    reason:
      "El botón Guardar es sticky en mobile, las secciones Notificaciones y Apariencia son más discretas, y se ocultan descripciones del Coach en móvil para ahorrar espacio.",
  },
  {
    version: "1.0.6",
    date: "2026-03-04",
    change: "Rediseño de Entrenadores Inteligentes",
    reason:
      "La sección Coaches del perfil ahora usa iconos SVG, cards glassmorphism con descripción, estado activo con gradiente, y un botón Guardar sticky en mobile.",
  },
  {
    version: "1.0.5",
    date: "2026-03-04",
    change: "Persistencia de personalidad del coach",
    reason:
      "El perfil no guardaba la personalidad por falta de permisos en Firestore y la IA Sargento era demasiado amable. Ahora el guardado es robusto y el análisis semanal respeta la semana natural.",
  },
  {
    version: "1.0.4",
    date: "2026-03-04",
    change: "Fix: tabs mezclados en dashboard",
    reason:
      "Tras onboarding o generación los tabs mostraban días de múltiples programas mezclados. Ahora el dashboard filtra correctamente por programa activo.",
  },
  {
    version: "1.0.3",
    date: "2026-03-04",
    change: "Fix: selección de rutinas desde Mis Rutinas",
    reason:
      "El dashboard se quedaba en la rutina base porque el guardado fallaba por permisos. Ahora lee el parámetro de URL como fuente primaria.",
  },
  {
    version: "1.0.2",
    date: "2026-03-04",
    change: "Rutinas IA se activan automáticamente",
    reason:
      "Tras generar un programa con IA, el dashboard seguía mostrando la rutina base. Ahora la primera rutina generada se establece como activa.",
  },
  {
    version: "1.0.1",
    date: "2026-03-03",
    change: "Sistema de versionado y changelog",
    reason:
      "Se implementa el sistema de versiones centralizado (version.ts) y el registro automático de cambios en CHANGELOG.md.",
  },
];

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangelogModal: React.FC<ChangelogModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4'
      role='dialog'
      aria-modal='true'
      aria-label='Novedades de FittWiz'
    >
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/60 backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Sheet */}
      <div className='relative z-10 w-full sm:max-w-md bg-white dark:bg-surface-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-white/5 overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 dark:border-surface-800'>
          <div className='flex items-center gap-2'>
            <div className='flex items-center justify-center w-7 h-7 rounded-lg bg-primary-500/10'>
              <Sparkles
                size={14}
                className='text-primary-400'
              />
            </div>
            <div>
              <h2 className='text-sm font-bold text-slate-900 dark:text-white'>Novedades</h2>
              <p className='text-[10px] text-slate-400'>FittWiz v{APP_VERSION}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 dark:bg-surface-800 hover:bg-slate-200 dark:hover:bg-surface-700 transition-colors'
            aria-label='Cerrar'
          >
            <X
              size={14}
              className='text-slate-500 dark:text-slate-400'
            />
          </button>
        </div>

        {/* Changelog list */}
        <div className='overflow-y-auto max-h-[65vh] px-5 py-4 space-y-4'>
          {CHANGELOG.map((entry, index) => (
            <div
              key={entry.version}
              className='flex gap-3'
            >
              {/* Timeline dot */}
              <div className='flex flex-col items-center pt-1'>
                <div
                  className={`w-2 h-2 rounded-full shrink-0 ${index === 0 ? "bg-primary-400" : "bg-slate-300 dark:bg-surface-600"}`}
                />
                {index < CHANGELOG.length - 1 && (
                  <div className='w-px flex-1 mt-1 bg-slate-200 dark:bg-surface-700' />
                )}
              </div>

              {/* Content */}
              <div className='pb-4'>
                <div className='flex items-center gap-2 mb-1'>
                  <span
                    className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${index === 0 ? "bg-primary-500/10 text-primary-400" : "bg-slate-100 dark:bg-surface-800 text-slate-500 dark:text-slate-400"}`}
                  >
                    v{entry.version}
                  </span>
                  <span className='text-[10px] text-slate-400'>{entry.date}</span>
                </div>
                <p className='text-sm font-semibold text-slate-800 dark:text-slate-100 mb-0.5'>
                  {entry.change}
                </p>
                <p className='text-xs text-slate-500 dark:text-slate-400 leading-relaxed'>
                  {entry.reason}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChangelogModal;
