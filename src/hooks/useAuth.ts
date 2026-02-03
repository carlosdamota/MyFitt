import { useState, useEffect } from "react";
import {
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth } from "../config/firebase";

// Declare global variable injected at runtime
declare const __initial_auth_token: string | undefined;

export interface UseAuthReturn {
  user: User | null;
  authError: string | null;
  login: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setAuthError("Firebase no configurado. Verifica tu archivo .env");
      return;
    }

    // Suscribirse a cambios de estado de autenticación
    if (auth) {
      const unsubscribe = onAuthStateChanged(
        auth,
        (currentUser) => {
          setUser(currentUser);
          // Si hay un token inicial y no hay usuario, intentar login custom
          if (!currentUser && typeof __initial_auth_token !== "undefined" && __initial_auth_token) {
            signInWithCustomToken(auth!, __initial_auth_token).catch((e: Error) => {
              console.error("Custom Token Auth Error", e);
              setAuthError("Error de autenticación con token");
            });
          }
        },
        (error) => {
          console.error("Auth State Error", error);
          setAuthError(error.message);
        },
      );
      return () => unsubscribe();
    }
  }, []);

  const login = async (): Promise<void> => {
    if (!auth) {
      setAuthError("Firebase no configurado");
      throw new Error("Firebase no configurado");
    }
    try {
      await signInAnonymously(auth);
    } catch (e) {
      console.error("Login Error", e);
      setAuthError("Error al iniciar sesión");
      throw e;
    }
  };

  return { user, authError, login };
};
