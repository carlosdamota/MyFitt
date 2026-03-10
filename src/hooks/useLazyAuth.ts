/**
 * useLazyAuth — versión ligera de useAuth para el Landing.
 *
 * Firebase Auth + Firestore NO se importan en el bundle inicial.
 * Se cargan dinámicamente con import() solo al:
 *   1. Primer requestIdleCallback (para detectar usuario ya logueado sin bloquear)
 *   2. O cuando el usuario hace click en "Entrar" / "Con Google"
 *
 * Esto elimina ~340 KB del critical path del Landing.
 */
import { useState, useEffect, useRef, useCallback } from "react";

export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAnonymous: boolean;
} | null;

export interface UseLazyAuthReturn {
  user: AuthUser;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initFirebase: () => Promise<void>;
}

// Cargamos el módulo Firebase Auth una sola vez (singleton)
let firebaseInitPromise: Promise<void> | null = null;
let unsubscribeAuth: (() => void) | null = null;

export const useLazyAuth = (): UseLazyAuthReturn => {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  /** Carga dinámica de Firebase Auth. Idempotente — solo se ejecuta una vez. */
  const initFirebase = useCallback(() => {
    if (firebaseInitPromise) {
      firebaseInitPromise.then(() => {
        if (mountedRef.current) setLoading(false);
      });
      return firebaseInitPromise;
    }

    firebaseInitPromise = (async () => {
      const [{ auth }, { onAuthStateChanged }, posthogMod] = await Promise.all([
        import("../config/firebase"),
        import("firebase/auth"),
        import("posthog-js").catch(() => null),
      ]);

      const { initAppCheck } = await import("../config/firebase");
      void initAppCheck();

      if (!auth) {
        if (mountedRef.current) setLoading(false);
        return;
      }

      unsubscribeAuth?.();
      unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
        if (!mountedRef.current) return;
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            isAnonymous: firebaseUser.isAnonymous,
          });
          if (posthogMod && !firebaseUser.isAnonymous) {
            posthogMod.default?.identify(firebaseUser.uid, {
              email: firebaseUser.email,
              name: firebaseUser.displayName,
            });
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      const currentUser = auth.currentUser;
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          isAnonymous: currentUser.isAnonymous,
        });
      }
      if (mountedRef.current) setLoading(false);
    })();

    return firebaseInitPromise;
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    // Iniciamos Firebase en idle — no bloquea el primer paint
    const scheduleInit = () => {
      if ("requestIdleCallback" in window) {
        (window as Window).requestIdleCallback(() => void initFirebase(), { timeout: 500 });
      } else {
        setTimeout(() => void initFirebase(), 200);
      }
    };

    scheduleInit();

    return () => {
      mountedRef.current = false;
    };
  }, [initFirebase]);

  const loginWithGoogle = useCallback(async () => {
    await initFirebase();
    const [{ auth }, { signInWithPopup, linkWithPopup, GoogleAuthProvider }] = await Promise.all([
      import("../config/firebase"),
      import("firebase/auth"),
    ]);
    if (!auth) throw new Error("Firebase no configurado");
    const provider = new GoogleAuthProvider();
    if (auth.currentUser?.isAnonymous) {
      await linkWithPopup(auth.currentUser, provider);
    } else {
      await signInWithPopup(auth, provider);
    }
  }, [initFirebase]);

  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      await initFirebase();
      const [{ auth }, { signInWithEmailAndPassword, linkWithCredential, EmailAuthProvider }] =
        await Promise.all([import("../config/firebase"), import("firebase/auth")]);
      if (!auth) throw new Error("Firebase no configurado");
      if (auth.currentUser?.isAnonymous) {
        await linkWithCredential(auth.currentUser, EmailAuthProvider.credential(email, password));
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    },
    [initFirebase],
  );

  const signupWithEmail = useCallback(
    async (email: string, password: string) => {
      await initFirebase();
      const [{ auth }, { createUserWithEmailAndPassword, linkWithCredential, EmailAuthProvider }] =
        await Promise.all([import("../config/firebase"), import("firebase/auth")]);
      if (!auth) throw new Error("Firebase no configurado");
      if (auth.currentUser?.isAnonymous) {
        await linkWithCredential(auth.currentUser, EmailAuthProvider.credential(email, password));
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    },
    [initFirebase],
  );

  const logout = useCallback(async () => {
    await initFirebase();
    const [{ auth }, { signOut }, posthogMod] = await Promise.all([
      import("../config/firebase"),
      import("firebase/auth"),
      import("posthog-js").catch(() => null),
    ]);
    if (!auth) return;
    posthogMod?.default?.reset();
    await signOut(auth);
  }, [initFirebase]);

  return { user, loading, loginWithGoogle, loginWithEmail, signupWithEmail, logout, initFirebase };
};
