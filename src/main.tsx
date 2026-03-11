import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";
import { router } from "./router";
import ErrorBoundary from "./components/common/ErrorBoundary";
import UpdateToast from "./components/common/UpdateToast";
import NotificationManager from "./components/common/NotificationManager";
import { ToastProvider } from "./hooks/useToast";
import { PwaInstallPrompt } from "./components/common/PwaInstallPrompt";
import { ThemeProvider } from "./contexts/ThemeProvider";
import "./index.css";

import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { emitMonitoringEvent } from "./api/monitoring";

// Delay PostHog initialization to avoid blocking the first paint.
// posthog-js (~176 KB) is loaded dynamically — NOT part of the main bundle.
const initPostHog = () => {
  void import("posthog-js").then((mod) => {
    const ph = mod.default;
    ph.init(import.meta.env.VITE_POSTHOG_KEY || "", {
      api_host: import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: false,
    });
  });
};

if (typeof window !== "undefined") {
  if (window.requestIdleCallback) {
    window.requestIdleCallback(initPostHog);
  } else {
    setTimeout(initPostHog, 1000);
  }

  window.addEventListener("error", (event) => {
    void emitMonitoringEvent({
      eventType: "frontend_error",
      category: "technical",
      severity: "warning",
      dedupeKey: `frontend_error:${event.filename || "unknown"}:${event.lineno || 0}`,
      context: {
        message: event.message,
        file: event.filename,
        line: event.lineno,
        column: event.colno,
      },
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    void emitMonitoringEvent({
      eventType: "frontend_unhandled_rejection",
      category: "technical",
      severity: "critical",
      dedupeKey: "frontend_unhandled_rejection",
      context: {
        reason:
          typeof event.reason === "string"
            ? event.reason
            : event.reason instanceof Error
              ? event.reason.message
              : JSON.stringify(event.reason),
      },
    });
  });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <ToastProvider>
              <RouterProvider router={router} />
              <PwaInstallPrompt />
              <UpdateToast />
              <NotificationManager />
            </ToastProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>,
);
