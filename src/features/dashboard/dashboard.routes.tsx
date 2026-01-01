import { createRoute } from '@tanstack/react-router';
import { lazy } from 'react';

import { rootRoute } from '@app/app.router';

// Lazy load dashboard page for code splitting
const DashboardPage = lazy(() =>
  import('@features/dashboard/pages/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  }))
);

export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
});

export const dashboardRoutes = [dashboardRoute];
