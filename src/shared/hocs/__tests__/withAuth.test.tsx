import { beforeEach, describe, it, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '@tests/test-utils';

import { withAuth } from '../withAuth';

// Mock useAuthStore
const mockUseAuthStore = jest.fn() as jest.MockedFunction<
  (selector: (state: { isAuthenticated: boolean }) => boolean) => boolean
>;
jest.mock('@features/auth/stores/auth.store', () => ({
  useAuthStore: (selector: any) => mockUseAuthStore(selector),
}));

// Mock Navigate
jest.mock('@tanstack/react-router', () => {
  const actual = jest.requireActual<typeof import('@tanstack/react-router')>('@tanstack/react-router');
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => (
      <div data-testid="navigate" data-to={to}>
        Navigate to {to}
      </div>
    ),
  };
});

const TestComponent = () => <div>Protected Content</div>;

describe('withAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render component when user is authenticated', () => {
    mockUseAuthStore.mockImplementation((selector: (state: { isAuthenticated: boolean }) => boolean) => {
      const state = { isAuthenticated: true };
      return selector(state);
    });

    const ProtectedComponent = withAuth(TestComponent);
    renderWithProviders(<ProtectedComponent />);

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', () => {
    mockUseAuthStore.mockImplementation((selector: (state: { isAuthenticated: boolean }) => boolean) => {
      const state = { isAuthenticated: false };
      return selector(state);
    });

    const ProtectedComponent = withAuth(TestComponent);
    renderWithProviders(<ProtectedComponent />);

    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/auth/login');
  });
});
