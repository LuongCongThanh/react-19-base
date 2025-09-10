import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { AuthProvider } from '@/contexts/AuthContext';
import { TenantProvider } from '@/contexts/TenantContext';
import { SecurityProvider } from '@/security';

// Mock store for testing
export const createMockStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { user: null, isAuthenticated: false }, action) => state,
      tenant: (state = { currentTenant: null, loading: false }, action) => state,
    },
    preloadedState,
  });
};

// Mock providers for testing
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: any;
  store?: any;
  initialEntries?: string[];
}

const AllTheProviders: React.FC<{ children: React.ReactNode; store?: any }> = ({ 
  children, 
  store = createMockStore() 
}) => {
  return (
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
};

// Custom render function with providers
export const renderWithProviders = (
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = createMockStore(preloadedState),
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AllTheProviders store={store}>{children}</AllTheProviders>
  );

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

// Mock user data
export const mockUser = (overrides = {}) => ({
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'user',
  permissions: ['dashboard.read'],
  ...overrides,
});

// Mock tenant data
export const mockTenant = (overrides = {}) => ({
  id: '1',
  name: 'Test Tenant',
  domain: 'test.example.com',
  features: ['dashboard', 'analytics'],
  config: {
    theme: 'light',
    primaryColor: '#3B82F6',
  },
  ...overrides,
});

// Mock auth state
export const mockAuthState = (overrides = {}) => ({
  user: mockUser(),
  isAuthenticated: true,
  loading: false,
  error: null,
  ...overrides,
});

// Mock tenant state
export const mockTenantState = (overrides = {}) => ({
  currentTenant: mockTenant(),
  loading: false,
  error: null,
  ...overrides,
});

// Mock API responses
export const mockApiResponse = <T>(data: T, status = 200) => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  config: {},
});

// Mock API error
export const mockApiError = (message = 'API Error', status = 500) => {
  const error = new Error(message);
  (error as any).response = {
    data: { message },
    status,
    statusText: 'Internal Server Error',
    headers: {},
    config: {},
  };
  return error;
};

// Wait for async operations
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock router
export const mockNavigate = jest.fn();
export const mockLocation = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'default',
};

// Mock useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));

// Mock window methods
export const mockWindowMethods = () => {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  });

  Object.defineProperty(window, 'location', {
    value: {
      href: 'http://localhost:3000',
      assign: jest.fn(),
      reload: jest.fn(),
    },
    writable: true,
  });
};

// Test utilities
export const createTestWrapper = (store = createMockStore()) => {
  return ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders store={store}>{children}</AllTheProviders>
  );
};

// Export everything from testing library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
