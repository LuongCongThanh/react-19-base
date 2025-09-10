// src/router/__tests__/DynamicRouter.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import { DynamicRouter, DynamicRouterProvider } from '../DynamicRouter';
import { AuthProvider } from '@/contexts/AuthContext';
import { TenantProvider } from '@/contexts/TenantContext';
import { SecurityProvider } from '@/security';
import { store } from '@/store';

import type { RouteConfig } from '@/types/routing';

// ===== MOCK COMPONENTS =====

const MockComponent: React.FC = () => <div data-testid="mock-component">Mock Component</div>;
const MockLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div data-testid="mock-layout">{children}</div>
);

// ===== TEST ROUTES =====

const testRoutes: RouteConfig[] = [
  {
    code: 'test',
    path: '/test',
    titleKey: 'test.title',
    component: async () => ({ default: MockComponent }),
    layout: 'PublicLayout',
    security: { roles: ['guest'] },
    meta: { title: 'Test', requiresAuth: false },
  },
  {
    code: 'protected',
    path: '/protected',
    titleKey: 'protected.title',
    component: async () => ({ default: MockComponent }),
    layout: 'UserLayout',
    security: { roles: ['user'], permissions: ['test.read'] },
    meta: { title: 'Protected', requiresAuth: true },
  },
];

// ===== TEST WRAPPER =====

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Provider store={store}>
    <BrowserRouter>
      <SecurityProvider>
        <AuthProvider>
          <TenantProvider>
            {children}
          </TenantProvider>
        </AuthProvider>
      </SecurityProvider>
    </BrowserRouter>
  </Provider>
);

// ===== TESTS =====

describe('DynamicRouter', () => {
  it('should render without crashing', () => {
    render(
      <TestWrapper>
        <DynamicRouter routes={testRoutes} />
      </TestWrapper>
    );
  });

  it('should render public route', async () => {
    render(
      <TestWrapper>
        <DynamicRouter routes={testRoutes} />
      </TestWrapper>
    );

    // Navigate to test route
    window.history.pushState({}, 'Test', '/test');

    await waitFor(() => {
      expect(screen.getByTestId('mock-component')).toBeInTheDocument();
    });
  });

  it('should handle route not found', async () => {
    render(
      <TestWrapper>
        <DynamicRouter routes={testRoutes} />
      </TestWrapper>
    );

    // Navigate to non-existent route
    window.history.pushState({}, 'Not Found', '/non-existent');

    await waitFor(() => {
      expect(screen.getByText('Not Found')).toBeInTheDocument();
    });
  });

  it('should show loading state', () => {
    const LoadingFallback = () => <div data-testid="loading">Loading...</div>;
    
    render(
      <TestWrapper>
        <DynamicRouter 
          routes={testRoutes} 
          fallback={LoadingFallback}
        />
      </TestWrapper>
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });
});

describe('DynamicRouterProvider', () => {
  it('should provide router context', () => {
    const TestComponent: React.FC = () => {
      const router = useRouter();
      return <div data-testid="router-context">{router ? 'Context Available' : 'No Context'}</div>;
    };

    render(
      <TestWrapper>
        <DynamicRouterProvider initialRoutes={testRoutes}>
          <TestComponent />
        </DynamicRouterProvider>
      </TestWrapper>
    );

    expect(screen.getByTestId('router-context')).toHaveTextContent('Context Available');
  });

  it('should register initial routes', () => {
    const TestComponent: React.FC = () => {
      const router = useRouter();
      const route = router.getRoute('test');
      return <div data-testid="route-count">{route ? 'Route Found' : 'Route Not Found'}</div>;
    };

    render(
      <TestWrapper>
        <DynamicRouterProvider initialRoutes={testRoutes}>
          <TestComponent />
        </DynamicRouterProvider>
      </TestWrapper>
    );

    expect(screen.getByTestId('route-count')).toHaveTextContent('Route Found');
  });
});

// ===== HOOK TESTS =====

describe('useRouter', () => {
  it('should throw error when used outside provider', () => {
    const TestComponent: React.FC = () => {
      try {
        useRouter();
        return <div>No Error</div>;
      } catch (error) {
        return <div data-testid="error">Error Caught</div>;
      }
    };

    render(<TestComponent />);
    expect(screen.getByTestId('error')).toBeInTheDocument();
  });
});

// ===== ROUTE RESOLUTION TESTS =====

describe('Route Resolution', () => {
  it('should resolve route by path', async () => {
    const TestComponent: React.FC = () => {
      const router = useRouter();
      const [route, setRoute] = React.useState<RouteConfig | null>(null);

      React.useEffect(() => {
        const foundRoute = router.findRouteByPath('/test');
        setRoute(foundRoute || null);
      }, [router]);

      return <div data-testid="resolved-route">{route ? route.code : 'Not Found'}</div>;
    };

    render(
      <TestWrapper>
        <DynamicRouterProvider initialRoutes={testRoutes}>
          <TestComponent />
        </DynamicRouterProvider>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('resolved-route')).toHaveTextContent('test');
    });
  });

  it('should handle route resolution error', async () => {
    const errorRoutes: RouteConfig[] = [
      {
        code: 'error',
        path: '/error',
        titleKey: 'error.title',
        component: async () => {
          throw new Error('Component load failed');
        },
        layout: 'PublicLayout',
        security: { roles: ['guest'] },
        meta: { title: 'Error', requiresAuth: false },
      },
    ];

    render(
      <TestWrapper>
        <DynamicRouter routes={errorRoutes} />
      </TestWrapper>
    );

    // Navigate to error route
    window.history.pushState({}, 'Error', '/error');

    await waitFor(() => {
      expect(screen.getByText(/Error loading route/)).toBeInTheDocument();
    });
  });
});

