import { onRequest } from "firebase-functions/v2/https";
import type { Firestore } from "firebase-admin/firestore";
import type { Auth } from "firebase-admin/auth";
import type { Request, Response } from "express";
import { getAllowedOrigins, isOriginAllowed, setCors, sendJson, requireAuth } from "./http.js";
import { integrationsCollection, profileDoc } from "./data.js";

// ─── Types ──────────────────────────────────────────────────────
interface StravaFunctionDeps {
  db: Firestore;
  auth: Auth;
  appId: string;
  webOrigin: string;
  stravaClientId: string;
  stravaClientSecret: string;
}

interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete: { id: number; firstname: string; lastname: string };
}

// ─── Helpers ────────────────────────────────────────────────────

/** Shared CORS + method guard that every Strava endpoint uses. */
const guard = (req: Request, res: Response, allowedOrigins: string[]): boolean => {
  setCors(req.headers.origin, res, allowedOrigins);
  if (!isOriginAllowed(req.headers.origin, allowedOrigins)) {
    sendJson(res, 403, { error: "origin_not_allowed" });
    return false;
  }
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return false;
  }
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "method_not_allowed" });
    return false;
  }
  return true;
};

/** Refresh an expired Strava access_token using the refresh_token. */
async function refreshStravaToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string,
): Promise<{ access_token: string; refresh_token: string; expires_at: number }> {
  const resp = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`strava_refresh_failed: ${resp.status} ${body}`);
  }
  return resp.json();
}

/** Get a valid access_token, refreshing if necessary. */
async function getValidToken(
  stravaDoc: FirebaseFirestore.DocumentReference,
  clientId: string,
  clientSecret: string,
): Promise<string> {
  const snap = await stravaDoc.get();
  if (!snap.exists) throw new Error("strava_not_linked");

  const data = snap.data()!;
  const nowSecs = Math.floor(Date.now() / 1000);

  if (data.expires_at && data.expires_at > nowSecs + 60) {
    return data.access_token as string;
  }

  // Token expired → refresh
  const refreshed = await refreshStravaToken(data.refresh_token as string, clientId, clientSecret);
  await stravaDoc.update({
    access_token: refreshed.access_token,
    refresh_token: refreshed.refresh_token,
    expires_at: refreshed.expires_at,
  });
  return refreshed.access_token;
}

// ═══════════════════════════════════════════════════════════════
// 1. Exchange OAuth code for tokens
// ═══════════════════════════════════════════════════════════════
export const createStravaExchangeTokenFunction = ({
  db,
  auth,
  appId,
  webOrigin,
  stravaClientId,
  stravaClientSecret,
}: StravaFunctionDeps) => {
  return onRequest(
    { timeoutSeconds: 30, invoker: "public" },
    async (req: Request, res: Response) => {
      const allowedOrigins = getAllowedOrigins(webOrigin);
      if (!guard(req, res, allowedOrigins)) return;

      try {
        const { uid } = await requireAuth(req, auth);
        const { code } = req.body as { code?: string };

        if (!code) {
          sendJson(res, 400, { error: "missing_code" });
          return;
        }

        // Exchange code for tokens
        const tokenRes = await fetch("https://www.strava.com/oauth/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: stravaClientId,
            client_secret: stravaClientSecret,
            code,
            grant_type: "authorization_code",
          }),
        });

        if (!tokenRes.ok) {
          const body = await tokenRes.text();
          console.error("Strava token exchange failed:", tokenRes.status, body);
          sendJson(res, 502, { error: "strava_exchange_failed" });
          return;
        }

        const tokenData: StravaTokenResponse = await tokenRes.json();

        // Store tokens securely in Firestore integrations subcollection
        const stravaRef = integrationsCollection(db, appId, uid).doc("strava");
        await stravaRef.set({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: tokenData.expires_at,
          athleteId: tokenData.athlete.id,
          athleteName: `${tokenData.athlete.firstname} ${tokenData.athlete.lastname}`.trim(),
          linkedAt: new Date().toISOString(),
        });

        // Update user profile with public metadata (no secrets)
        const profRef = profileDoc(db, appId, uid);
        await profRef.set(
          {
            strava: {
              linked: true,
              athleteId: tokenData.athlete.id,
              athleteName: `${tokenData.athlete.firstname} ${tokenData.athlete.lastname}`.trim(),
            },
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        );

        sendJson(res, 200, {
          linked: true,
          athleteName: `${tokenData.athlete.firstname} ${tokenData.athlete.lastname}`.trim(),
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "unknown_error";
        console.error("stravaExchangeToken error:", message);
        sendJson(res, 500, { error: "exchange_failed", message });
      }
    },
  );
};

