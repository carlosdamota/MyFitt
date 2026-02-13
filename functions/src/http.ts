import type { Auth } from "firebase-admin/auth";
import type { Request, Response } from "express";

type PlanType = "free" | "pro";

const normalizeOrigin = (value: string) => value.trim().replace(/\/$/, "");

export const getAllowedOrigins = (webOrigin: string) =>
  webOrigin.split(",").map(normalizeOrigin).filter(Boolean);

export const isOriginAllowed = (origin: string | undefined, allowedOrigins: string[]) => {
  if (!origin) return true;
  if (allowedOrigins.length === 0) return true;
  const requestOrigin = normalizeOrigin(origin);
  return allowedOrigins.includes(requestOrigin);
};

export const sanitizeReturnUrl = (value: unknown, allowedOrigins: string[]) => {
  if (!value) return "";
  try {
    const url = new URL(String(value));
    const origin = normalizeOrigin(url.origin);
    if (allowedOrigins.length > 0 && !allowedOrigins.includes(origin)) return "";
    return url.toString();
  } catch {
    return "";
  }
};

export const setCors = (
  origin: string | undefined,
  res: Response,
  allowedOrigins: string[],
) => {
  const requestOrigin = origin ? normalizeOrigin(origin) : "";

  if (allowedOrigins.length > 0) {
    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      res.setHeader("Access-Control-Allow-Origin", requestOrigin);
      res.setHeader("Vary", "Origin");
    }
  } else if (requestOrigin) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
};

export const sendJson = (res: Response, status: number, payload: Record<string, unknown>) => {
  res.status(status).json(payload);
};

export const requireAuth = async (
  req: Request,
  firebaseAuth: Auth,
): Promise<{ uid: string; plan: PlanType }> => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    throw new Error("missing_auth");
  }
  const token = header.replace("Bearer ", "").trim();
  const decoded = await firebaseAuth.verifyIdToken(token);
  const plan = (decoded.plan as PlanType) || "free";
  return { uid: decoded.uid, plan };
};
