import React from "react";

/**
 * A wrapper around React.lazy that automatically reloads the page
 * if a chunk fails to load (e.g., after a new deployment).
 *
 * It uses sessionStorage to preventing infinite reload loops.
 */
export const lazyImport = <T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
): React.LazyExoticComponent<T> => {
  return React.lazy(async () => {
    try {
      return await factory();
    } catch (error: any) {
      const isChunkLoadError =
        error?.name === "ChunkLoadError" ||
        error?.message?.includes("Failed to fetch dynamically imported module") ||
        error?.message?.includes("Importing a module script failed");

      if (isChunkLoadError) {
        const storageKey = `fittwiz_reload_${new Date().setMinutes(0, 0, 0)}`; // Resets every hour (rough heuristic)
        const hasReloaded = sessionStorage.getItem(storageKey);

        if (!hasReloaded) {
          sessionStorage.setItem(storageKey, "true");
          window.location.reload();
          // Return a never-resolving promise to wait for reload
          return new Promise(() => {});
        }
      }

      // If not a chunk error or already reloaded, rethrow
      throw error;
    }
  });
};
