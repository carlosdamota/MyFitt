import posthog from "posthog-js";

interface ShareMetricPayload {
  engine: "dom" | "konva";
  format: "feed" | "story";
  durationMs: number;
  mode: "preview" | "export";
}

export const trackSocialShareGeneration = (payload: ShareMetricPayload): void => {
  if (typeof window === "undefined") return;

  try {
    posthog.capture("social_share_generation", payload);
  } catch {
    // noop
  }
};
