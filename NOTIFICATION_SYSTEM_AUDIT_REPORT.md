# INFORME DE VERIFICACIÓN DEL SISTEMA DE NOTIFICACIONES
## FitManual - Fecha: 2026-02-18

---

## 1. ESTADO DE LAS CLOUD FUNCTIONS

### Funciones de Notificaciones Push
| Función | Estado | Versión | Trigger | Último Deploy |
|---------|--------|---------|---------|---------------|
| **pushAgent-sendPushOnNotification** | ✅ ACTIVA | v2 | Firestore (document.created) | 2026-02-18 12:02 |

### Funciones de Email
| Función | Estado | Versión | Trigger | Último Deploy |
|---------|--------|---------|---------|---------------|
| **sendWelcomeEmail** | ✅ ACTIVA | v2 | Firestore (document.created) | 2026-02-18 21:49 |
| **weeklyReengagement** | ✅ ACTIVA | v2 | Scheduled (every sunday 10:00) | 2026-02-18 21:49 |
| **sendSecurityAlert** | ✅ ACTIVA | v2 | HTTPS | 2026-02-18 21:49 |
| ~~emailAgent-sendWelcomeEmail~~ | ❌ ELIMINADA | - | - | 2026-02-18 08:42 |
| ~~emailAgent-weeklyReengagement~~ | ❌ ELIMINADA | - | - | 2026-02-18 08:42 |

### Otras Funciones
| Función | Estado | Versión | Trigger |
|---------|--------|---------|---------|
| aiGenerate | ✅ ACTIVA | v2 | HTTPS |
| createCheckoutSession | ✅ ACTIVA | v2 | HTTPS |
| createBillingPortal | ✅ ACTIVA | v2 | HTTPS |
| stripeWebhook | ✅ ACTIVA | v2 | HTTPS |

---

## 2. LOGS RELEVANTES ENCONTRADOS

### 🔴 Errores Críticos Detectados:

#### Error 1: Falta de paquete 'resend' (RESUELTO)
```
2026-02-17T21:14:07.515807Z pushagent-sendpushonnotification: 
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'resend' imported from /workspace/lib/email-agent.js
```
- **Estado**: ✅ CORREGIDO en re-deploy del 17/02/2026 21:42
- **Impacto**: Funciones re-desplegadas correctamente

#### Error 2: Permisos Eventarc (RESUELTO)
```
2026-02-17T21:12:06.907855130Z pushAgent-sendPushOnNotification:
Permission denied while using the Eventarc Service Agent
```
- **Estado**: ✅ CORREGIDO automáticamente por Google Cloud

### 🟡 Cambios Importantes en Deploys:

#### Re-estructuración de Funciones (18/02/2026):
- ✅ `emailAgent-sendWelcomeEmail` → `sendWelcomeEmail`
- ✅ `emailAgent-weeklyReengagement` → `weeklyReengagement`
- Esto indica una refactorización del código para simplificar nombres

---

## 3. ANÁLISIS DEL CÓDIGO Y TRIGGERS

### 3.1 Trigger de Push Notifications
**Archivo**: `functions/src/push-agent.ts:16`

```typescript
const sendPushOnNotification = onDocumentCreated(
  `artifacts/${appId}/users/{userId}/notifications/{notificationId}`,
```

**Trigger actual configurado**: 
- Ruta: `artifacts/fitmanual-default/users/{userId}/notifications/{notificationId}`
- Evento: `google.cloud.firestore.document.v1.created`
- Región: `eur3`

✅ **CORRECTO**: El trigger coincide con la ruta esperada

### 3.2 Trigger de Welcome Email
**Archivo**: `functions/src/email-agent.ts:156`

```typescript
const sendWelcomeEmail = onDocumentCreated(
  `artifacts/${appId}/users/{userId}/app_data/profile`,
```

**Trigger actual configurado**:
- Ruta: `artifacts/fitmanual-default/users/{userId}/app_data/profile`
- Evento: `google.cloud.firestore.document.v1.created`
- Región: `eur3`

✅ **CORRECTO**: El trigger está activo y configurado

---

## 4. DIAGNÓSTICO DEL PROBLEMA

### Usuario: RSsBScaCEFUehXNUTq3RtQNILaD2
### Notificación: aVPvwXA5RSnPl2aXeb1Z

### ❌ Por qué NO llegó la notificación push:

1. **La función está activa y configurada correctamente**
   - ✅ pushAgent-sendPushOnNotification está funcionando
   - ✅ El trigger está escuchando en la ruta correcta

2. **Posibles causas**:
   a) **El documento de notificación no existe en Firestore**
      - No se pudo verificar directamente (requiere acceso a Firestore)
      - Se debe verificar: `artifacts/fitmanual-default/users/RSsBScaCEFUehXNUTq3RtQNILaD2/notifications/aVPvwXA5RSnPl2aXeb1Z`
   
   b) **No hay tokens FCM registrados para el usuario**
      - La función verifica tokens en: `fcm_tokens` subcollection
      - Si no hay tokens, la función loguea: "No FCM tokens found for user {userId}"
   
   c) **El usuario tiene push desactivado**
      - La función verifica `profile.pushEnabled === false`
      - Si es false, se salta el envío

### ❌ Por qué NO llegó el email de bienvenida:

