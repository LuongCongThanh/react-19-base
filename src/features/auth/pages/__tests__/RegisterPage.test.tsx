import { beforeEach, describe, it, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import * as React from 'react';

import { renderWithProviders } from '@tests/test-utils';

import { RegisterPage } from '../RegisterPage';

// Mock RegisterForm component
jest.mock('@features/auth/components/RegisterForm', () => ({
  RegisterForm: () => <div data-testid="register-form">RegisterForm</div>,
}));

jest.mock('@tanstack/react-router', () => {
  const actual = jest.requireActual<typeof import('@tanstack/react-router')>('@tanstack/react-router');
  return {
    ...actual,
    Link: ({ children, to, ...props }: React.ComponentProps<'a'> & { to: string }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render page with title and subtitle', () => {
    renderWithProviders(<RegisterPage />, { initialEntries: ['/auth/register'] });

    expect(screen.getByText(/register title/i)).toBeInTheDocument();
    expect(screen.getByText(/register subtitle/i)).toBeInTheDocument();
  });

  it('should render RegisterForm component', () => {
    renderWithProviders(<RegisterPage />, { initialEntries: ['/auth/register'] });

    expect(screen.getByTestId('register-form')).toBeInTheDocument();
  });

  it('should render link to login page', () => {
    renderWithProviders(<RegisterPage />, { initialEntries: ['/auth/register'] });

    const loginLink = screen.getByRole('link', { name: /login link/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/auth/login');
  });

  it('should render "has account" text', () => {
    renderWithProviders(<RegisterPage />, { initialEntries: ['/auth/register'] });

    expect(screen.getByText(/has account/i)).toBeInTheDocument();
  });
});
