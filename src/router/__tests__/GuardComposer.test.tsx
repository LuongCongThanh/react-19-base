// src/router/__tests__/GuardComposer.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import { GuardComposer, GuardComposerProvider } from '../GuardComposer';
import { AuthProvider } from '@/contexts/AuthContext';
import { TenantProvider } from '@/contexts/TenantContext';
import { SecurityProvider } from '@/security';
import { store } from '@/store';

import type { RouteConfig } from '@/types/routing';

// ===== MOCK COMPONENTS =====

const MockComponent: React.FC = () => <div data-testid="protected-content">Protected Content</div>;
const MockFallback: React.FC = () => <div data-testid="guard-fallback">Checking permissions...</div>;

// ===== TEST ROUTES =====

const protectedRoute: RouteConfig = {
  code: 'protected',
  path: '/protected',
  titleKey: 'protected.title',
  component: async () => ({ default: MockComponent }),
  layout: 'UserLayout',
  security: { 
    roles: ['user'], 
    permissions: ['test.read'],
    guards: ['auth', 'role', 'permission']
  },
  meta: { title: 'Protected', requiresAuth: true },
};

const publicRoute: RouteConfig = {
  code: 'public',
  path: '/public',
  titleKey: 'public.title',
  component: async () => ({ default: MockComponent }),
  layout: 'PublicLayout',
  security: { roles: ['guest'] },
  meta: { title: 'Public', requiresAuth: false },
};

// ===== TEST WRAPPER =====

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Provider store={store}>
    <BrowserRouter>
      <SecurityProvider>
        <AuthProvider>
          <TenantProvider>
            <GuardComposerProvider>
              {children}
            </GuardComposerProvider>
          </TenantProvider>
        </AuthProvider>
      </SecurityProvider>
    </BrowserRouter>
  </Provider>
);

// ===== TESTS =====

describe('GuardComposer', () => {
  it('should render without crashing', () => {
    render(
      <TestWrapper>
        <GuardComposer route={publicRoute}>
          <MockComponent />
        </GuardComposer>
      </TestWrapper>
    );
  });

  it('should render children for public routes', async () => {
    render(
      <TestWrapper>
        <GuardComposer route={publicRoute}>
          <MockComponent />
        </GuardComposer>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  it('should show fallback while checking guards', () => {
    render(
      <TestWrapper>
        <GuardComposer 
          route={protectedRoute}
          fallback={MockFallback}
        >
          <MockComponent />
        </GuardComposer>
      </TestWrapper>
    );

    expect(screen.getByTestId('guard-fallback')).toBeInTheDocument();
  });

  it('should handle guard failure', async () => {
    const onGuardFail = jest.fn();
    const onError = jest.fn();

    render(
      <TestWrapper>
        <GuardComposer 
          route={protectedRoute}
          onGuardFail={onGuardFail}
          onError={onError}
        >
          <MockComponent />
        </GuardComposer>
      </TestWrapper>
    );

    // Wait for guard check to complete
    await waitFor(() => {
      expect(screen.getByText(/Access denied/)).toBeInTheDocument();
    });
  });
});

describe('GuardWrapper', () => {
  it('should render children when guard passes', async () => {
    const TestComponent: React.FC = () => {
      const { GuardWrapper } = require('../GuardComposer');
      
      return (
        <GuardWrapper guard="auth">
          <MockComponent />
        </GuardWrapper>
      );
    };

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // For public routes, auth guard should pass
    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  it('should show error when guard fails', async () => {
    const TestComponent: React.FC = () => {
      const { GuardWrapper } = require('../GuardComposer');
      
      return (
        <GuardWrapper guard="nonexistent">
          <MockComponent />
        </GuardWrapper>
      );
    };

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/Guard nonexistent not found/)).toBeInTheDocument();
    });
  });
});

describe('useGuardComposer', () => {
  it('should provide guard composer context', () => {
    const TestComponent: React.FC = () => {
      const { useGuardComposer } = require('../GuardComposer');
      const guardComposer = useGuardComposer();
      
      return (
        <div data-testid="guard-context">
          {guardComposer ? 'Context Available' : 'No Context'}
        </div>
      );
    };

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('guard-context')).toHaveTextContent('Context Available');
  });

  it('should throw error when used outside provider', () => {
    const TestComponent: React.FC = () => {
      try {
        const { useGuardComposer } = require('../GuardComposer');
        useGuardComposer();
        return <div>No Error</div>;
      } catch (error) {
        return <div data-testid="error">Error Caught</div>;
      }
    };

    render(<TestComponent />);
    expect(screen.getByTestId('error')).toBeInTheDocument();
  });
});