// ===== NAVIGATION TESTS =====

describe('Navigation', () => {
  it('should navigate to route', async () => {
    const TestComponent: React.FC = () => {
      const router = useRouter();
      const [currentPath, setCurrentPath] = React.useState('');

      React.useEffect(() => {
        setCurrentPath(window.location.pathname);
      }, []);

      const handleNavigate = () => {
        router.navigate('/test');
      };

      return (
        <div>
          <div data-testid="current-path">{currentPath}</div>
          <button data-testid="navigate-btn" onClick={handleNavigate}>
            Navigate
          </button>
        </div>
      );
    };

    render(
      <TestWrapper>
        <DynamicRouterProvider initialRoutes={testRoutes}>
          <TestComponent />
        </DynamicRouterProvider>
      </TestWrapper>
    );

    const navigateBtn = screen.getByTestId('navigate-btn');
    navigateBtn.click();

    await waitFor(() => {
      expect(screen.getByTestId('current-path')).toHaveTextContent('/test');
    });
  });
});

// ===== PERMISSION TESTS =====

describe('Permissions', () => {
  it('should check user permissions', () => {
    const TestComponent: React.FC = () => {
      const router = useRouter();
      const hasPermission = router.hasPermission('test.read');
      return <div data-testid="permission">{hasPermission ? 'Has Permission' : 'No Permission'}</div>;
    };

    render(
      <TestWrapper>
        <DynamicRouterProvider initialRoutes={testRoutes}>
          <TestComponent />
        </DynamicRouterProvider>
      </TestWrapper>
    );

    // Initially no permission (no user logged in)
    expect(screen.getByTestId('permission')).toHaveTextContent('No Permission');
  });

  it('should check user roles', () => {
    const TestComponent: React.FC = () => {
      const router = useRouter();
      const hasRole = router.hasRole('admin');
      return <div data-testid="role">{hasRole ? 'Has Role' : 'No Role'}</div>;
    };

    render(
      <TestWrapper>
        <DynamicRouterProvider initialRoutes={testRoutes}>
          <TestComponent />
        </DynamicRouterProvider>
      </TestWrapper>
    );

    // Initially no role (no user logged in)
    expect(screen.getByTestId('role')).toHaveTextContent('No Role');
  });
});
