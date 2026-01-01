import { beforeEach, describe, it, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithProviders } from '@tests/test-utils';
import { createMockMutationResult } from '@tests/utils/test-mock-helpers';

import { RegisterForm } from '../RegisterForm';

// Mock hooks
const mockMutate = jest.fn();
const mockNavigate = jest.fn();

// Factory function for creating mock useRegister
const createMockUseRegister = (overrides?: { isPending?: boolean; isSuccess?: boolean; isError?: boolean }) => {
  return createMockMutationResult({
    mutate: mockMutate as any,
    isPending: false,
    isSuccess: false,
    isError: false,
    ...overrides,
  });
};

let mockUseRegister = createMockUseRegister();

jest.mock('@features/auth/hooks/useRegister', () => ({
  useRegister: () => mockUseRegister,
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

describe('RegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMutate.mockClear();
    mockNavigate.mockClear();
    mockUseRegister = createMockUseRegister();
  });

  it('should render form with name, email, password, and confirmPassword inputs', () => {
    renderWithProviders(<RegisterForm />, { initialEntries: ['/auth/register'] });

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText('password')).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('should have submit button enabled when not loading', () => {
    mockUseRegister = createMockUseRegister({ isPending: false });
    renderWithProviders(<RegisterForm />, { initialEntries: ['/auth/register'] });

    const submitButton = screen.getByRole('button', { name: /register/i });
    expect(submitButton).toBeEnabled();
  });

  it('should display loading state when isPending is true', () => {
    mockUseRegister = createMockUseRegister({ isPending: true });
    renderWithProviders(<RegisterForm />, { initialEntries: ['/auth/register'] });

    const submitButton = screen.getByRole('button', { name: /register/i });
    expect(submitButton).toBeDisabled();
  });

  it('should call mutate with correct data when form is submitted', async () => {
    const user = userEvent.setup();
    mockUseRegister = createMockUseRegister();
    renderWithProviders(<RegisterForm />, { initialEntries: ['/auth/register'] });

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText('password');
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /register/i });

    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      );
    });
  });
});