// ═══════════════════════════════════════════════════════════════
// 2. Sync a workout to Strava
// ═══════════════════════════════════════════════════════════════
export const createStravaSyncWorkoutFunction = ({
  db,
  auth,
  appId,
  webOrigin,
  stravaClientId,
  stravaClientSecret,
}: StravaFunctionDeps) => {
  return onRequest(
    { timeoutSeconds: 30, invoker: "public" },
    async (req: Request, res: Response) => {
      const allowedOrigins = getAllowedOrigins(webOrigin);
      if (!guard(req, res, allowedOrigins)) return;

      try {
        const { uid } = await requireAuth(req, auth);
        const { name, description, elapsed_time } = req.body as {
          name?: string;
          description?: string;
          elapsed_time?: number; // seconds
        };

        if (!name || !elapsed_time) {
          sendJson(res, 400, { error: "missing_fields", required: ["name", "elapsed_time"] });
          return;
        }

        const stravaRef = integrationsCollection(db, appId, uid).doc("strava");
        const accessToken = await getValidToken(stravaRef, stravaClientId, stravaClientSecret);

        // Create activity in Strava
        const activityRes = await fetch("https://www.strava.com/api/v3/activities", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            type: "WeightTraining",
            sport_type: "WeightTraining",
            start_date_local: new Date().toISOString(),
            elapsed_time,
            description: description || "Entrenamiento registrado con FittWiz 💪",
            trainer: true,
          }),
        });

        if (!activityRes.ok) {
          const body = await activityRes.text();
          console.error("Strava create activity failed:", activityRes.status, body);
          sendJson(res, 502, { error: "strava_sync_failed" });
          return;
        }

        const activity = await activityRes.json();

        sendJson(res, 200, {
          synced: true,
          activityId: activity.id,
          activityUrl: `https://www.strava.com/activities/${activity.id}`,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "unknown_error";
        if (message === "strava_not_linked") {
          sendJson(res, 400, { error: "strava_not_linked" });
          return;
        }
        console.error("stravaSyncWorkout error:", message);
        sendJson(res, 500, { error: "sync_failed", message });
      }
    },
  );
};

// ═══════════════════════════════════════════════════════════════
// 3. Disconnect Strava
// ═══════════════════════════════════════════════════════════════
export const createStravaDisconnectFunction = ({
  db,
  auth,
  appId,
  webOrigin,
  stravaClientId,
  stravaClientSecret,
}: StravaFunctionDeps) => {
  return onRequest(
    { timeoutSeconds: 30, invoker: "public" },
    async (req: Request, res: Response) => {
      const allowedOrigins = getAllowedOrigins(webOrigin);
      if (!guard(req, res, allowedOrigins)) return;

      try {
        const { uid } = await requireAuth(req, auth);
        const stravaRef = integrationsCollection(db, appId, uid).doc("strava");

        // Try to deauthorize on Strava's side
        try {
          const accessToken = await getValidToken(stravaRef, stravaClientId, stravaClientSecret);
          await fetch("https://www.strava.com/oauth/deauthorize", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          });
        } catch {
          // If deauthorize fails (e.g. token already invalid), continue with local cleanup
        }

        // Delete Strava integration doc
        await stravaRef.delete();

        // Remove strava metadata from profile
        const profRef = profileDoc(db, appId, uid);
        const { FieldValue } = await import("firebase-admin/firestore");
        await profRef.update({ strava: FieldValue.delete(), updatedAt: new Date().toISOString() });

        sendJson(res, 200, { disconnected: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : "unknown_error";
        console.error("stravaDisconnect error:", message);
        sendJson(res, 500, { error: "disconnect_failed", message });
      }
    },
  );
};
