import React from "react";
import { createBrowserRouter, Navigate } from "react-router";

// Layouts
import DashboardLayout from "./layouts/DashboardLayout";

// Public pages
import Landing from "./pages/Landing";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Legal from "./pages/Legal";

// App pages (lazy-loaded for code splitting)
const WorkoutDashboard = React.lazy(() => import("./pages/WorkoutDashboard"));
const NutritionPage = React.lazy(() => import("./pages/NutritionPage"));
const StatsPage = React.lazy(() => import("./pages/StatsPage"));
const CoachPage = React.lazy(() => import("./pages/CoachPage"));
const ProfilePage = React.lazy(() => import("./pages/ProfilePage"));
const RoutinesPage = React.lazy(() => import("./pages/RoutinesPage"));

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense
      fallback={
        <div className='flex items-center justify-center py-20 text-slate-500'>
          <div className='w-6 h-6 border-2 border-slate-700 border-t-cyan-400 rounded-full animate-spin' />
        </div>
      }
    >
      {children}
    </React.Suspense>
  );
}

export const router = createBrowserRouter([
  // Public routes
  { path: "/", Component: Landing },
  { path: "/privacy", Component: Privacy },
  { path: "/terms", Component: Terms },
  { path: "/legal", Component: Legal },

  // App routes (with shared dashboard layout)
  {
    path: "/app",
    Component: DashboardLayout,
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <WorkoutDashboard />
          </SuspenseWrapper>
        ),
      },
      {
        path: "nutrition",
        element: (
          <SuspenseWrapper>
            <NutritionPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "stats",
        element: (
          <SuspenseWrapper>
            <StatsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "coach",
        element: (
          <SuspenseWrapper>
            <CoachPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "profile",
        element: (
          <SuspenseWrapper>
            <ProfilePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "routines",
        element: (
          <SuspenseWrapper>
            <RoutinesPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },

  // Catch-all → redirect to landing
  {
    path: "*",
    element: (
      <Navigate
        to='/'
        replace
      />
    ),
  },
]);
