# Monitoring & Alertas Telegram (sin n8n)

## Arquitectura

- Ingesta de eventos: frontend (`/emitMonitoringEvent`) + backend (Stripe webhooks + signup trigger).
- Persistencia: `artifacts/{appId}/monitoring_alert_events` en Firestore.
- Dispatch: `dispatchMonitoringAlerts` (Cloud Scheduler cada minuto).
- Canal de salida: Telegram Bot API.

## Functions nuevas

- `emitMonitoringEvent`: endpoint HTTP autenticado para eventos frontend.
- `trackNewUserSignup`: trigger al crear usuario en Firebase Auth.
- `dispatchMonitoringAlerts`: envía eventos `pending` a Telegram.
- `cleanupMonitoringEvents`: limpia eventos antiguos por retención.

## Variables de entorno requeridas

- `MONITORING_ENABLED=true`
- `MONITORING_ENV=production`
- `TELEGRAM_BOT_TOKEN=...`
- `TELEGRAM_CHAT_ID_TECH=...`
- `TELEGRAM_CHAT_ID_BIZ=...`

## Variables opcionales

- `ALERT_MAX_ATTEMPTS=4`
- `ALERT_DEDUPE_WINDOW_MINUTES=15`
- `ALERT_MAX_PER_WINDOW=5`
- `ALERT_DISPATCH_BATCH_SIZE=50`
- `ALERT_RETENTION_DAYS=30`

## Eventos incluidos

### Técnicos

- `frontend_error`
- `frontend_unhandled_rejection`
- `ai_api_failed`
- `billing_checkout_failed`
- `billing_portal_failed`
- `stripe_webhook_invalid_signature`
- `stripe_webhook_failed`

### Negocio

- `new_user_signup`
- `payment_succeeded`
- `payment_failed`
- `subscription_cancelled`
- `workout_generated`
- `workout_completed`

## Índices recomendados en Firestore

Crear índices compuestos para evitar errores de consulta:

1. `status ASC, nextAttemptAt ASC`
2. `dedupeKey ASC, status ASC, createdAt DESC`
3. `createdAt ASC` (si no está ya por defecto para limpieza)

## Notas

- Esta solución evita dependencia de n8n local y túneles.
- `emitMonitoringEvent` nunca bloquea UX: errores del envío se ignoran en frontend.