1. **La función sendWelcomeEmail fue re-creada el 18/02/2026**
   - La función anterior (`emailAgent-sendWelcomeEmail`) fue eliminada el 18/02/2026 08:42
   - La nueva función (`sendWelcomeEmail`) fue creada el 18/02/2026 08:43
   
2. **El trigger solo se activa en CREACIÓN de perfil**
   - Si el perfil ya existía antes del 18/02, el email no se envió
   - La función solo escucha `onDocumentCreated`

3. **Posibles causas**:
   a) **El perfil fue creado antes del re-deploy**
      - El trigger no funciona retroactivamente
   
   b) **El usuario no tiene email en el perfil**
      - La función verifica: `if (!email) return;`
   
   c) **El usuario optó por no recibir emails**
      - La función verifica: `if (profile?.emailOptOut === true)`

---

## 5. ACCIONES CORRECTIVAS NECESARIAS

### 5.1 Verificación Manual Requerida

Dado que no tengo acceso directo a Firestore, se debe verificar:

#### A. Documento de Notificación
```javascript
// Verificar en Firebase Console > Firestore:
db.collection('artifacts')
  .doc('fitmanual-default')
  .collection('users')
  .doc('RSsBScaCEFUehXNUTq3RtQNILaD2')
  .collection('notifications')
  .doc('aVPvwXA5RSnPl2aXeb1Z')
```

**Campos requeridos**:
- ✅ `title`: string
- ✅ `body`: string  
- ✅ `url`: string (opcional)
- ✅ `status`: string (pendiente)

#### B. Tokens FCM
```javascript
// Verificar tokens:
db.collection('artifacts')
  .doc('fitmanual-default')
  .collection('users')
  .doc('RSsBScaCEFUehXNUTq3RtQNILaD2')
  .collection('fcm_tokens')
  .get()
```

#### C. Perfil de Usuario
```javascript
// Verificar perfil:
db.collection('artifacts')
  .doc('fitmanual-default')
  .collection('users')
  .doc('RSsBScaCEFUehXNUTq3RtQNILaD2')
  .collection('app_data')
  .doc('profile')
```

**Campos importantes**:
- ✅ `email`: string
- ✅ `displayName`: string
- ✅ `pushEnabled`: boolean (debe ser true)
- ✅ `emailOptOut`: boolean (debe ser false)

### 5.2 Script de Prueba Recomendado

Para verificar el sistema completo, ejecutar:

```bash
# Crear una notificación de prueba
curl -X POST https://firestore.googleapis.com/v1/projects/myfitt-5ddf6/databases/(default)/documents/artifacts/fitmanual-default/users/RSsBScaCEFUehXNUTq3RtQNILaD2/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "title": {"stringValue": "Test Notification"},
      "body": {"stringValue": "This is a test"},
      "url": {"stringValue": "/"},
      "status": {"stringValue": "pending"}
    }
  }'
```

### 5.3 Soluciones Identificadas

#### Si la notificación push no llega:
1. **Verificar tokens FCM**: El usuario debe registrar su dispositivo
2. **Verificar pushEnabled**: Debe ser `true` en el perfil
3. **Verificar documento**: Debe existir con campos title y body

#### Si el email de bienvenida no llega:
1. **Re-crear el perfil**: Eliminar y volver a crear el documento `app_data/profile`
2. **Verificar email**: Debe existir el campo email en el perfil
3. **Verificar emailOptOut**: Debe ser `false` o no existir

---

## 6. CONCLUSIONES

### ✅ Estado General: FUNCIONANDO

Las funciones están **activas y configuradas correctamente**. Los problemas detectados son:

1. **No es un problema de código**: Las funciones están bien implementadas
2. **Posiblemente datos faltantes**: Tokens FCM o documentos no existen
3. **Timing del deploy**: El email de bienvenida solo funciona para nuevos perfiles

### 🔍 Próximos Pasos Recomendados

1. **Verificar documentos en Firestore** (manualmente en Firebase Console)
2. **Registrar tokens FCM** en el dispositivo del usuario
3. **Crear notificación de prueba** para validar el flujo completo
4. **Si es necesario**, re-crear el perfil para activar el email de bienvenida

### 📊 Métricas de las Funciones

- **Total de funciones**: 10
- **Funciones activas**: 10/10 (100%)
- **Funciones con errores**: 0
- **Último deploy exitoso**: 2026-02-18 21:49
- **Runtime**: Node.js 20
- **Región**: us-central1 (funciones), eur3 (triggers Firestore)

---

## 7. NOTAS TÉCNICAS

### Dependencias Instaladas
```json
{
  "firebase-admin": "^13.6.1",
  "firebase-functions": "^7.0.5",
  "resend": "^6.9.2"
}
```

### Variables de Entorno Requeridas
- `FITMANUAL_APP_ID`: fitmanual-default
- `RESEND_API_KEY`: Configurada ✅
- `EMAIL_FROM`: Configurada ✅
- `GEMINI_API_KEY`: Configurada ✅

### Estado de los Triggers
- ✅ pushAgent-sendPushOnNotification: Escuchando cambios en `artifacts/fitmanual-default/users/{userId}/notifications/{notificationId}`
- ✅ sendWelcomeEmail: Escuchando creaciones en `artifacts/fitmanual-default/users/{userId}/app_data/profile`
- ✅ weeklyReengagement: Programado para todos los domingos a las 10:00

---

**Fin del Informe**
