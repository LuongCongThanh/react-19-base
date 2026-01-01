import { beforeEach, describe, it, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import * as React from 'react';

import { renderWithProviders } from '@tests/test-utils';

import { LoginPage } from '../LoginPage';

// Mock LoginForm component
jest.mock('@features/auth/components/LoginForm', () => ({
  LoginForm: () => <div data-testid="login-form">LoginForm</div>,
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

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render page with title and subtitle', () => {
    renderWithProviders(<LoginPage />, { initialEntries: ['/auth/login'] });

    expect(screen.getByText(/login title/i)).toBeInTheDocument();
    expect(screen.getByText(/login subtitle/i)).toBeInTheDocument();
  });

  it('should render LoginForm component', () => {
    renderWithProviders(<LoginPage />, { initialEntries: ['/auth/login'] });

    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  it('should render link to register page', () => {
    renderWithProviders(<LoginPage />, { initialEntries: ['/auth/login'] });

    const registerLink = screen.getByRole('link', { name: /register link/i });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/auth/register');
  });

  it('should render "no account" text', () => {
    renderWithProviders(<LoginPage />, { initialEntries: ['/auth/login'] });

    expect(screen.getByText(/no account/i)).toBeInTheDocument();
  });
});
