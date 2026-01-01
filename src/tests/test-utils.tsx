import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
  type Router,
} from '@tanstack/react-router';
import type { RenderHookOptions, RenderHookResult, RenderOptions, RenderResult } from '@testing-library/react';
import { render, renderHook } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import type { StoreApi, UseBoundStore } from 'zustand';

// Re-export render helpers for convenience
export * from './utils/accessibility-helpers';
export * from './utils/form-helpers';
export * from './utils/test-render-helpers';

/**
 * Create a test QueryClient with default options for testing
 */
export const createTestQueryClient = (options?: {
  queries?: { retry?: boolean };
  mutations?: { retry?: boolean };
}): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, ...options?.queries },
      mutations: { retry: false, ...options?.mutations },
    },
  });
};

/**
 * Create a test router with a test route that renders the provided component
 * This allows components to be rendered within router context
 *
 * Note: This creates a new router each time. For better performance,
 * consider using renderWithQueryClient if router is not needed.
 */
export const createTestRouter = (component: ReactElement, initialEntries: string[] = ['/test']): Router<any> => {
  const history = createMemoryHistory({ initialEntries });

  // Create a test root route
  const testRootRoute = createRootRoute({
    component: () => <Outlet />,
  });

  // Create a test route that renders the component
  // We use a function component that returns the provided element
  const TestRouteComponent = () => component;

  // Use catch-all route to match any path
  const testRoute = createRoute({
    getParentRoute: () => testRootRoute,
    path: '$',
    component: TestRouteComponent,
  });

  const routeTree = testRootRoute.addChildren([testRoute]);

  const router = createRouter({
    routeTree,
    history,
  });

  return router;
};

/**
 * Default QueryClient instance for tests
 */
const defaultQueryClient = createTestQueryClient();

/**
 * Render component with QueryClient and Router providers
 * Component will be rendered with router context available
 * This is the main utility function for rendering components in tests
 *
 * @example
 * ```tsx
 * renderWithProviders(<MyComponent />, { initialEntries: ['/test'] });
 * ```
 */
export const renderWithProviders = (
  ui: ReactElement,
  options?: RenderOptions & {
    queryClient?: QueryClient;
    router?: Router<any>;
    initialEntries?: string[];
  }
): RenderResult => {
  const { queryClient = defaultQueryClient, router, initialEntries = ['/'], ...renderOptions } = options || {};

  // Create a minimal router if not provided
  // Most components just need router context (useNavigate, etc.) but don't need actual routing
  let testRouter = router;
  if (!testRouter) {
    const history = createMemoryHistory({ initialEntries });
    const testRootRoute = createRootRoute({
      component: () => <Outlet />,
    });
    testRouter = createRouter({
      routeTree: testRootRoute,
      history,
    });
  }

  // Render component with providers
  // Note: Component may render twice in development due to React StrictMode
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={testRouter} />
      {ui}
    </QueryClientProvider>,
    renderOptions
  );
};

/**
 * Render component with only QueryClient provider (no router)
 * Useful for testing components that don't need routing
 */
export const renderWithQueryClient = (
  ui: React.ReactElement,
  options?: RenderOptions & {
    queryClient?: QueryClient;
  }
): RenderResult => {
  const { queryClient = defaultQueryClient, ...renderOptions } = options || {};

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>, renderOptions);
};

/**
 * Render component with only Router provider (no QueryClient)
 * Useful for testing components that need routing but not data fetching
 */
export const renderWithRouter = (
  ui: React.ReactElement,
  options?: RenderOptions & {
    router?: Router<any>;
    initialEntries?: string[];
  }
): RenderResult => {
  const { router, initialEntries = ['/'], ...renderOptions } = options || {};

  const testRouter = router || createTestRouter(ui, initialEntries);

  return render(<RouterProvider router={testRouter} />, renderOptions);
};

/**
 * Create a wrapper component for renderHook with QueryClient
 * Useful for testing hooks that use React Query
 */
export const createQueryClientWrapper = (queryClient?: QueryClient) => {
  const client = queryClient || defaultQueryClient;
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

/**
 * Render hook with QueryClient provider
 * Convenience function for testing hooks that use React Query
 */
export const renderHookWithQueryClient = <TProps, TResult>(
  hook: (props: TProps) => TResult,
  options?: Omit<RenderHookOptions<TProps>, 'wrapper'> & {
    queryClient?: QueryClient;
  }
): RenderHookResult<TResult, TProps> => {
  const { queryClient, ...renderOptions } = options || {};
  const wrapper = createQueryClientWrapper(queryClient);

  return renderHook(hook, {
    ...renderOptions,
    wrapper,
  });
};

/**
 * Create a Zustand store provider wrapper for testing
 * Useful for testing components that use Zustand stores
 */
export const createZustandStoreWrapper = <T,>(store: UseBoundStore<StoreApi<T>>, initialState?: Partial<T>) => {
  return ({ children }: { children: ReactNode }) => {
    // Reset store to initial state if provided
    if (initialState) {
      const state = store.getState();
      store.setState({ ...state, ...initialState } as T);
    }
    return <>{children}</>;
  };
};

/**
 * Render component with Zustand store provider
 * Useful for testing components that use Zustand stores
 *
 * @example
 * ```tsx
 * import { useAuthStore } from '@features/auth/stores/auth.store';
 *
 * renderWithZustandStore(
 *   <MyComponent />,
 *   useAuthStore,
 *   { user: mockUser, token: 'token', isAuthenticated: true }
 * );
 * ```
 */
export const renderWithZustandStore = <T,>(
  ui: ReactElement,
  store: UseBoundStore<StoreApi<T>>,
  initialState?: Partial<T>,
  options?: RenderOptions
): RenderResult => {
  const wrapper = createZustandStoreWrapper(store, initialState);

  return render(ui, {
    ...options,
    wrapper,
  });
};

/**
 * Render component with both QueryClient and Zustand store providers
 * Useful for testing components that use both React Query and Zustand
 */
export const renderWithProvidersAndStore = <T,>(
  ui: ReactElement,
  store: UseBoundStore<StoreApi<T>>,
  options?: RenderOptions & {
    queryClient?: QueryClient;
    router?: Router<any>;
    initialEntries?: string[];
    storeInitialState?: Partial<T>;
  }
): RenderResult => {
  const {
    queryClient = defaultQueryClient,
    router,
    initialEntries = ['/test'],
    storeInitialState,
    ...renderOptions
  } = options || {};

  const testRouter = router || createTestRouter(ui, initialEntries);
  const storeWrapper = createZustandStoreWrapper(store, storeInitialState);

  const CombinedWrapper = ({ children }: { children: ReactNode }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={testRouter} />
        {storeWrapper({ children })}
      </QueryClientProvider>
    );
  };

  return render(ui, {
    ...renderOptions,
    wrapper: CombinedWrapper,
  });
};
