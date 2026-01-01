/**
 * Integration tests for authentication flows
 * Tests complete user journeys: login, register, password reset
 */

import { beforeEach, describe, it, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ForgotPasswordForm } from '@features/auth/components/ForgotPasswordForm';
import { LoginForm } from '@features/auth/components/LoginForm';
import { RegisterForm } from '@features/auth/components/RegisterForm';
import { renderWithProviders } from '@tests/test-utils';

// Mock hooks
const mockLoginMutate = jest.fn();
const mockRegisterMutate = jest.fn();
const mockForgotPasswordMutate = jest.fn();

jest.mock('@features/auth/hooks/useLogin', () => ({
  useLogin: () => ({
    mutate: mockLoginMutate,
    isPending: false,
    isSuccess: false,
    isError: false,
  }),
}));

jest.mock('@features/auth/hooks/useRegister', () => ({
  useRegister: () => ({
    mutate: mockRegisterMutate,
    isPending: false,
    isSuccess: false,
    isError: false,
  }),
}));

jest.mock('@features/auth/hooks/useForgotPassword', () => ({
  useForgotPassword: () => ({
    mutate: mockForgotPasswordMutate,
    isPending: false,
    isSuccess: false,
    isError: false,
  }),
}));

jest.mock('@tanstack/react-router', () => {
  const actual = jest.requireActual<typeof import('@tanstack/react-router')>('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: () => jest.fn(),
    Link: ({ children, to, ...props }: React.ComponentProps<'a'> & { to: string }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

describe('Auth Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Login Flow', () => {
    it('should complete login flow successfully', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginForm />, { initialEntries: ['/auth/login'] });

      // Fill form fields
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
      const submitButton = screen.getAllByRole('button', { name: /login/i })[0]!;

      await user.clear(emailInput);
      await user.type(emailInput, 'test@example.com');
      await user.clear(passwordInput);
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLoginMutate).toHaveBeenCalled();
        const callArgs = mockLoginMutate.mock.calls[0]?.[0];
        expect(callArgs).toEqual({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('should handle login validation errors', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginForm />, { initialEntries: ['/auth/login'] });

      // Try to submit with invalid email
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
      const submitButton = screen.getAllByRole('button', { name: /login/i })[0]!;

      await user.clear(emailInput);
      await user.type(emailInput, 'invalid-email');
      await user.clear(passwordInput);
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Wait a bit for validation to process
      await waitFor(
        () => {
          // Verify that mutation was not called (form validation prevented submission)
          expect(mockLoginMutate).not.toHaveBeenCalled();
        },
        { timeout: 2000 }
      );
    });
  });

  describe('Register Flow', () => {
    it('should complete registration flow successfully', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegisterForm />, { initialEntries: ['/auth/register'] });

      // Fill and submit register form
      const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement;
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i) as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /register/i });

      await user.clear(nameInput);
      await user.type(nameInput, 'New User');
      await user.clear(emailInput);
      await user.type(emailInput, 'newuser@example.com');
      await user.clear(passwordInput);
      await user.type(passwordInput, 'password123');
      await user.clear(confirmPasswordInput);
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockRegisterMutate).toHaveBeenCalled();
        const callArgs = mockRegisterMutate.mock.calls[0]?.[0];
        expect(callArgs).toEqual({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        });
      });
    });

    it('should handle registration validation errors', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegisterForm />, { initialEntries: ['/auth/register'] });

      // Try to submit with mismatched passwords
      const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement;
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i) as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /register/i });

      await user.clear(nameInput);
      await user.type(nameInput, 'New User');
      await user.clear(emailInput);
      await user.type(emailInput, 'newuser@example.com');
      await user.clear(passwordInput);
      await user.type(passwordInput, 'password123');
      await user.clear(confirmPasswordInput);
      await user.type(confirmPasswordInput, 'differentpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
      });

      expect(mockRegisterMutate).not.toHaveBeenCalled();
    });
  });

  describe('Password Reset Flow', () => {
    it('should complete forgot password flow successfully', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ForgotPasswordForm />, { initialEntries: ['/auth/forgot-password'] });

      // Fill and submit forgot password form
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      await user.clear(emailInput);
      await user.type(emailInput, 'user@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockForgotPasswordMutate).toHaveBeenCalled();
        const callArgs = mockForgotPasswordMutate.mock.calls[0]?.[0];
        expect(callArgs).toEqual({
          email: 'user@example.com',
        });
      });
    });
  });
});
