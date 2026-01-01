import { beforeEach, describe, it, jest } from '@jest/globals';
import { useSearch } from '@tanstack/react-router';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '@tests/test-utils';

import { ResetPasswordPage } from '../ResetPasswordPage';

// Mock ResetPasswordForm component
jest.mock('@features/auth/components/ResetPasswordForm', () => ({
  ResetPasswordForm: ({ token }: { token: string }) => (
    <div data-testid="reset-password-form" data-token={token}>
      <div>Reset Password Form</div>
    </div>
  ),
}));

// Mock Navigate component
jest.mock('@tanstack/react-router', () => {
  const actual = jest.requireActual<typeof import('@tanstack/react-router')>('@tanstack/react-router');
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => (
      <div data-testid="navigate" data-to={to}>
        Navigate to {to}
      </div>
    ),
    useSearch: jest.fn(),
  };
});

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render page with title and description when token is provided', () => {
    (useSearch as jest.Mock).mockReturnValue({ token: 'reset-token-123' });

    renderWithProviders(<ResetPasswordPage />, { initialEntries: ['/auth/reset-password?token=reset-token-123'] });

    // Use getAllByText and check first occurrence (title)
    const resetPasswordTexts = screen.getAllByText(/reset password/i);
    expect(resetPasswordTexts.length).toBeGreaterThan(0);
    expect(screen.getByText(/reset password description/i)).toBeInTheDocument();
  });

  it('should render ResetPasswordForm component with token when token is provided', () => {
    (useSearch as jest.Mock).mockReturnValue({ token: 'reset-token-123' });

    renderWithProviders(<ResetPasswordPage />, { initialEntries: ['/auth/reset-password?token=reset-token-123'] });

    const form = screen.getByTestId('reset-password-form');
    expect(form).toBeInTheDocument();
    expect(form).toHaveAttribute('data-token', 'reset-token-123');
  });

  it('should navigate to forgot password page when token is missing', () => {
    (useSearch as jest.Mock).mockReturnValue({});

    renderWithProviders(<ResetPasswordPage />, { initialEntries: ['/auth/reset-password'] });

    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/auth/forgot-password');
  });

  it('should navigate to forgot password page when token is empty string', () => {
    (useSearch as jest.Mock).mockReturnValue({ token: '' });

    renderWithProviders(<ResetPasswordPage />, { initialEntries: ['/auth/reset-password'] });

    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/auth/forgot-password');
  });
});
