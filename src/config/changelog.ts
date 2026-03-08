export interface ChangelogEntry {
  version: string;
  date: string;
  change: string;
  reason: string;
}

export const CHANGELOG_DATA: ChangelogEntry[] = [
  {
    version: "1.0.14",
    date: "2026-03-08",
    change: "Auditoría de comunicaciones y mejora de UX en Toggles",
    reason:
      "Se simplificó la lógica de notificaciones de 'Opt-Out' a 'Enabled' para evitar confusión y se añadieron animaciones suaves a los interruptores del perfil.",
  },
  {
    version: "1.0.13",
    date: "2026-03-06",
    change: "Rediseño visual interactivo del Progreso Semanal",
    reason:
      "Se dividió el panel de WeeklyProgress en zonas de 1/3 y 2/3 para mayor claridad, se incorporaron nuevas medallas dinámicas en SVG y se arregló la visibilidad y colapso automático del tooltip de escudos.",
  },
  {
    version: "1.0.12",
    date: "2026-03-06",
    change: "Optimización UX Mobile: Ahorro masivo de espacio vertical",
    reason:
      "Se ha rediseñado el WeeklyProgress, las fichas de ejercicio y las sugerencias inteligentes para que ocupen un 50% menos de espacio en móvil, permitiendo ver más contenido sin scroll.",
  },
  {
    version: "1.0.11",
    date: "2026-03-06",
    change: "Mejora de UX: Rediseño de temporizadores de entrenamiento",
    reason:
      "Se ha implementado un nuevo diseño anclado a la base de la pantalla (docked), unificando el estilo de los temporizadores de rutina y descanso para un solapamiento perfecto y mejor usabilidad móvil.",
  },
  {
    version: "1.0.10",
    date: "2026-03-05",
    change: "Fix: Parseo de títulos en uploads de Strava",
    reason:
      "Ahora el título de las actividades subidas a Strava elimina prefijos y se limpia (ej: 'Day 1:' o el nombre del programa), igualando el formato de las Social Cards.",
  },
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
