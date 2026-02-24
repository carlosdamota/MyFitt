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
              <UpdateToast />
              <NotificationManager />
            </ToastProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>,
);
