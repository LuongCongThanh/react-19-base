import { beforeEach, describe, it, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithProviders } from '../../../../tests/test-utils';
import { createMockMutationResult } from '../../../../tests/utils/test-mock-helpers';
import { ResetPasswordForm } from '../ResetPasswordForm';

// Mock hooks
const mockMutate = jest.fn();
const mockNavigate = jest.fn();

// Factory function for creating mock useResetPassword
const createMockUseResetPassword = (overrides?: { isPending?: boolean; isSuccess?: boolean; isError?: boolean }) => {
  return createMockMutationResult({
    mutate: mockMutate as any,
    isPending: false,
    isSuccess: false,
    isError: false,
    ...overrides,
  });
};

let mockUseResetPassword = createMockUseResetPassword();

jest.mock('@features/auth/hooks/useResetPassword', () => ({
  useResetPassword: () => mockUseResetPassword,
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

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMutate.mockClear();
    mockNavigate.mockClear();
    mockUseResetPassword = createMockUseResetPassword();
  });

  it('should render form with password and confirmPassword inputs', () => {
    renderWithProviders(<ResetPasswordForm token="reset-token-123" />, { initialEntries: ['/auth/reset-password'] });

    const inputs = screen.getAllByPlaceholderText(/password/i);
    expect(inputs.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
  });

  it('should have submit button enabled when not loading', () => {
    mockUseResetPassword = createMockUseResetPassword({ isPending: false });
    renderWithProviders(<ResetPasswordForm token="reset-token-123" />, { initialEntries: ['/auth/reset-password'] });

    const submitButton = screen.getByRole('button', { name: /reset password/i });
    expect(submitButton).toBeEnabled();
  });

  it('should display loading state when isPending is true', () => {
    mockUseResetPassword = createMockUseResetPassword({ isPending: true });
    renderWithProviders(<ResetPasswordForm token="reset-token-123" />, { initialEntries: ['/auth/reset-password'] });

    const submitButton = screen.getByRole('button', { name: /reset password/i });
    expect(submitButton).toBeDisabled();
  });

  it('should call mutate with correct data when form is submitted', async () => {
    const user = userEvent.setup();
    mockUseResetPassword = createMockUseResetPassword();
    renderWithProviders(<ResetPasswordForm token="reset-token-123" />, { initialEntries: ['/auth/reset-password'] });

    const passwordInputs = screen.getAllByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    await user.type(passwordInputs[0]!, 'newPassword123');
    await user.type(passwordInputs[1]!, 'newPassword123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          token: 'reset-token-123',
          password: 'newPassword123',
          confirmPassword: 'newPassword123',
        }),
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      );
    });
  });

  it('should navigate to login page on successful password reset', async () => {
    const user = userEvent.setup();
    mockUseResetPassword = createMockUseResetPassword({ isSuccess: true });
    renderWithProviders(<ResetPasswordForm token="reset-token-123" />, { initialEntries: ['/auth/reset-password'] });

    const passwordInputs = screen.getAllByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    await user.type(passwordInputs[0]!, 'newPassword123');
    await user.type(passwordInputs[1]!, 'newPassword123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });

    // Simulate success callback
    const callArgs = mockMutate.mock.calls[0]?.[1];
    if (
      callArgs &&
      typeof callArgs === 'object' &&
      'onSuccess' in callArgs &&
      typeof callArgs.onSuccess === 'function'
    ) {
      callArgs.onSuccess({} as never);
    }

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/auth/login' });
    });
  });
});
