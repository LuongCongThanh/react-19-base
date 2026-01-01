import { beforeEach, describe, it, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '@tests/test-utils';

import { ForgotPasswordPage } from '../ForgotPasswordPage';

// Mock ForgotPasswordForm component
jest.mock('@features/auth/components/ForgotPasswordForm', () => ({
  ForgotPasswordForm: () => <div data-testid="forgot-password-form">ForgotPasswordForm</div>,
}));

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render page with title and description', () => {
    renderWithProviders(<ForgotPasswordPage />, { initialEntries: ['/auth/forgot-password'] });

    // There may be multiple elements with "forgot password" text
    const forgotPasswordTexts = screen.getAllByText(/forgot password/i);
    expect(forgotPasswordTexts.length).toBeGreaterThan(0);
    expect(screen.getByText(/forgot password description/i)).toBeInTheDocument();
  });

  it('should render ForgotPasswordForm component', () => {
    renderWithProviders(<ForgotPasswordPage />, { initialEntries: ['/auth/forgot-password'] });

    expect(screen.getByTestId('forgot-password-form')).toBeInTheDocument();
  });
});
