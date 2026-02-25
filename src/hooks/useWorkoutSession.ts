import { useState, useEffect, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { doc, setDoc, collection, addDoc } from "firebase/firestore";
import { db, appId } from "../config/firebase";
import type { User } from "firebase/auth";
import type { WorkoutLogs, WorkoutLogEntry } from "../types";
import posthog from "posthog-js";

const STORAGE_KEY = "myfitt_pending_session";

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
  flushSession: (metadata: { duration?: string; routineTitle?: string }) => Promise<void>;
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

  // ── Recover from localStorage on mount ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: PendingSession = JSON.parse(saved);
        if (parsed.logs && Object.keys(parsed.logs).length > 0) {
          setPendingLogs(parsed.logs);
          setStartedAt(parsed.startedAt);
        }
      }
    } catch {
      // Corrupted data, ignore
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // ── Persist to localStorage on every change ──
  useEffect(() => {
    if (Object.keys(pendingLogs).length > 0) {
      const session: PendingSession = {
        logs: pendingLogs,
        startedAt: startedAt || new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [pendingLogs, startedAt]);

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
    async (metadata: { duration?: string; routineTitle?: string }) => {
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
          logs: currentLogs,
        });

        // 2. Update lastWorkoutDate on profile (for re-engagement schedulers)
        const profileRef = doc(db, "artifacts", appId, "users", user.uid, "app_data", "profile");
        await setDoc(profileRef, { lastWorkoutDate: new Date().toISOString() }, { merge: true });

        // 3. Invalidate TanStack query so the UI re-fetches the actual Firestore data
        await queryClient.invalidateQueries({ queryKey: ["workout_sessions", user.uid] });

        // 4. Clear local state
        setPendingLogs({});
        setStartedAt(null);
        localStorage.removeItem(STORAGE_KEY);

        posthog.capture("workout_completed", {
          duration: metadata.duration || null,
          routine_title: metadata.routineTitle || null,
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
    setPendingLogs({});
    setStartedAt(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

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
