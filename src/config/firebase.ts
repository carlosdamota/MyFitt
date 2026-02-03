import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import type { Analytics } from "firebase/analytics";

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

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

if (firebaseConfig) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  isSupported().then((yes) => {
    if (yes && app) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, db, analytics };
