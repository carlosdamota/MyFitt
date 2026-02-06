import { useState, useEffect } from "react";
import {
  signInWithCustomToken,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  linkWithPopup,
  linkWithCredential,
  GoogleAuthProvider,
  EmailAuthProvider,
  signOut,
  type User,
} from "firebase/auth";
import { auth } from "../config/firebase";

// Declare global variable injected at runtime
declare const __initial_auth_token: string | undefined;

export interface UseAuthReturn {
  user: User | null;
  authError: string | null;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
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

  const loginWithGoogle = async (): Promise<void> => {
    if (!auth) {
      setAuthError("Firebase no configurado");
      throw new Error("Firebase no configurado");
    }
    const provider = new GoogleAuthProvider();
    try {
      if (auth.currentUser?.isAnonymous) {
        await linkWithPopup(auth.currentUser, provider);
      } else {
        await signInWithPopup(auth, provider);
      }
    } catch (e) {
      console.error("Google Login Error", e);
      setAuthError("Error al iniciar sesión con Google");
      throw e;
    }
  };

  const loginWithEmail = async (email: string, password: string): Promise<void> => {
    if (!auth) {
      setAuthError("Firebase no configurado");
      throw new Error("Firebase no configurado");
    }
    try {
      if (auth.currentUser?.isAnonymous) {
        const credential = EmailAuthProvider.credential(email, password);
        await linkWithCredential(auth.currentUser, credential);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (e) {
      console.error("Email Login Error", e);
      setAuthError("Error al iniciar sesión con email");
      throw e;
    }
  };

  const signupWithEmail = async (email: string, password: string): Promise<void> => {
    if (!auth) {
      setAuthError("Firebase no configurado");
      throw new Error("Firebase no configurado");
    }
    try {
      if (auth.currentUser?.isAnonymous) {
        const credential = EmailAuthProvider.credential(email, password);
        await linkWithCredential(auth.currentUser, credential);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (e) {
      console.error("Email Signup Error", e);
      setAuthError("Error al crear la cuenta");
      throw e;
    }
  };

  const logout = async (): Promise<void> => {
    if (!auth) return;
    await signOut(auth);
  };

  return { user, authError, loginWithGoogle, loginWithEmail, signupWithEmail, logout };
};
