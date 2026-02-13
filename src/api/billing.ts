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

const parseErrorMessage = (data: unknown, fallback: string) => {
  if (data && typeof data === "object" && "message" in data) {
    const msg = (data as { message?: string }).message;
    if (msg) return msg;
  }
  return fallback;
};

export const createCheckoutSession = async (
  successUrl?: string,
  cancelUrl?: string,
  couponId?: string,
) => {
  const token = await requireToken();
  const response = await fetch(buildUrl("/createCheckoutSession"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ successUrl, cancelUrl, couponId }),
  });

  const data = (await response.json().catch(() => ({}))) as { url?: string; message?: string };
  if (!response.ok) {
    throw new Error(parseErrorMessage(data, "checkout_failed"));
  }
  if (!data.url) throw new Error("checkout_url_missing");
  return data.url;
};

export const createBillingPortalSession = async (returnUrl?: string) => {
  const token = await requireToken();
  const response = await fetch(buildUrl("/createBillingPortal"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ returnUrl }),
  });

  const data = (await response.json().catch(() => ({}))) as { url?: string; message?: string };
  if (!response.ok) {
    throw new Error(parseErrorMessage(data, "portal_failed"));
  }
  if (!data.url) throw new Error("portal_url_missing");
  return data.url;
};
