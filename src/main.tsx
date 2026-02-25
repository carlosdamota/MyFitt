import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";
import { router } from "./router";
import ErrorBoundary from "./components/common/ErrorBoundary";
import UpdateToast from "./components/common/UpdateToast";
import NotificationManager from "./components/common/NotificationManager";
import { ToastProvider } from "./hooks/useToast";
import { ThemeProvider } from "./contexts/ThemeProvider";
import "./index.css";

import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

posthog.init(import.meta.env.VITE_POSTHOG_KEY || "", {
  api_host: import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com",
  person_profiles: "identified_only", // or "always" to create profiles for anonymous users as well
});
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
            <PostHogProvider client={posthog}>
              <ToastProvider>
                <RouterProvider router={router} />
                <UpdateToast />
                <NotificationManager />
              </ToastProvider>
            </PostHogProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>,
);
