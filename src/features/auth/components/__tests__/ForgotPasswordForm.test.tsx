import { beforeEach, describe, it, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithProviders } from '@tests/test-utils';
import { createMockMutationResult } from '@tests/utils/test-mock-helpers';

import { ForgotPasswordForm } from '../ForgotPasswordForm';

// Mock hooks
const mockMutate = jest.fn();
const mockNavigate = jest.fn();

// Factory function for creating mock useForgotPassword
const createMockUseForgotPassword = (overrides?: { isPending?: boolean; isSuccess?: boolean; isError?: boolean }) => {
  return createMockMutationResult({
    mutate: mockMutate as any,
    isPending: false,
    isSuccess: false,
    isError: false,
    ...overrides,
  });
};

let mockUseForgotPassword = createMockUseForgotPassword();

jest.mock('@features/auth/hooks/useForgotPassword', () => ({
  useForgotPassword: () => mockUseForgotPassword,
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

// Helper to extract callbacks from useForgotPassword.mutate mock
const getCallbacksFromMutate = (callIndex = 0) => {
  const callArgs = mockMutate.mock.calls[callIndex]?.[1];
  if (!callArgs || typeof callArgs !== 'object') return null;
  return callArgs as {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
  };
};

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMutate.mockClear();
    mockNavigate.mockClear();
    mockUseForgotPassword = createMockUseForgotPassword();
  });

  it('should render form with email input', () => {
    renderWithProviders(<ForgotPasswordForm />, {
      initialEntries: ['/auth/forgot-password'],
    });

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to login/i })).toBeInTheDocument();
  });

  it('should call mutate with correct data when submitting valid form', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordForm />, {
      initialEntries: ['/auth/forgot-password'],
    });

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        {
          email: 'test@example.com',
        },
        expect.objectContaining({
          onError: expect.any(Function),
          onSuccess: expect.any(Function),
        })
      );
    });
  });

  it('should display loading state when isPending is true', () => {
    mockUseForgotPassword = createMockUseForgotPassword({ isPending: true });
    renderWithProviders(<ForgotPasswordForm />, {
      initialEntries: ['/auth/forgot-password'],
    });

    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    expect(submitButton).toBeDisabled();
  });

  it('should display success message when mutation succeeds', async () => {
    const user = userEvent.setup();
    mockUseForgotPassword = createMockUseForgotPassword();
    renderWithProviders(<ForgotPasswordForm />, {
      initialEntries: ['/auth/forgot-password'],
    });

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });

    // Simulate success callback
    const callbacks = getCallbacksFromMutate();
    if (callbacks?.onSuccess) {
      callbacks.onSuccess();
    }

    // Wait for success state to render (form is replaced with success message)
    await waitFor(() => {
      // Success message should be displayed - look for green background or back to login button
      const backToLoginButton = screen.queryByRole('button', { name: /back to login/i });
      expect(backToLoginButton).toBeInTheDocument();
    });
  });

  it('should display root error message when mutation fails', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordForm />, {
      initialEntries: ['/auth/forgot-password'],
    });

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });

    // Simulate error callback
    const callbacks = getCallbacksFromMutate();
    if (callbacks?.onError) {
      const mockError = new Error('Failed to send reset email');
      callbacks.onError(mockError);
    }

    await waitFor(() => {
      expect(
        screen.getByText((content) => content.toLowerCase().includes('failed to send reset email'))
      ).toBeInTheDocument();
    });
  });

  it('should display fallback error message when mutation fails without error message', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordForm />, {
      initialEntries: ['/auth/forgot-password'],
    });

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });

    // Simulate error callback without message
    const callbacks = getCallbacksFromMutate();
    if (callbacks?.onError) {
      const mockError = new Error('error placeholder');
      mockError.message = undefined as never;
      callbacks.onError(mockError);
    }

    await waitFor(() => {
      expect(
        screen.getByText((content) => content.toLowerCase().includes('failed to send reset email. please try again.'))
      ).toBeInTheDocument();
    });
  });

  it('should display link "Back to Login" in form and navigate correctly', () => {
    renderWithProviders(<ForgotPasswordForm />, {
      initialEntries: ['/auth/forgot-password'],
    });

    const backToLoginLink = screen.getByRole('link', { name: /back to login/i });
    expect(backToLoginLink).toBeInTheDocument();
    expect(backToLoginLink).toHaveAttribute('href', '/auth/login');
  });

  it('should submit form when pressing Enter key on email input', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordForm />, {
      initialEntries: ['/auth/forgot-password'],
    });

    const emailInput = screen.getByLabelText(/email/i);

    await user.type(emailInput, 'test@example.com{Enter}');

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        { email: 'test@example.com' },
        expect.objectContaining({
          onError: expect.any(Function),
          onSuccess: expect.any(Function),
        })
      );
    });
  });

  it('should show error styling when mutation fails', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordForm />, {
      initialEntries: ['/auth/forgot-password'],
    });

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });

    // Simulate error callback
    const callbacks = getCallbacksFromMutate();
    if (callbacks?.onError) {
      const mockError = new Error('Network error');
      callbacks.onError(mockError);
    }

    await waitFor(() => {
      expect(screen.getByText((content) => content.toLowerCase().includes('network error'))).toBeInTheDocument();
    });
  });
});
