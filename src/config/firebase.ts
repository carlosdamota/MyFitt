import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import type { Analytics } from "firebase/analytics";
import type { Messaging } from "firebase/messaging";

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getMessaging } from "firebase/messaging";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Type for Firebase configuration
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Declare global variables injected at runtime
declare const __firebase_config: string | undefined;
declare const __app_id: string | undefined;

// Get Firebase configuration from runtime or environment variables
const getFirebaseConfig = (): FirebaseConfig | null => {
  if (typeof __firebase_config !== "undefined") {
    return JSON.parse(__firebase_config) as FirebaseConfig;
  }

  // Fallback to standard Vite environment variables
  if (import.meta.env.VITE_FIREBASE_API_KEY) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };
  }

  return null;
};

const firebaseConfig = getFirebaseConfig();
export const appId: string = typeof __app_id !== "undefined" ? __app_id : "fitmanual-default";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let analytics: Analytics | null = null;
let messaging: Messaging | null = null;

if (firebaseConfig) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  const appCheckKey = import.meta.env.VITE_FIREBASE_APPCHECK_KEY as string | undefined;
  if (appCheckKey) {
    if (import.meta.env.DEV) {
      // @ts-ignore
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(appCheckKey),
      isTokenAutoRefreshEnabled: true,
    });
  }

  isSupported().then((yes) => {
    if (yes && app) {
      // Check for opt-out key in localStorage
      const isOptedOut = localStorage.getItem("fittwiz_analytics_optout") === "true";
      const isDev = import.meta.env.DEV;

      if (isOptedOut || isDev) {
        console.log(`[Analytics] Disabled. Reason: ${isDev ? "Development Mode" : "User Opt-out"}`);
      } else {
        analytics = getAnalytics(app);
      }
    }
  });

  // Initialize Messaging (only in browser)
  if (typeof window !== "undefined") {
    // isSupported() for messaging is distinct from analytics, but commonly available.
    // We'll wrap in try-catch or just allow it to fail silently if not supported
    try {
      messaging = getMessaging(app);
    } catch (e) {
      console.debug("Firebase Messaging not supported in this environment");
    }
  }
}

export { app, auth, db, analytics, messaging, firebaseConfig };
