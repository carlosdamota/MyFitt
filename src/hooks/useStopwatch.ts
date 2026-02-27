import { useState, useEffect, useCallback, useRef } from "react";

const BASE_STOPWATCH_STORAGE_KEY = "myfitt_stopwatch_state";
const getStopwatchStorageKey = (uid?: string) =>
  uid ? `${BASE_STOPWATCH_STORAGE_KEY}_${uid}` : BASE_STOPWATCH_STORAGE_KEY;

export interface UseStopwatchReturn {
  time: number;
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
  toggle: () => void;
  formatTime: (timeInSeconds: number) => string;
}

export interface StopwatchState {
  offset: number;
  startTime: number | null;
  isRunning: boolean;
}

export const useStopwatch = (initialTime: number = 0, userId?: string): UseStopwatchReturn => {
  const [time, setTime] = useState<number>(initialTime);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const startTimeRef = useRef<number | null>(null);
  const offsetRef = useRef<number>(initialTime);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Recover from localStorage when userId is available ──
  useEffect(() => {
    const storageKey = getStopwatchStorageKey(userId);
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed: StopwatchState = JSON.parse(saved);
        offsetRef.current = parsed.offset;
        startTimeRef.current = parsed.startTime;
        setIsRunning(parsed.isRunning);
        // Initial calculation
        if (parsed.startTime && parsed.isRunning) {
          setTime(parsed.offset + Math.floor((Date.now() - parsed.startTime) / 1000));
        } else {
          setTime(parsed.offset);
        }
      } else {
        // Reset if no saved state for this user
        setTime(initialTime);
        setIsRunning(false);
        startTimeRef.current = null;
        offsetRef.current = initialTime;
      }
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, [userId, initialTime]);

  // ── Persist to localStorage on changes ──
  useEffect(() => {
    const storageKey = getStopwatchStorageKey(userId);
    const state: StopwatchState = {
      offset: offsetRef.current,
      startTime: startTimeRef.current,
      isRunning: isRunning,
    };
    if (state.offset > 0 || state.isRunning) {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [isRunning, time, userId]); // Using time as a proxy for offset updates during interval

  const calculateElapsed = useCallback(() => {
    if (!startTimeRef.current) return offsetRef.current;
    return offsetRef.current + Math.floor((Date.now() - startTimeRef.current) / 1000);
  }, []);

  const updateTime = useCallback(() => {
    setTime(calculateElapsed());
  }, [calculateElapsed]);

  useEffect(() => {
    if (isRunning) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }
      updateTime();
      intervalRef.current = setInterval(updateTime, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (startTimeRef.current) {
        offsetRef.current = calculateElapsed();
        startTimeRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, updateTime, calculateElapsed]);

  // Handle Page Visibility to sync timer when coming back from background
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isRunning) {
        updateTime();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isRunning, updateTime]);

  const start = () => setIsRunning(true);
  const stop = () => setIsRunning(false);
  const reset = () => {
    setIsRunning(false);
    startTimeRef.current = null;
    offsetRef.current = 0;
    setTime(0);
    localStorage.removeItem(getStopwatchStorageKey(userId));
  };
  const toggle = () => setIsRunning((prev) => !prev);

  const formatTime = (timeInSeconds: number): string => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;

    const pad = (num: number) => num.toString().padStart(2, "0");

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  return { time, isRunning, start, stop, reset, toggle, formatTime };
};
