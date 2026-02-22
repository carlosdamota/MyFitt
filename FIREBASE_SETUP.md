# Guía de Configuración de Firebase

## 0. Requisitos locales
- Node.js **22.x**
- pnpm instalado (`corepack enable` recomendado)


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

Variables adicionales:

| Variable en .env | Uso |
|------------------|-----|
| `VITE_API_BASE_URL` | URL base de Cloud Functions (ej: `https://REGION-PROYECTO.cloudfunctions.net`) |
| `VITE_FIREBASE_APPCHECK_KEY` | reCAPTCHA v3 site key para App Check |

## 4. Activar Servicios (¡Importante!)
Para que la app funcione, debes activar **Authentication** y **Firestore Database**:

### Authentication
1. En el menú izquierdo, ve a **Compilación** -> **Authentication**.
2. Haz clic en **"Comenzar"**.
3. En la pestaña **"Sign-in method"**, habilita **Google** y **Correo/Contraseña**.
4. Guarda los cambios.

### Firestore Database
1. En el menú izquierdo, ve a **Compilación** -> **Firestore Database**.
2. Haz clic en **"Crear base de datos"**.
3. Selecciona una ubicación (ej: `eur3` o `us-central1`).
4. **Reglas de Seguridad**: Selecciona **"Comenzar en modo bloqueado"** y luego publica las reglas del archivo `firestore.rules`.
   * *Nota: En producción no uses modo de prueba.*

### App Check (Recomendado)
1. En el menú izquierdo, ve a **Compilación** -> **App Check**.
2. Registra tu app web y habilita **reCAPTCHA v3**.
3. Agrega la key en tu `.env` como `VITE_FIREBASE_APPCHECK_KEY`.

### Cloud Functions (Billing + IA)
Configura variables de entorno en Functions:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PRO_MONTHLY`
- `GEMINI_API_KEY`
- `PRO_AI_MONTHLY_QUOTA` (ej. 40)
- `FREE_AI_WEEKLY_QUOTA` (ej. 1)
- `FITMANUAL_APP_ID` (default: `fitmanual-default`)
- `WEB_ORIGIN` (URL de la PWA)

¡Listo! Reinicia tu servidor de desarrollo (`pnpm dev`) para que cargue las nuevas variables.

### Deploy de Functions
Desde la raíz del repo, Firebase usará `pnpm` para compilar las functions en predeploy.
