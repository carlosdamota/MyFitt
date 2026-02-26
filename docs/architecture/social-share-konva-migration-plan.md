# Social Share — Plan de Migración a motor Konva

## Objetivo
Migrar el motor de generación/preview de Social Share desde snapshot de DOM (`html-to-image`) a un motor canvas basado en Konva, manteniendo compatibilidad con el flujo actual de compartir, descargar y copiar.

## Estado actual (baseline)
- El render de imagen parte de `toPng` (`html-to-image`) sobre un nodo DOM.
- Después se recompone en `canvas` para formatos `feed/story`.
- El drag del sticker ya fue optimizado (rAF + bounds cache), pero el cuello de botella principal sigue siendo la captura DOM + serialización.

## Principios de implementación
- **DRY**: reutilizar el contrato de datos existente (theme, logs, métricas, formato, sticker).
- **Compatibilidad incremental**: conservar `useShareWorkout` como fachada pública.
- **Fallback seguro**: si Konva falla, usar motor DOM actual.
- **Separación de capas**: UI editor, scene model, export renderer.

---

## Arquitectura objetivo

### 1) Scene Model (fuente única de verdad)
Crear un modelo serializable para la tarjeta:
- `format`: `feed | story`
- `theme`: `backgroundColor`, `primaryTextColor`, `secondaryTextColor`, `accentColor`
- `stats`: volumen, reps, ejercicios, duración, fecha
- `sticker`: texto + posición normalizada (`x%`, `y%`)
- `layout`: paddings, tipografías, tamaños por formato

**Resultado**: tanto el preview como el export leen del mismo `scene model`.

### 2) Render Engine Adapter
Definir interfaz común:

```ts
interface SocialShareRenderEngine {
  renderPreview(scene: ShareScene, options?: { pixelRatio?: number }): Promise<string>; // dataURL
  renderAsset(scene: ShareScene, format: "feed" | "story", fileNameBase: string): Promise<WorkoutImageAsset>;
}
```

Implementaciones:
- `DomSnapshotEngine` (actual, con `html-to-image`) para fallback.
- `KonvaEngine` (nuevo) como engine principal.

### 3) Integración en hook
Extender `useShareWorkout` para aceptar `engine: "dom" | "konva"` y mantener su API pública.

---

## Plan por fases

## Fase 0 — Instrumentación y feature flag (1 PR)
1. Añadir flag de motor (`SOCIAL_SHARE_ENGINE=dom|konva`).
2. Registrar métricas básicas:
   - tiempo de preview
   - tiempo de export
   - frames dropped durante drag
3. Mantener DOM como default hasta validar Konva.

### Aceptación
- No cambia UX visible.
- Sin regresiones en share/download/copy.

## Fase 1 — Scaffold Konva Engine (1 PR)
1. Instalar `konva` y `react-konva`.
2. Crear `social-share/scene-model.ts`.
3. Crear `social-share/engines/konva-engine.ts` con render mínimo:
   - fondo
   - título/fecha
   - métricas
   - sticker
4. Implementar export a `WorkoutImageAsset`.
5. Añadir fallback automático al engine DOM en catch.

### Aceptación
- Se genera imagen válida feed/story con Konva.
- Fallback a DOM funcionando.

## Fase 2 — Preview en vivo con Konva (1–2 PR)
1. Crear componente `SocialSharePreviewKonva`.
2. Activar drag nativo sobre nodo de sticker en Konva.
3. Eliminar dependencia de regeneración continua de PNG para preview interactivo.

### Aceptación
- Drag sticker estable en gama media móvil.
- Menor latencia frente al baseline.

## Fase 3 — Paridad visual y optimización (1 PR)
1. Igualar estilos visuales con la card actual.
2. Ajustar tipografías y escalas por formato.
3. Aplicar estrategia de `pixelRatio`:
   - preview bajo (`1–1.25`)
   - export alto (`2–3`)
4. Añadir cache por token de escena.

### Aceptación
- Paridad visual aceptable.
- Reducción medible de tiempo de preview/export.

## Fase 4 — Rollout y limpieza (1 PR)
1. Activar Konva por defecto.
2. Mantener DOM engine detrás de flag como rollback.
3. Documentar runbook de fallback.
4. Deprecar gradualmente código DOM snapshot específico de social share.

### Aceptación
- Sin regresiones de negocio.
- Error rate estable o menor.

---

## Métricas de éxito (SLO)
- `TTPreview` (open modal -> preview usable): **-40%** respecto baseline.
- `TTExport` (tap download/share -> asset ready): **-30%**.
- Drag jank (long frames >16ms durante arrastre): **-50%**.
- Fallos de generación: no mayor que baseline.

---

## Riesgos y mitigaciones
1. **Paridad visual incompleta**
   - Mitigación: checklist visual por tema/formato.
2. **Fuentes/emoji distintos por plataforma**
   - Mitigación: snapshot suite en Android/iOS.
3. **Complejidad de migración**
   - Mitigación: engine adapter + rollout por flag.
4. **Deuda técnica previa (colores hardcoded)**
   - Mitigación: tarea separada posterior; no bloquear migración de motor.

---

## Checklist ejecutable
- [ ] Crear adapter de engines
- [ ] Añadir scene model
- [ ] Implementar Konva engine mínimo
- [ ] Integrar flag en `useShareWorkout`
- [ ] Preview Konva en modal
- [ ] Export Konva + fallback DOM
- [ ] Instrumentación y métricas
- [ ] QA visual por temas y formatos
- [ ] Rollout gradual

---

## Criterio de done
- Konva activo en producción con rollback por flag.
- Share/download/copy funcionando sin cambios en API de consumidores.
- Métricas de performance mejoradas de forma consistente.
