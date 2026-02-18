# Test de Notificaciones - Guía Rápida

## 🧪 PROBAR EMAIL DE BIENVENIDA

### Opción 1: Desde Firebase Console (Recomendado)
1. Ve a Firebase Console > Firestore
2. Elimina el documento: `artifacts/fitmanual-default/users/TU_USER_ID/app_data/profile`
3. Recarga la app y completa el onboarding
4. El email llegará automáticamente

### Opción 2: Usar Security Alert (Prueba inmediata)
```bash
curl -X POST https://us-central1-YOUR_PROJECT.cloudfunctions.net/sendSecurityAlert \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "RSsBScaCEFUehXNUTq3RtQNILaD2",
    "alertType": "new_login",
    "metadata": { "device": "Test Device" }
  }'
```

## 📱 PROBAR NOTIFICACIÓN PUSH

### Paso 1: Activar permisos en la app
1. Abre la app en tu navegador
2. Ve a Configuración → Notificaciones
3. Activa "Notificaciones Push"
4. Acepta los permisos del navegador

### Paso 2: Verificar token guardado
Ve a Firebase Console > Firestore y verifica que exista:
`artifacts/fitmanual-default/users/TU_USER_ID/fcm_tokens/`

### Paso 3: Crear notificación de prueba
```bash
# Ejecutar desde functions/
node scripts/test-notification.js TU_USER_ID
```

O crear manualmente en Firestore:
- Colección: `artifacts/fitmanual-default/users/TU_USER_ID/notifications`
- Documento con campos:
  - `title`: "Test"
  - `body`: "Mensaje de prueba"
  - `url`: "/dashboard" (opcional)

## 🔍 VERIFICACIÓN

### Revisar logs de funciones:
```bash
firebase functions:log --only pushAgent-sendPushOnNotification --tail
firebase functions:log --only sendWelcomeEmail --tail
```

### En Firebase Console:
1. Functions > Logs - Ver errores
2. Firestore - Verificar documentos creados
3. Resend Dashboard - Ver emails enviados

## ⚠️ NOTAS IMPORTANTES

1. **Las notificaciones push requieren permisos activos en el navegador**
2. **El email de bienvenida solo se envía al CREAR el perfil (onDocumentCreated)**
3. **Las funciones están activas y funcionando correctamente**
4. **Las reglas de Firestore bloquean escrituras desde cliente en `notifications/`**

## 📧 DIRECCIONES DE PRUEBA SEGURAS

Para probar emails sin dañar tu reputación:
- `delivered@resend.dev` → Simula entrega exitosa
- `bounced@resend.dev` → Simula rechazo
- `complained@resend.dev` → Simula spam complaint

**NUNCA uses emails falsos como test@gmail.com**
