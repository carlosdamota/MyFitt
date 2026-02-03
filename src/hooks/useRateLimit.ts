import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, appId } from "../config/firebase";
import type { User } from "firebase/auth";
import type { RateLimitData } from "../types";

export interface UseRateLimitReturn {
  canPerform: boolean;
  remaining: number;
  resetAt: string | null;
  checkAndIncrement: () => Promise<boolean>;
  error: string | null;
  loading: boolean;
}

/**
 * Hook para gestionar rate limiting de acciones del usuario
 */
export const useRateLimit = (
  user: User | null,
  action: string,
  limit: number,
): UseRateLimitReturn => {
  const isDev = import.meta.env.DEV;

  const [canPerform, setCanPerform] = useState<boolean>(true);
  const [remaining, setRemaining] = useState<number>(isDev ? 9999 : limit);
  const [resetAt, setResetAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Calcular medianoche UTC del día siguiente
  const getNextMidnightUTC = (): string => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    return tomorrow.toISOString();
  };

  // Verificar estado actual del rate limit
  useEffect(() => {
    const checkRateLimit = async (): Promise<void> => {
      if (isDev) {
        setLoading(false);
        return;
      }

      if (!user || !db || !action) {
        setLoading(false);
        return;
      }

      try {
        const rateLimitRef = doc(db, "artifacts", appId, "users", user.uid, "rate_limits", action);
        const rateLimitSnap = await getDoc(rateLimitRef);

        if (!rateLimitSnap.exists()) {
          // Primera vez, crear documento
          const nextReset = getNextMidnightUTC();
          await setDoc(rateLimitRef, {
            count: 0,
            resetAt: nextReset,
            lastAction: null,
          } satisfies RateLimitData);
          setRemaining(limit);
          setResetAt(nextReset);
          setCanPerform(true);
        } else {
          const data = rateLimitSnap.data() as RateLimitData;
          const now = new Date();
          const reset = new Date(data.resetAt);

          // Si ya pasó el reset, reiniciar contador
          if (now >= reset) {
            const nextReset = getNextMidnightUTC();
            await setDoc(rateLimitRef, {
              count: 0,
              resetAt: nextReset,
              lastAction: null,
            } satisfies RateLimitData);
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
        console.error("Error checking rate limit:", err);
        setError("Error verificando límite de uso");
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
   */
  const checkAndIncrement = async (): Promise<boolean> => {
    if (isDev) return true;

    if (!user || !db || !action) {
      return false;
    }

    try {
      const rateLimitRef = doc(db, "artifacts", appId, "users", user.uid, "rate_limits", action);
      const rateLimitSnap = await getDoc(rateLimitRef);

      if (!rateLimitSnap.exists()) {
        // Primera vez
        const nextReset = getNextMidnightUTC();
        await setDoc(rateLimitRef, {
          count: 1,
          resetAt: nextReset,
          lastAction: new Date().toISOString(),
        } satisfies RateLimitData);
        setRemaining(limit - 1);
        setResetAt(nextReset);
        setCanPerform(limit - 1 > 0);
        return true;
      }

      const data = rateLimitSnap.data() as RateLimitData;
      const now = new Date();
      const reset = new Date(data.resetAt);

      // Si ya pasó el reset, reiniciar
      if (now >= reset) {
        const nextReset = getNextMidnightUTC();
        await setDoc(rateLimitRef, {
          count: 1,
          resetAt: nextReset,
          lastAction: now.toISOString(),
        } satisfies RateLimitData);
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
        lastAction: now.toISOString(),
      } satisfies RateLimitData);

      const newRemaining = Math.max(0, limit - (currentCount + 1));
      setRemaining(newRemaining);
      setCanPerform(newRemaining > 0);
      return true;
    } catch (err) {
      console.error("Error incrementing rate limit:", err);
      setError("Error al verificar límite de uso");
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
    loading,
  };
};
