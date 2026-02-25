import { PostHog } from "posthog-node";
import * as logger from "firebase-functions/logger";

let posthogClient: PostHog | null = null;

export const getPostHogClient = () => {
  if (!posthogClient) {
    const apiKey = process.env.POSTHOG_API_KEY;
    if (!apiKey) {
      logger.warn("POSTHOG_API_KEY no está definido. PostHog no enviará eventos.");
      // Return a dummy client to avoid crashes if the key is missing
      return {
        capture: () => {},
        identify: () => {},
        shutdown: () => {},
        flush: async () => {},
      } as unknown as PostHog;
    }

    posthogClient = new PostHog(apiKey, {
      host: "https://us.i.posthog.com",
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return posthogClient;
};

export const shutdownPostHog = async () => {
  if (posthogClient) {
    await posthogClient.shutdown();
    posthogClient = null;
  }
};
