import { createRootRoute, createRouter, Outlet } from '@tanstack/react-router';

import { appRoutes } from './app.routes';

export const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Route tree with all routes
const routeTree = rootRoute.addChildren(appRoutes);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
