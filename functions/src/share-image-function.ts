import { getStorage } from "firebase-admin/storage";
import { onRequest } from "firebase-functions/v2/https";
import type { Auth } from "firebase-admin/auth";
import { getAllowedOrigins, isOriginAllowed, requireAuth, sendJson, setCors } from "./http.js";

interface ShareImageFunctionDeps {
  auth: Auth;
  appId: string;
  webOrigin: string;
}

const decodeBase64Image = (base64: string): Buffer => {
  const sanitized = base64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "");
  return Buffer.from(sanitized, "base64");
};

export const createShareImageFunction = ({ auth, appId, webOrigin }: ShareImageFunctionDeps) => {
  const allowedOrigins = getAllowedOrigins(webOrigin);

  return onRequest({ region: "us-central1", memory: "256MiB", timeoutSeconds: 60 }, async (req, res) => {
    setCors(req.headers.origin, res, allowedOrigins);

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (!isOriginAllowed(req.headers.origin, allowedOrigins)) {
      sendJson(res, 403, { error: "origin_not_allowed" });
      return;
    }

    if (req.method !== "POST") {
      sendJson(res, 405, { error: "method_not_allowed" });
      return;
    }

    try {
      const { uid } = await requireAuth(req, auth);
      const imageBase64 = typeof req.body?.imageBase64 === "string" ? req.body.imageBase64 : "";
      const mimeType = typeof req.body?.mimeType === "string" ? req.body.mimeType : "image/png";

      if (!imageBase64) {
        sendJson(res, 400, { error: "missing_image" });
        return;
      }

      const imageBuffer = decodeBase64Image(imageBase64);
      if (imageBuffer.byteLength > 10 * 1024 * 1024) {
        sendJson(res, 413, { error: "image_too_large" });
        return;
      }

      const extension = mimeType.includes("jpeg") ? "jpg" : "png";
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
      const storagePath = `artifacts/${appId}/share_images/${uid}/${fileName}`;

      const bucket = getStorage().bucket();
      const file = bucket.file(storagePath);

      await file.save(imageBuffer, {
        contentType: mimeType,
        metadata: {
          cacheControl: "public, max-age=31536000, immutable",
          metadata: {
            appId,
            uid,
            purpose: "workout_share_image",
          },
        },
      });

      const [shareUrl] = await file.getSignedUrl({
        action: "read",
        expires: "2100-01-01",
      });

      sendJson(res, 200, {
        shareUrl,
        ogImage: shareUrl,
        storagePath,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown_error";
      const status = message === "missing_auth" ? 401 : 500;
      sendJson(res, status, { error: message });
    }
  });
};
