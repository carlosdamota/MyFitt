import { getIdToken } from "firebase/auth";
import { auth } from "../config/firebase";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || "";

const buildUrl = (path: string) => {
  if (!API_BASE_URL) return path;
  return `${API_BASE_URL.replace(/\/$/, "")}${path}`;
};

const requireToken = async (): Promise<string> => {
  const user = auth?.currentUser;
  if (!user) throw new Error("auth_required");
  return getIdToken(user, true);
};

// ─── Types ──────────────────────────────────────────────────────

export interface StravaSyncPayload {
  name: string;
  elapsed_time: number; // seconds
  description?: string;
}

export interface StravaSyncResult {
  synced: boolean;
  activityId: number;
  activityUrl: string;
}

export interface StravaExchangeResult {
  linked: boolean;
  athleteName: string;
}

// ─── API Calls ──────────────────────────────────────────────────

export const exchangeStravaToken = async (code: string): Promise<StravaExchangeResult> => {
  const token = await requireToken();
  const res = await fetch(buildUrl("/stravaExchangeToken"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ code }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "exchange_failed");
  return data as StravaExchangeResult;
};

export const syncWorkoutToStrava = async (
  payload: StravaSyncPayload,
): Promise<StravaSyncResult> => {
  const token = await requireToken();
  const res = await fetch(buildUrl("/stravaSyncWorkout"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "sync_failed");
  return data as StravaSyncResult;
};

export const disconnectStrava = async (): Promise<void> => {
  const token = await requireToken();
  const res = await fetch(buildUrl("/stravaDisconnect"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || "disconnect_failed");
  }
};
