export type SocialShareEngine = "dom" | "konva";

const STORAGE_KEY = "fittwiz_social_share_engine";

const isSocialShareEngine = (value: string | null | undefined): value is SocialShareEngine => {
  return value === "dom" || value === "konva";
};

export const resolveSocialShareEngine = (): SocialShareEngine => {
  const envEngine = import.meta.env.VITE_SOCIAL_SHARE_ENGINE;
  if (isSocialShareEngine(envEngine)) return envEngine;

  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isSocialShareEngine(stored)) return stored;
  }

  return "konva";
};

export const getSocialShareStorageKey = () => STORAGE_KEY;
