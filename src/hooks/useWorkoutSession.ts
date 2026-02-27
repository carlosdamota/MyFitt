import { useState, useEffect, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { doc, setDoc, collection, addDoc } from "firebase/firestore";
import { db, appId } from "../config/firebase";
import type { User } from "firebase/auth";
import type { WorkoutLogs, WorkoutLogEntry } from "../types";
import posthog from "posthog-js";

const BASE_STORAGE_KEY = "myfitt_pending_session";
const getStorageKey = (uid: string) => `${BASE_STORAGE_KEY}_${uid}`;

interface PendingSession {
  logs: WorkoutLogs;
  startedAt: string;
}

export interface UseWorkoutSessionReturn {
  /** Logs accumulated during the current active session */
  pendingLogs: WorkoutLogs;
  /** Whether there is an active session with pending logs */
  isSessionActive: boolean;
  /** Add a log entry to the local buffer (no Firestore write) */
  addLog: (exerciseName: string, entry: WorkoutLogEntry) => void;
  /** Remove a log entry from the local buffer (no Firestore write) */
  removeLog: (exerciseName: string, logToRemove: WorkoutLogEntry) => void;
  /** Flush the entire session to Firestore as a single write */
  flushSession: (metadata: {
    duration?: string;
    routineTitle?: string;
    rating?: number;
  }) => Promise<void>;
  /** Discard the current session without saving */
  clearSession: () => void;
}

export const useWorkoutSession = (user: User | null): UseWorkoutSessionReturn => {
  const queryClient = useQueryClient();
  const [pendingLogs, setPendingLogs] = useState<WorkoutLogs>({});
  const [startedAt, setStartedAt] = useState<string | null>(null);

  // Use ref to always have latest pendingLogs in callbacks without re-creating them
  const pendingLogsRef = useRef(pendingLogs);
  pendingLogsRef.current = pendingLogs;

  // ── Recover from localStorage when user is available ──
  useEffect(() => {
    if (!user) {
      setPendingLogs({});
      setStartedAt(null);
      return;
    }

    const storageKey = getStorageKey(user.uid);
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed: PendingSession = JSON.parse(saved);
        if (parsed.logs && Object.keys(parsed.logs).length > 0) {
          setPendingLogs(parsed.logs);
          setStartedAt(parsed.startedAt);
        } else {
          setPendingLogs({});
          setStartedAt(null);
        }
      } else {
        setPendingLogs({});
        setStartedAt(null);
      }
    } catch {
      // Corrupted data, ignore
      localStorage.removeItem(storageKey);
      setPendingLogs({});
      setStartedAt(null);
    }
  }, [user]);

  // ── Persist to localStorage on every change ──
  useEffect(() => {
    if (!user) return;

    const storageKey = getStorageKey(user.uid);
    if (Object.keys(pendingLogs).length > 0) {
      const session: PendingSession = {
        logs: pendingLogs,
        startedAt: startedAt || new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(session));
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [pendingLogs, startedAt, user]);

  // ── Add a log to the local buffer ──
  const addLog = useCallback((exerciseName: string, entry: WorkoutLogEntry) => {
    setPendingLogs((prev) => {
      const updated = { ...prev };
      const existing = updated[exerciseName] || [];
      updated[exerciseName] = [...existing, entry];
      return updated;
    });

    // Start session timestamp on first log
    setStartedAt((prev) => {
      if (!prev) {
        posthog.capture("workout_started");
      }
      return prev || new Date().toISOString();
    });
  }, []);

  // ── Remove a log from the local buffer ──
  const removeLog = useCallback((exerciseName: string, logToRemove: WorkoutLogEntry) => {
    setPendingLogs((prev) => {
      const updated = { ...prev };
      const existing = updated[exerciseName] || [];
      updated[exerciseName] = existing.filter((l) => l.date !== logToRemove.date);

      // Clean up empty arrays
      if (updated[exerciseName].length === 0) {
        delete updated[exerciseName];
      }
      return updated;
    });
  }, []);

  // ── Flush: single Firestore write with the whole session ──
  const flushSession = useCallback(
    async (metadata: { duration?: string; routineTitle?: string; rating?: number }) => {
      if (!user || !db) return;

      const currentLogs = pendingLogsRef.current;
      if (Object.keys(currentLogs).length === 0) return;

      const sessionDate = startedAt || new Date().toISOString();

      try {
        // 1. Write session document to subcollection
        const sessionsRef = collection(
          db,
          "artifacts",
          appId,
          "users",
          user.uid,
          "workout_sessions",
        );

        await addDoc(sessionsRef, {
          date: sessionDate,
          duration: metadata.duration || null,
          routineTitle: metadata.routineTitle || null,
          rating: metadata.rating || null,
          logs: currentLogs,
        });

        // 2. Update lastWorkoutDate on profile (for re-engagement schedulers)
        const profileRef = doc(db, "artifacts", appId, "users", user.uid, "app_data", "profile");
        await setDoc(profileRef, { lastWorkoutDate: new Date().toISOString() }, { merge: true });

        // 3. Invalidate TanStack queries so the UI re-fetches the actual Firestore data
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["workout_sessions", user.uid] }),
          queryClient.invalidateQueries({ queryKey: ["workout_sessions_recent", user.uid] }),
          queryClient.invalidateQueries({ queryKey: ["user_stats", user.uid] }),
          queryClient.invalidateQueries({ queryKey: ["appData", user.uid] }),
        ]);

        // 4. Clear local state
        setPendingLogs({});
        setStartedAt(null);
        localStorage.removeItem(getStorageKey(user.uid));

        posthog.capture("workout_completed", {
          duration: metadata.duration || null,
          routine_title: metadata.routineTitle || null,
          rating: metadata.rating || null,
        });
      } catch (e) {
        console.error("Session flush error", e);
        // Don't clear local state on error — data is preserved for retry
        throw e;
      }
    },
    [user, startedAt],
  );

  // ── Discard session ──
  const clearSession = useCallback(() => {
    if (!user) return;
    setPendingLogs({});
    setStartedAt(null);
    localStorage.removeItem(getStorageKey(user.uid));
  }, [user]);

  const isSessionActive = Object.keys(pendingLogs).length > 0;

  return {
    pendingLogs,
    isSessionActive,
    addLog,
    removeLog,
    flushSession,
    clearSession,
  };
};
