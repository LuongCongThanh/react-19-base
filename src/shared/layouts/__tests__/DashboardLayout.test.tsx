import { beforeEach, describe, it, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRouter,
  createRootRoute,
  createRoute,
  RouterProvider,
} from '@tanstack/react-router';
import { render, screen, waitFor } from '@testing-library/react';

import { createTestQueryClient } from '@tests/test-utils';

import { DashboardLayout } from '../DashboardLayout';

// Mock components
jest.mock('../components/Header', () => ({
  Header: () => <div data-testid="header">Header</div>,
}));

jest.mock('../components/Sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}));

describe('DashboardLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render Header and Sidebar', async () => {
    // Create a router with a child route for Outlet to render
    const history = createMemoryHistory({ initialEntries: ['/dashboard'] });
    const rootRoute = createRootRoute({
      component: () => <DashboardLayout />,
    });
    const dashboardRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/dashboard',
      component: () => <div data-testid="dashboard-content">Dashboard Content</div>,
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

    await waitFor(() => {
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });
  });

  it('should render main content area with correct attributes', async () => {
    // Create a router with a child route for Outlet to render
    const history = createMemoryHistory({ initialEntries: ['/dashboard'] });
    const rootRoute = createRootRoute({
      component: () => <DashboardLayout />,
    });
    const dashboardRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/dashboard',
      component: () => <div data-testid="dashboard-content">Dashboard Content</div>,
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

    await waitFor(() => {
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      expect(main).toHaveAttribute('id', 'main-content');
      expect(main).toHaveAttribute('tabIndex', '-1');
    });
  });
});
