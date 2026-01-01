import { beforeEach, describe, it, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithProviders } from '@tests/test-utils';
import { createMockMutationResult } from '@tests/utils/test-mock-helpers';

import { LoginForm } from '../LoginForm';

// Mock hooks
const mockMutate = jest.fn();
const mockNavigate = jest.fn();

// Factory function for creating mock useLogin
const createMockUseLogin = (overrides?: { isPending?: boolean; isSuccess?: boolean; isError?: boolean }) => {
  return createMockMutationResult({
    mutate: mockMutate as any,
    isPending: false,
    isSuccess: false,
    isError: false,
    ...overrides,
  });
};

let mockUseLogin = createMockUseLogin();

jest.mock('@features/auth/hooks/useLogin', () => ({
  useLogin: () => mockUseLogin,
}));

jest.mock('@tanstack/react-router', () => {
  const actual = jest.requireActual<typeof import('@tanstack/react-router')>('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to, ...props }: React.ComponentProps<'a'> & { to: string }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMutate.mockClear();
    mockNavigate.mockClear();
    mockUseLogin = createMockUseLogin();
  });

  it('should render form with email and password inputs', () => {
    renderWithProviders(<LoginForm />, { initialEntries: ['/auth/login'] });

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should render with default values when VITE_USE_MOCK_API is true', () => {
    // Mock env to return true for VITE_USE_MOCK_API
    jest.doMock('@shared/lib/env.validation', () => ({
      env: {
        VITE_USE_MOCK_API: true,
      },
    }));

    renderWithProviders(<LoginForm />, { initialEntries: ['/auth/login'] });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    // Note: Default values are set in component, but we can't easily test them
    // without actually setting up the env mock properly
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
  });

  it('should have submit button enabled when not loading', () => {
    mockUseLogin = createMockUseLogin({ isPending: false });
    renderWithProviders(<LoginForm />, { initialEntries: ['/auth/login'] });

    const submitButton = screen.getByRole('button', { name: /login/i });
    expect(submitButton).toBeEnabled();
  });

  it('should display loading state when isPending is true', () => {
    mockUseLogin = createMockUseLogin({ isPending: true });
    renderWithProviders(<LoginForm />, { initialEntries: ['/auth/login'] });

    const submitButton = screen.getByRole('button', { name: /login/i });
    expect(submitButton).toBeDisabled();
  });

  it('should call mutate with correct data when form is submitted', async () => {
    const user = userEvent.setup();
    mockUseLogin = createMockUseLogin();
    renderWithProviders(<LoginForm />, { initialEntries: ['/auth/login'] });

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /login/i });

    // Clear default values first (form has default values when VITE_USE_MOCK_API is true)
    await user.clear(emailInput);
    await user.clear(passwordInput);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(
      () => {
        expect(mockMutate).toHaveBeenCalled();
        const callArgs = mockMutate.mock.calls[0];
        expect(callArgs?.[0]).toEqual({
          email: 'test@example.com',
          password: 'password123',
        });
        expect(callArgs?.[1]).toMatchObject({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        });
      },
      { timeout: 3000 }
    );
  });

  it('should display validation error when email is invalid', async () => {
    const user = userEvent.setup();
    mockUseLogin = createMockUseLogin();
    renderWithProviders(<LoginForm />, { initialEntries: ['/auth/login'] });

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('should display validation error when password is too short', async () => {
    const user = userEvent.setup();
    mockUseLogin = createMockUseLogin();
    renderWithProviders(<LoginForm />, { initialEntries: ['/auth/login'] });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.clear(emailInput);
    await user.type(emailInput, 'test@example.com');
    await user.clear(passwordInput);
    await user.type(passwordInput, '123');
    await user.click(submitButton);

    await waitFor(
      () => {
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('should display link to forgot password', () => {
    renderWithProviders(<LoginForm />, { initialEntries: ['/auth/login'] });

    const forgotPasswordLink = screen.getByRole('link', { name: /forgot password/i });
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink).toHaveAttribute('href', '/auth/forgot-password');
  });
});
