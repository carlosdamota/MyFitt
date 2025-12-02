import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, appId } from '../config/firebase';

/**
 * Hook para gestionar rate limiting de acciones del usuario
 * @param {object} user - Usuario autenticado de Firebase
 * @param {string} action - Nombre de la acción (ej. 'generate_routine')
 * @param {number} limit - Límite diario de la acción
 * @returns {object} { canPerform, remaining, resetAt, checkAndIncrement, error }
 */
export const useRateLimit = (user, action, limit) => {
  const [canPerform, setCanPerform] = useState(true);
  const [remaining, setRemaining] = useState(limit);
  const [resetAt, setResetAt] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Calcular medianoche UTC del día siguiente
  const getNextMidnightUTC = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    return tomorrow.toISOString();
  };

  // Verificar estado actual del rate limit
  useEffect(() => {
    const checkRateLimit = async () => {
      if (!user || !db || !action) {
        setLoading(false);
        return;
      }

      try {
        const rateLimitRef = doc(db, 'artifacts', appId, 'rate_limits', user.uid, action);
        const rateLimitSnap = await getDoc(rateLimitRef);

        if (!rateLimitSnap.exists()) {
          // Primera vez, crear documento
          const nextReset = getNextMidnightUTC();
          await setDoc(rateLimitRef, {
            count: 0,
            resetAt: nextReset,
            lastAction: null
          });
          setRemaining(limit);
          setResetAt(nextReset);
          setCanPerform(true);
        } else {
          const data = rateLimitSnap.data();
          const now = new Date();
          const reset = new Date(data.resetAt);

          // Si ya pasó el reset, reiniciar contador
          if (now >= reset) {
            const nextReset = getNextMidnightUTC();
            await setDoc(rateLimitRef, {
              count: 0,
              resetAt: nextReset,
              lastAction: null
            });
            setRemaining(limit);
            setResetAt(nextReset);
            setCanPerform(true);
          } else {
            // Aún dentro del período actual
            const used = data.count || 0;
            const remainingCount = Math.max(0, limit - used);
            setRemaining(remainingCount);
            setResetAt(data.resetAt);
            setCanPerform(remainingCount > 0);
          }
        }
      } catch (err) {
        console.error('Error checking rate limit:', err);
        setError('Error verificando límite de uso');
        // En caso de error, permitir la acción (fail-open)
        setCanPerform(true);
      } finally {
        setLoading(false);
      }
    };

    checkRateLimit();
  }, [user, action, limit]);

  /**
   * Verificar si se puede realizar la acción e incrementar el contador
   * @returns {Promise<boolean>} true si se puede realizar, false si se excedió el límite
   */
  const checkAndIncrement = async () => {
    if (!user || !db || !action) {
      return false;
    }

    try {
      const rateLimitRef = doc(db, 'artifacts', appId, 'rate_limits', user.uid, action);
      const rateLimitSnap = await getDoc(rateLimitRef);

      if (!rateLimitSnap.exists()) {
        // Primera vez
        const nextReset = getNextMidnightUTC();
        await setDoc(rateLimitRef, {
          count: 1,
          resetAt: nextReset,
          lastAction: new Date().toISOString()
        });
        setRemaining(limit - 1);
        setResetAt(nextReset);
        setCanPerform(limit - 1 > 0);
        return true;
      }

      const data = rateLimitSnap.data();
      const now = new Date();
      const reset = new Date(data.resetAt);

      // Si ya pasó el reset, reiniciar
      if (now >= reset) {
        const nextReset = getNextMidnightUTC();
        await setDoc(rateLimitRef, {
          count: 1,
          resetAt: nextReset,
          lastAction: now.toISOString()
        });
        setRemaining(limit - 1);
        setResetAt(nextReset);
        setCanPerform(limit - 1 > 0);
        return true;
      }

      // Verificar si se puede incrementar
      const currentCount = data.count || 0;
      if (currentCount >= limit) {
        setCanPerform(false);
        setRemaining(0);
        setError(`Has alcanzado el límite de ${limit} usos por día`);
        return false;
      }

      // Incrementar contador
      await setDoc(rateLimitRef, {
        count: currentCount + 1,
        resetAt: data.resetAt,
        lastAction: now.toISOString()
      });

      const newRemaining = Math.max(0, limit - (currentCount + 1));
      setRemaining(newRemaining);
      setCanPerform(newRemaining > 0);
      return true;
    } catch (err) {
      console.error('Error incrementing rate limit:', err);
      setError('Error al verificar límite de uso');
      // En caso de error, permitir la acción (fail-open)
      return true;
    }
  };

  return {
    canPerform,
    remaining,
    resetAt,
    checkAndIncrement,
    error,
    loading
  };
};
