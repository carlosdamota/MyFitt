import { useState, useEffect } from 'react';
import { signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (!auth) {
      setAuthError("Firebase no configurado. Verifica tu archivo .env");
      return;
    }

    // Suscribirse a cambios de estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Si hay un token inicial y no hay usuario, intentar login custom
      if (!currentUser && typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        signInWithCustomToken(auth, __initial_auth_token).catch(e => {
          console.error("Custom Token Auth Error", e);
          setAuthError("Error de autenticación con token");
        });
      }
    }, (error) => {
        console.error("Auth State Error", error);
        setAuthError(error.message);
    });
    
    return () => unsubscribe(); 
  }, []);

  const login = async () => {
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
