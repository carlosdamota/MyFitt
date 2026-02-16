import { getIdToken } from "firebase/auth";
import { auth } from "../config/firebase";

export type AiTask =
  | "exercise_instructions"
  | "exercise_analysis"
  | "volume_trend"
  | "weekly_coach"
  | "nutrition_parse"
  | "routine_program";

export interface AiResponse {
  text: string;
  remaining: number;
  resetAt: string | null;
  plan: "free" | "pro";
}

export class AiError extends Error {
  code: string;
  resetAt?: string | null;
  remaining?: number;

  constructor(message: string, code: string, resetAt?: string | null, remaining?: number) {
    super(message);
    this.code = code;
    this.resetAt = resetAt;
    this.remaining = remaining;
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || "";

const buildUrl = (path: string) => {
  if (!API_BASE_URL) return path;
  return `${API_BASE_URL.replace(/\/$/, "")}${path}`;
};

const requireToken = async (): Promise<string> => {
  const user = auth?.currentUser;
  if (!user) throw new AiError("Debes iniciar sesion para usar IA.", "auth_required");
  return getIdToken(user, true);
};

export const callAI = async (
  task: AiTask,
  payload: Record<string, unknown>,
  options?: {
    image?: string;
    imageMimeType?: string;
  },
): Promise<AiResponse> => {
  const token = await requireToken();
  const response = await fetch(buildUrl("/aiGenerate"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      task,
      payload,
      ...(options?.image ? { image: options.image } : {}),
      ...(options?.imageMimeType ? { imageMimeType: options.imageMimeType } : {}),
    }),
  });

  if (response.status === 401) {
    throw new AiError("Debes iniciar sesion para usar IA.", "auth_required");
  }

  const data = (await response.json()) as {
    text?: string;
    error?: string;
    message?: string;
    resetAt?: string | null;
    remaining?: number;
  };

  if (!response.ok) {
    if (response.status === 429) {
      throw new AiError(
        data.message || "Has alcanzado el limite de IA.",
        "quota_exceeded",
        data.resetAt ?? null,
        data.remaining,
      );
    }
    throw new AiError(data.message || "Error al usar IA.", data.error || "ai_failed");
  }

  return {
    text: data.text || "",
    remaining: data.remaining ?? 0,
    resetAt: data.resetAt ?? null,
    plan: (data as AiResponse).plan || "free",
  };
};
