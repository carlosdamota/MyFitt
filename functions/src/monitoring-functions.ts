import { onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { auth as authV1 } from "firebase-functions/v1";
import type { Firestore } from "firebase-admin/firestore";
import type { Auth } from "firebase-admin/auth";
import { FieldValue } from "firebase-admin/firestore";
import type { Request } from "express";
import { z } from "zod";
import { monitoringEventsCollection } from "./data.js";
import { getAllowedOrigins, isOriginAllowed, requireAuth, sendJson, setCors } from "./http.js";

type MonitoringCategory = "technical" | "business";
type MonitoringSeverity = "critical" | "warning" | "info";
type MonitoringStatus = "pending" | "sent" | "failed" | "suppressed";

export interface MonitoringEventInput {
  eventType: string;
  category: MonitoringCategory;
  severity: MonitoringSeverity;
  source: "frontend" | "function" | "stripe" | "scheduler" | "identity";
  userId?: string | null;
  fingerprint?: string | null;
  dedupeKey?: string | null;
  context?: Record<string, unknown>;
  environment?: string;
  release?: string;
}

interface MonitoringDeps {
  db: Firestore;
  auth: Auth;
  appId: string;
  webOrigin: string;
  environment?: string;
}

const emitEventSchema = z.object({
  eventType: z.string().min(3).max(100),
  category: z.enum(["technical", "business"]),
  severity: z.enum(["critical", "warning", "info"]).default("info"),
  fingerprint: z.string().max(120).optional(),
  dedupeKey: z.string().max(180).optional(),
  context: z.record(z.string(), z.unknown()).optional(),
  release: z.string().max(80).optional(),
});

const cleanContext = (context?: Record<string, unknown>) => {
  if (!context) return {};
  const blockedKeys = new Set(["token", "password", "secret", "authorization", "cookie"]);
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(context)) {
    const lowered = key.toLowerCase();
    if (blockedKeys.has(lowered)) continue;
    if (
      value === null ||
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      output[key] = value;
      continue;
    }
    if (Array.isArray(value)) {
      output[key] = value.slice(0, 20).map((item) =>
        item === null || ["string", "number", "boolean"].includes(typeof item)
          ? item
          : JSON.stringify(item).slice(0, 200),
      );
      continue;
    }
    output[key] = JSON.stringify(value).slice(0, 400);
  }
  return output;
};

const normalizeDedupeKey = (input: MonitoringEventInput) => {
  if (input.dedupeKey) return input.dedupeKey.slice(0, 180);
  return `${input.category}:${input.severity}:${input.source}:${input.eventType}:${input.fingerprint ?? "-"}`;
};

const formatContext = (context: Record<string, unknown>) => {
  const keys = Object.keys(context);
  if (keys.length === 0) return "";
  const lines = keys.slice(0, 8).map((key) => `- ${key}: ${String(context[key])}`);
  return `\n\nDetalles:\n${lines.join("\n")}`;
};

