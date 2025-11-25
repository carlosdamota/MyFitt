# Guía de Configuración de Firebase

Sigue estos pasos para obtener tus credenciales y configurar el backend:

## 1. Crear Proyecto en Firebase Console
1. Ve a [Firebase Console](https://console.firebase.google.com/).
2. Haz clic en **"Agregar proyecto"** y sigue los pasos (puedes desactivar Google Analytics para hacerlo más rápido).

## 2. Registrar la App Web
1. En la vista general del proyecto, haz clic en el icono de **Web** (`</>`).
2. Ponle un nombre (ej: `FitManual`).
3. Haz clic en **"Registrar app"**.
4. Aparecerá un bloque de código `const firebaseConfig = { ... }`. **NO copies el código**, solo necesitaremos los valores de las claves para tu archivo `.env`.

## 3. Configurar Variables de Entorno
Abre tu archivo `.env` y rellena los datos con lo que ves en la consola:

| Variable en .env | Clave en firebaseConfig |
|------------------|-------------------------|
| `VITE_FIREBASE_API_KEY` | `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | `appId` |

## 4. Activar Servicios (¡Importante!)
Para que la app funcione, debes activar **Authentication** y **Firestore Database**:

### Authentication
1. En el menú izquierdo, ve a **Compilación** -> **Authentication**.
2. Haz clic en **"Comenzar"**.
3. En la pestaña **"Sign-in method"**, busca **"Anónimo"**.
4. Habilítalo y guarda.

### Firestore Database
1. En el menú izquierdo, ve a **Compilación** -> **Firestore Database**.
2. Haz clic en **"Crear base de datos"**.
3. Selecciona una ubicación (ej: `eur3` o `us-central1`).
4. **Reglas de Seguridad**: Para empezar rápido, selecciona **"Comenzar en modo de prueba"** (esto permite leer/escribir a cualquiera por 30 días).
   * *Nota: Para producción deberías configurar reglas que solo permitan al usuario leer/escribir sus propios datos.*

¡Listo! Reinicia tu servidor de desarrollo (`pnpm dev`) para que cargue las nuevas variables.
