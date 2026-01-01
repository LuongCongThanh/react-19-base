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
import { render, screen } from '@testing-library/react';

import { createTestQueryClient, renderWithProviders } from '@tests/test-utils';

import { AuthLayout } from '../AuthLayout';

describe('AuthLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children when provided', () => {
    renderWithProviders(
      <AuthLayout>
        <div data-testid="child">Child content</div>
      </AuthLayout>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should render Outlet when children is not provided', async () => {
    // Create a router with a child route for Outlet to render
    const history = createMemoryHistory({ initialEntries: ['/auth/login'] });
    const rootRoute = createRootRoute({
      component: () => <AuthLayout />,
    });
    const loginRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/auth/login',
      component: () => <div data-testid="login-content">Login Content</div>,
    });
    const routeTree = rootRoute.addChildren([loginRoute]);
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

    // Wait for router to match and render the route
    // Outlet should render the login route content
    const loginContent = await screen.findByTestId('login-content');
    expect(loginContent).toBeInTheDocument();
  });
});