// ===== GUARD EXECUTION TESTS =====

describe('Guard Execution', () => {
  it('should execute guards in sequence', async () => {
    const TestComponent: React.FC = () => {
      const { useGuardComposer } = require('../GuardComposer');
      const { executeGuards } = useGuardComposer();
      const [results, setResults] = React.useState<any[]>([]);

      React.useEffect(() => {
        const runGuards = async () => {
          const guardResults = await executeGuards(protectedRoute);
          setResults(guardResults);
        };
        runGuards();
      }, [executeGuards]);

      return (
        <div data-testid="guard-results">
          {results.length > 0 ? 'Guards Executed' : 'No Results'}
        </div>
      );
    };

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('guard-results')).toHaveTextContent('Guards Executed');
    });
  });

  it('should handle guard execution errors', async () => {
    const errorRoute: RouteConfig = {
      ...protectedRoute,
      security: {
        ...protectedRoute.security,
        guards: ['nonexistent-guard']
      }
    };

    const TestComponent: React.FC = () => {
      const { useGuardComposer } = require('../GuardComposer');
      const { executeGuards } = useGuardComposer();
      const [error, setError] = React.useState<string | null>(null);

      React.useEffect(() => {
        const runGuards = async () => {
          try {
            await executeGuards(errorRoute);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
          }
        };
        runGuards();
      }, [executeGuards]);

      return (
        <div data-testid="guard-error">
          {error || 'No Error'}
        </div>
      );
    };

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('guard-error')).toHaveTextContent('No Error');
    });
  });
});

// ===== PERMISSION TESTS =====

describe('Permission Checks', () => {
  it('should check route access', async () => {
    const TestComponent: React.FC = () => {
      const { useGuardComposer } = require('../GuardComposer');
      const { canActivate } = useGuardComposer();
      const [canAccess, setCanAccess] = React.useState<boolean | null>(null);

      React.useEffect(() => {
        const checkAccess = async () => {
          const result = await canActivate(protectedRoute);
          setCanAccess(result);
        };
        checkAccess();
      }, [canActivate]);

      return (
        <div data-testid="access-check">
          {canAccess === null ? 'Checking...' : canAccess ? 'Access Granted' : 'Access Denied'}
        </div>
      );
    };

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('access-check')).toHaveTextContent('Access Denied');
    });
  });

  it('should check deactivation', async () => {
    const TestComponent: React.FC = () => {
      const { useGuardComposer } = require('../GuardComposer');
      const { canDeactivate } = useGuardComposer();
      const [canDeactivateResult, setCanDeactivateResult] = React.useState<boolean | null>(null);

      React.useEffect(() => {
        const checkDeactivation = async () => {
          const result = await canDeactivate(protectedRoute);
          setCanDeactivateResult(result);
        };
        checkDeactivation();
      }, [canDeactivate]);

      return (
        <div data-testid="deactivation-check">
          {canDeactivateResult === null ? 'Checking...' : canDeactivateResult ? 'Can Deactivate' : 'Cannot Deactivate'}
        </div>
      );
    };

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('deactivation-check')).toHaveTextContent('Can Deactivate');
    });
  });
});
