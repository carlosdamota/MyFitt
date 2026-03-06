# Changelog

Todas las novedades y cambios de MyFitt (FittWiz) se registran aquí.

## [1.0.12] - 2026-03-06

- **Cambio**: Optimización agresiva de espacio vertical en móvil (WeeklyProgress, ExerciseCard y SmartSuggestion).
- **Para qué**: Reduce la necesidad de scroll en un 40-50% al expandir ejercicios, mejora la usabilidad en pantallas estrechas con layouts en fila e integra visuales (GIFs) con notas de forma más compacta y premium.

## [1.0.11] - 2026-03-06

- **Cambio**: Rediseño de temporizadores de rutina y descanso (Docked Style).
- **Para qué**: Mejora la usabilidad en dispositivos móviles al colocar los controles en la 'zona del pulgar' y unifica el diseño para que el descanso tape completamente el tiempo total sin desajustes.

## [1.0.10] - 2026-03-05

- **Cambio**: Fix: Parseo de títulos en uploads de Strava.
- **Para qué**: Ahora el título de las actividades subidas a Strava elimina prefijos y se limpia (ej: "Day 1:" o el nombre del programa), igualando el formato de las Social Cards.

## [1.0.9] - 2026-03-04

- **Cambio**: Integración completa con Strava y sincronización de actividades.
- **Para qué**: Ahora puedes conectar tu cuenta de Strava para sincronizar tus entrenamientos automáticamente. Se ha añadido el botón "Compartir en Strava" en el resumen de sesión y se han actualizado las políticas de privacidad y branding para cumplir con los requisitos de producción de Strava.

## [1.0.8] - 2026-03-04

- **Cambio**: Fix: persistencia de personalidad del coach en cuentas antiguas + reglas de Firestore.
- **Para qué**: Las cuentas creadas antes de la funcionalidad de personalidad no podían guardar cambios en el perfil. Se descubrió que los campos escritos por el servidor (`outreachLastSentAt`, etc.) no estaban en la whitelist de las reglas de seguridad, bloqueando toda escritura desde el cliente. Ahora se auto-migran los campos de personalidad y las reglas permiten guardar correctamente.

## [1.0.7] - 2026-03-04

- **Cambio**: Mejoras de UX mobile en la página de Perfil + sección Novedades.
- **Para qué**: El botón "Guardar Perfil" ahora es sticky en mobile para no tener que hacer scroll hasta él. Las secciones Notificaciones y Apariencia tienen menor peso visual al ser ajustes secundarios. Las descripciones de personalidad del Coach se ocultan en mobile para reducir espacio. Se añade un enlace discreto "vX.X.X · Novedades" en el footer que abre un modal con el historial de cambios.

## [1.0.6] - 2026-03-04

- **Cambio**: Rediseño de la sección "Entrenadores Inteligentes" en la página de Perfil.
- **Para qué**: La sección no seguía la estética del resto de la app (emojis, colores incorrectos, acórdeón innecesario). Ahora usa iconos SVG de Lucide, cards con efecto glassmorphism, estado activo con el gradiente primario cyan→violeta, descripción por personalidad, y un card "Próximamente" elegante para el Nutricionista IA.

## [1.0.5] - 2026-03-04

- **Cambio**: Fix: persistencia de personalidad del coach e IA sargento más estricta.
- **Para qué**: El perfil no guardaba la personalidad por falta de permisos en Firestore y la IA era demasiado amable. Ahora el "Sargento" es autoritario, el guardado es robusto y el análisis semanal respeta la semana natural de Lunes a Domingo comparando contra tus objetivos.

## [1.0.4] - 2026-03-04

- **Cambio**: Fix: tabs mezclados al cargar dashboard con rutina nueva + redirect del Coach a Mis Rutinas.
- **Para qué**: Antes, tras onboarding o generación, los tabs mostraban días de múltiples programas mezclados. Ahora el dashboard filtra correctamente por programa activo. Además, generar desde el Coach IA redirige a "Mis Rutinas" para gestionar la rutina.

## [1.0.3] - 2026-03-04

- **Cambio**: Fix: el cambio de rutinas desde "Mis Rutinas" ahora funciona correctamente.
- **Para qué**: Antes, al seleccionar una rutina generada, el dashboard se quedaba en la rutina base porque el guardado del perfil fallaba por permisos. Ahora el dashboard lee el parámetro de URL como fuente primaria y la navegación es inmediata sin depender del guardado.

## [1.0.2] - 2026-03-04

- **Cambio**: Fix: las rutinas generadas por IA ahora se activan automáticamente tras generarse.
- **Para qué**: Antes, tras generar un programa con IA, el dashboard seguía mostrando la rutina base. Ahora la primera rutina del programa generado se establece como activa y el dashboard navega directamente a ella.

## [1.0.1] - 2026-03-03

- **Cambio**: Implementación de sistema de versionado y log automático.
- **Para qué**: Para que el usuario pueda ver fácilmente qué ha cambiado en cada actualización y mantener el número de versión centralizado.
