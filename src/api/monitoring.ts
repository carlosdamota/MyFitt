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

export type MonitoringEventCategory = "technical" | "business";
export type MonitoringEventSeverity = "critical" | "warning" | "info";

interface EmitMonitoringEventPayload {
  eventType: string;
  category: MonitoringEventCategory;
  severity: MonitoringEventSeverity;
  fingerprint?: string;
  dedupeKey?: string;
  context?: Record<string, unknown>;
  release?: string;
}

export const emitMonitoringEvent = async (payload: EmitMonitoringEventPayload): Promise<void> => {
  try {
    const token = await requireToken();
    await fetch(buildUrl("/emitMonitoringEvent"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // Monitoring must never break UX flows
  }
};
