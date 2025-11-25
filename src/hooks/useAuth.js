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

    const initAuth = async () => {
       try {
          // Soporte para token inicial inyectado (si existe en el entorno global)
          if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
          } else {
            await signInAnonymously(auth);
          }
       } catch (e) { 
         console.error("Auth Error", e); 
         setAuthError("Error de autenticación"); 
       }
    };

    initAuth();
    
    // Suscribirse a cambios de estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, setUser, (error) => {
        console.error("Auth State Error", error);
        setAuthError(error.message);
    });
    
    return () => unsubscribe(); 
  }, []);

  return { user, authError };
};
