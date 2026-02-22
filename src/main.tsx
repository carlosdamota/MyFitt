import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";
import { router } from "./router";
import ErrorBoundary from "./components/common/ErrorBoundary";
import UpdateToast from "./components/common/UpdateToast";
import NotificationManager from "./components/common/NotificationManager";
import { ToastProvider } from "./hooks/useToast";
import "./index.css";

import { HelmetProvider } from "react-helmet-async";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <ToastProvider>
          <RouterProvider router={router} />
          <UpdateToast />
          <NotificationManager />
        </ToastProvider>
      </ErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>,
);
