import { useState, useEffect, useCallback, useRef } from "react";

const BASE_TIMER_STORAGE_KEY = "myfitt_rest_timer_state";
const getTimerStorageKey = (uid?: string) =>
  uid ? `${BASE_TIMER_STORAGE_KEY}_${uid}` : BASE_TIMER_STORAGE_KEY;

export interface UseTimerReturn {
  timer: number;
  isTimerRunning: boolean;
  resetTimer: (seconds?: number) => void;
  toggleTimer: () => void;
  setTimer: React.Dispatch<React.SetStateAction<number>>;
}

export interface TimerState {
  timer: number;
  endTime: number | null;
  isRunning: boolean;
}

export const useTimer = (initialTime: number = 60, userId?: string): UseTimerReturn => {
  const [timer, setTimer] = useState<number>(initialTime);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const endTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Recover from localStorage when userId is available ──
  useEffect(() => {
    const storageKey = getTimerStorageKey(userId);
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed: TimerState = JSON.parse(saved);
        endTimeRef.current = parsed.endTime;
        setIsTimerRunning(parsed.isRunning);
        if (parsed.endTime && parsed.isRunning) {
          const remaining = Math.max(0, Math.ceil((parsed.endTime - Date.now()) / 1000));
          setTimer(remaining);
          if (remaining === 0) setIsTimerRunning(false);
        } else {
          setTimer(parsed.timer);
        }
      } else {
        // Reset to initial if no saved state for this user
        setTimer(initialTime);
        setIsTimerRunning(false);
        endTimeRef.current = null;
      }
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, [userId, initialTime]);

  // ── Persist to localStorage on changes ──
  useEffect(() => {
    const storageKey = getTimerStorageKey(userId);
    const state: TimerState = {
      timer: timer,
      endTime: endTimeRef.current,
      isRunning: isTimerRunning,
    };
    if (state.isRunning || (state.timer > 0 && state.timer !== initialTime)) {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [isTimerRunning, timer, initialTime, userId]);

  const calculateRemaining = useCallback(() => {
    if (!endTimeRef.current) return 0;
    const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
    return remaining;
  }, []);

  const updateTimer = useCallback(() => {
    const remaining = calculateRemaining();
    setTimer(remaining);
    if (remaining === 0) {
      setIsTimerRunning(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [calculateRemaining]);

  useEffect(() => {
    if (isTimerRunning) {
      // Immediate update
      updateTimer();
      // Tick every second
      intervalRef.current = setInterval(updateTimer, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isTimerRunning, updateTimer]);

  // Handle Page Visibility to sync timer when coming back from background
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isTimerRunning) {
        updateTimer();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isTimerRunning, updateTimer]);

  const resetTimer = useCallback(
    (seconds?: number): void => {
      const duration = seconds !== undefined ? seconds : initialTime;
      endTimeRef.current = Date.now() + duration * 1000;
      setTimer(duration);
      setIsTimerRunning(duration > 0);
    },
    [initialTime],
  );

  const toggleTimer = useCallback((): void => {
    if (isTimerRunning) {
      // Pause: calculate remaining and clear Ref
      const remaining = calculateRemaining();
      setTimer(remaining);
      setIsTimerRunning(false);
      endTimeRef.current = null;
    } else if (timer > 0) {
      // Resume: set new endTime based on current timer state
      endTimeRef.current = Date.now() + timer * 1000;
      setIsTimerRunning(true);
    }
  }, [isTimerRunning, timer, calculateRemaining]);

  return { timer, isTimerRunning, resetTimer, toggleTimer, setTimer };
};
