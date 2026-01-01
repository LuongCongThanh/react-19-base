import { beforeEach, describe, it, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { render, screen, waitFor } from '@testing-library/react';

import { createTestQueryClient } from '@tests/test-utils';

import { Sidebar } from '../Sidebar';

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render sidebar component', async () => {
    // Create a router with /dashboard route for Link to work
    const history = createMemoryHistory({ initialEntries: ['/dashboard'] });
    const rootRoute = createRootRoute({
      component: () => <Sidebar />,
    });
    const dashboardRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/dashboard',
      component: () => <div>Dashboard</div>,
    });
    const routeTree = rootRoute.addChildren([dashboardRoute]);
    const router = createRouter({
      routeTree,
      history,
    });

    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    );

    // Wait for router to initialize and Sidebar to render
    // Sidebar should be present (exact content depends on implementation)
    await waitFor(() => {
      const sidebar = screen.queryByRole('complementary') || screen.queryByRole('navigation');
      expect(sidebar).toBeInTheDocument();
    });
  });
});