const buildTelegramText = (event: Record<string, unknown>) => {
  const severity = String(event.severity || "info") as MonitoringSeverity;
  const emoji = severity === "critical" ? "🚨" : severity === "warning" ? "⚠️" : "ℹ️";
  const userId = typeof event.userId === "string" ? event.userId : "";
  const shortUserId = userId ? `${userId.slice(0, 6)}...${userId.slice(-4)}` : null;
  const head = `${emoji} *${String(event.eventType)}*`;
  const meta = [
    `Categoria: ${String(event.category)}`,
    `Severidad: ${severity}`,
    `Origen: ${String(event.source)}`,
    `Entorno: ${String(event.environment ?? "unknown")}`,
    shortUserId ? `Usuario: ${shortUserId}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const eventType = String(event.eventType || "");
  const shouldHideContext = eventType === "new_user_signup" || eventType === "account_deleted_auth";
  const context = shouldHideContext
    ? ""
    : formatContext((event.context as Record<string, unknown>) ?? {});
  return `${head}\n${meta}${context}`;
};

export const createMonitoringFunctions = ({
  db,
  auth,
  appId,
  webOrigin,
  environment,
}: MonitoringDeps) => {
  const alertsRef = monitoringEventsCollection(db, appId);
  const env = environment || process.env.MONITORING_ENV || process.env.NODE_ENV || "production";
  const monitoringEnabled = process.env.MONITORING_ENABLED !== "false";
  const maxAttempts = Number(process.env.ALERT_MAX_ATTEMPTS ?? "4");
  const dedupeWindowMinutes = Number(process.env.ALERT_DEDUPE_WINDOW_MINUTES ?? "15");
  const maxPerWindow = Number(process.env.ALERT_MAX_PER_WINDOW ?? "5");
  const dispatchBatchSize = Number(process.env.ALERT_DISPATCH_BATCH_SIZE ?? "50");

  const enqueueMonitoringEvent = async (input: MonitoringEventInput) => {
    if (!monitoringEnabled) return;

    await alertsRef.add({
      eventType: input.eventType,
      category: input.category,
      severity: input.severity,
      source: input.source,
      userId: input.userId ?? null,
      status: "pending" as MonitoringStatus,
      fingerprint: input.fingerprint ?? null,
      dedupeKey: normalizeDedupeKey(input),
      context: cleanContext(input.context),
      attempts: 0,
      nextAttemptAt: new Date(),
      environment: input.environment ?? env,
      release: input.release ?? null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      sentAt: null,
      lastError: null,
    });
  };

  const emitMonitoringEvent = onRequest({ timeoutSeconds: 30, invoker: "public" }, async (req, res) => {
    const allowedOrigins = getAllowedOrigins(webOrigin);
    setCors(req.headers.origin, res, allowedOrigins);

    if (!isOriginAllowed(req.headers.origin, allowedOrigins)) {
      sendJson(res, 403, { error: "origin_not_allowed" });
      return;
    }
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }
    if (req.method !== "POST") {
      sendJson(res, 405, { error: "method_not_allowed" });
      return;
    }

    try {
      const { uid } = await requireAuth(req as Request, auth);
      const parsed = emitEventSchema.parse(req.body);

      await enqueueMonitoringEvent({
        eventType: parsed.eventType,
        category: parsed.category,
        severity: parsed.severity,
        source: "frontend",
        userId: uid,
        fingerprint: parsed.fingerprint,
        dedupeKey: parsed.dedupeKey,
        context: parsed.context,
        release: parsed.release,
      });

      sendJson(res, 200, { ok: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "emit_monitoring_event_failed";
      sendJson(res, 400, { error: "invalid_payload", message });
    }
  });

  const trackNewUserSignup = authV1.user().onCreate(async (user) => {
    if (!user) return;

    await enqueueMonitoringEvent({
      eventType: "new_user_signup",
      category: "business",
      severity: "info",
      source: "identity",
      userId: user.uid,
      dedupeKey: `signup:${user.uid}`,
      context: {},
    });
  });

  const trackUserDeleted = authV1.user().onDelete(async (user) => {
    if (!user) return;

    await enqueueMonitoringEvent({
      eventType: "account_deleted_auth",
      category: "business",
      severity: "warning",
      source: "identity",
      userId: user.uid,
      dedupeKey: `account_deleted_auth:${user.uid}`,
      context: {},
    });
  });

  const dispatchMonitoringAlerts = onSchedule(
    { schedule: "every 1 minutes", timeZone: "UTC", timeoutSeconds: 120 },
    async () => {
      if (!monitoringEnabled) return;

      const botToken = process.env.TELEGRAM_BOT_TOKEN ?? "";
      const techChatId = process.env.TELEGRAM_CHAT_ID_TECH ?? "";
      const bizChatId = process.env.TELEGRAM_CHAT_ID_BIZ ?? "";
      if (!botToken || (!techChatId && !bizChatId)) return;

      const now = new Date();
      const pendingSnap = await alertsRef
        .where("status", "==", "pending")
        .where("nextAttemptAt", "<=", now)
        .orderBy("nextAttemptAt", "asc")
        .limit(dispatchBatchSize)
        .get();

      for (const docSnap of pendingSnap.docs) {
        const data = docSnap.data() as Record<string, unknown>;
        const dedupeKey = String(data.dedupeKey || "");
        const recentThreshold = new Date(now.getTime() - dedupeWindowMinutes * 60 * 1000);

        const recentSent = await alertsRef
          .where("dedupeKey", "==", dedupeKey)
          .where("status", "==", "sent")
          .where("createdAt", ">=", recentThreshold)
          .limit(maxPerWindow)
          .get();

        if (recentSent.size >= maxPerWindow) {
          await docSnap.ref.set(
            {
              status: "suppressed" as MonitoringStatus,
              updatedAt: FieldValue.serverTimestamp(),
              lastError: "suppressed_by_rate_limit",
            },
            { merge: true },
          );
          continue;
        }

        const category = String(data.category || "technical") as MonitoringCategory;
        const chatId = category === "technical" ? techChatId || bizChatId : bizChatId || techChatId;
        if (!chatId) continue;

        try {
          const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: buildTelegramText(data),
              parse_mode: "Markdown",
              disable_web_page_preview: true,
            }),
          });

          if (!response.ok) {
            throw new Error(`telegram_http_${response.status}`);
          }

          await docSnap.ref.set(
            {
              status: "sent" as MonitoringStatus,
              sentAt: FieldValue.serverTimestamp(),
              updatedAt: FieldValue.serverTimestamp(),
              lastError: null,
            },
            { merge: true },
          );
        } catch (error) {
          const attempts = Number(data.attempts || 0) + 1;
          const backoffMinutes = Math.min(60, Math.pow(2, attempts));
          const nextAttemptAt = new Date(now.getTime() + backoffMinutes * 60 * 1000);
          const status: MonitoringStatus = attempts >= maxAttempts ? "failed" : "pending";

          await docSnap.ref.set(
            {
              attempts,
              status,
              nextAttemptAt,
              updatedAt: FieldValue.serverTimestamp(),
              lastError: error instanceof Error ? error.message : "telegram_send_failed",
            },
            { merge: true },
          );
        }
      }
    },
  );

  const cleanupMonitoringEvents = onSchedule(
    { schedule: "every day 03:30", timeZone: "UTC", timeoutSeconds: 120 },
    async () => {
      const retentionDays = Number(process.env.ALERT_RETENTION_DAYS ?? "30");
      const threshold = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

      const oldEvents = await alertsRef.where("createdAt", "<", threshold).limit(300).get();
      if (oldEvents.empty) return;

      const batch = db.batch();
      oldEvents.docs.forEach((eventDoc) => batch.delete(eventDoc.ref));
      await batch.commit();
    },
  );

  return {
    enqueueMonitoringEvent,
    emitMonitoringEvent,
    dispatchMonitoringAlerts,
    cleanupMonitoringEvents,
    trackNewUserSignup,
    trackUserDeleted,
  };
};
