import React from "react";
import { createBrowserRouter, Navigate } from "react-router";

// Layouts
import DashboardLayout from "./layouts/DashboardLayout";

// Public pages
const Landing = lazyImport(() => import("./pages/Landing"));
const Privacy = lazyImport(() => import("./pages/Privacy"));
const Terms = lazyImport(() => import("./pages/Terms"));
const Legal = lazyImport(() => import("./pages/Legal"));

// App pages (lazy-loaded for code splitting)
import { lazyImport } from "./utils/lazyImport";

// App pages (lazy-loaded for code splitting)
const WorkoutDashboard = lazyImport(() => import("./pages/WorkoutDashboard"));
const NutritionPage = lazyImport(() => import("./pages/NutritionPage"));
const StatsPage = lazyImport(() => import("./pages/StatsPage"));
const CoachPage = lazyImport(() => import("./pages/CoachPage"));
const ProfilePage = lazyImport(() => import("./pages/ProfilePage"));
const RoutinesPage = lazyImport(() => import("./pages/RoutinesPage"));

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
  {
    path: "/",
    element: (
      <SuspenseWrapper>
        <Landing />
      </SuspenseWrapper>
    ),
  },
  {
    path: "/privacy",
    element: (
      <SuspenseWrapper>
        <Privacy />
      </SuspenseWrapper>
    ),
  },
  {
    path: "/terms",
    element: (
      <SuspenseWrapper>
        <Terms />
      </SuspenseWrapper>
    ),
  },
  {
    path: "/legal",
    element: (
      <SuspenseWrapper>
        <Legal />
      </SuspenseWrapper>
    ),
  },

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
