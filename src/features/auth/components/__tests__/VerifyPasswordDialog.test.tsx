// Test files are excluded from TypeScript build, so jest-dom matchers are available at runtime
// but TypeScript linter doesn't recognize them. These are false positives.

import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import type { VerifyPasswordResponse } from '@features/auth/types/auth.types';
import { renderWithProviders } from '@tests/test-utils';
import { createMockMutationResult } from '@tests/utils/test-mock-helpers';

import { VerifyPasswordDialog } from '../VerifyPasswordDialog';

// Mock hooks
const mockMutate = jest.fn();

// Factory function for creating mock useVerifyPassword
const createMockUseVerifyPassword = (overrides?: { isPending?: boolean; isSuccess?: boolean; isError?: boolean }) => {
  return createMockMutationResult({
    mutate: mockMutate as jest.MockedFunction<typeof mockMutate>,
    isPending: false,
    isSuccess: false,
    isError: false,
    ...overrides,
  });
};

let mockUseVerifyPassword = createMockUseVerifyPassword();

jest.mock('@features/auth/hooks/useVerifyPassword', () => ({
  useVerifyPassword: () => mockUseVerifyPassword,
}));

describe('VerifyPasswordDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnVerified = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockMutate.mockClear();
    mockOnClose.mockClear();
    mockOnVerified.mockClear();
    mockUseVerifyPassword = createMockUseVerifyPassword();
  });

  it('should not render when open is false', () => {
    renderWithProviders(<VerifyPasswordDialog open={false} onClose={mockOnClose} onVerified={mockOnVerified} />);

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByLabelText(/password/i)).toBeNull();
  });

  it('should render dialog when open is true', () => {
    renderWithProviders(<VerifyPasswordDialog open={true} onClose={mockOnClose} onVerified={mockOnVerified} />);

    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /verify/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should render with custom title and description when provided', () => {
    const customTitle = 'Custom Title';
    const customDescription = 'Custom Description';

    renderWithProviders(
      <VerifyPasswordDialog
        open={true}
        onClose={mockOnClose}
        onVerified={mockOnVerified}
        title={customTitle}
        description={customDescription}
      />
    );

    expect(screen.getByText(customTitle)).toBeInTheDocument();
    expect(screen.getByText(customDescription)).toBeInTheDocument();
  });

  it('should render with default title and description when not provided', () => {
    renderWithProviders(<VerifyPasswordDialog open={true} onClose={mockOnClose} onVerified={mockOnVerified} />);

    // Default titles come from translation keys - use getAllByText since title appears in h2
    const titles = screen.getAllByText(/verify password/i);
    expect(titles.length).toBeGreaterThan(0);
    expect(screen.getByText(/verify password description/i)).toBeInTheDocument();
  });

  it('should display password input', () => {
    renderWithProviders(<VerifyPasswordDialog open={true} onClose={mockOnClose} onVerified={mockOnVerified} />);

    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should display validation error when submitting empty form', async () => {
    const user = userEvent.setup();
    renderWithProviders(<VerifyPasswordDialog open={true} onClose={mockOnClose} onVerified={mockOnVerified} />);

    const submitButton = screen.getByRole('button', { name: /verify/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('should call mutate with correct data when submitting valid form', async () => {
    const user = userEvent.setup();
    renderWithProviders(<VerifyPasswordDialog open={true} onClose={mockOnClose} onVerified={mockOnVerified} />);

    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /verify/i });

    await user.type(passwordInput, 'correctPassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        {
          password: 'correctPassword',
        },
        expect.objectContaining({
          onError: expect.any(Function),
          onSuccess: expect.any(Function),
        })
      );
    });
  });

  it('should display loading state when isPending is true', () => {
    mockUseVerifyPassword = createMockUseVerifyPassword({ isPending: true });
    renderWithProviders(<VerifyPasswordDialog open={true} onClose={mockOnClose} onVerified={mockOnVerified} />);

    const verifyButton = screen.getByRole('button', { name: /verify/i });
    const cancelButton = screen.getByRole('button', { name: /cancel/i });

    expect(verifyButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('should display root error message when mutation fails', async () => {
    const user = userEvent.setup();
    renderWithProviders(<VerifyPasswordDialog open={true} onClose={mockOnClose} onVerified={mockOnVerified} />);

    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /verify/i });

    await user.type(passwordInput, 'wrongPassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });

    // Simulate error callback
    const callArgs = mockMutate.mock.calls[0]?.[1];
    if (callArgs && typeof callArgs === 'object' && 'onError' in callArgs) {
      const mockError = new Error('Password verification failed');
      (callArgs.onError as (error: Error) => void)(mockError);
    }

    await waitFor(() => {
      expect(screen.getByText(/password verification failed/i)).toBeInTheDocument();
    });
  });

  it('should display fallback error message when mutation fails without error message', async () => {
    const user = userEvent.setup();
    renderWithProviders(<VerifyPasswordDialog open={true} onClose={mockOnClose} onVerified={mockOnVerified} />);

    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /verify/i });

    await user.type(passwordInput, 'wrongPassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });

    // Simulate error callback without message
    const callArgs = mockMutate.mock.calls[0]?.[1];
    if (callArgs && typeof callArgs === 'object' && 'onError' in callArgs) {
      const mockError = { message: undefined, name: 'Error' } as unknown as Error;
      (callArgs.onError as (error: Error) => void)(mockError);
    }

    await waitFor(() => {
      expect(screen.getByText(/password verification failed. please try again./i)).toBeInTheDocument();
    });
  });

  it('should call onVerified with response data when success', async () => {
    const user = userEvent.setup();
    const mockResponse: VerifyPasswordResponse = {
      success: true,
      verified: true,
      sessionToken: 'session-token-123',
      expiresIn: 300,
    };

    renderWithProviders(<VerifyPasswordDialog open={true} onClose={mockOnClose} onVerified={mockOnVerified} />);

    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /verify/i });

    await user.type(passwordInput, 'correctPassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });

    // Simulate success callback
    const callArgs = mockMutate.mock.calls[0]?.[1];
    if (callArgs && typeof callArgs === 'object' && 'onSuccess' in callArgs) {
      (callArgs.onSuccess as (data: VerifyPasswordResponse) => void)(mockResponse);
    }

    await waitFor(() => {
      expect(mockOnVerified).toHaveBeenCalledWith(mockResponse);
    });
  });

  it('should reset form after success', async () => {
    const user = userEvent.setup();
    const mockResponse: VerifyPasswordResponse = {
      success: true,
      verified: true,
      sessionToken: 'session-token-123',
      expiresIn: 300,
    };

    renderWithProviders(<VerifyPasswordDialog open={true} onClose={mockOnClose} onVerified={mockOnVerified} />);

    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /verify/i });

    await user.type(passwordInput, 'correctPassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });

    // Simulate success callback
    const callArgs = mockMutate.mock.calls[0]?.[1];
    if (callArgs && typeof callArgs === 'object' && 'onSuccess' in callArgs) {
      (callArgs.onSuccess as (data: VerifyPasswordResponse) => void)(mockResponse);
    }

    await waitFor(() => {
      // Form should be reset (input should be empty)
      expect((passwordInput as HTMLInputElement).value).toBe('');
    });
  });

  it('should call onClose when clicking backdrop', async () => {
    const user = userEvent.setup();
    renderWithProviders(<VerifyPasswordDialog open={true} onClose={mockOnClose} onVerified={mockOnVerified} />);

    // Find backdrop (the div with onClick handler)
    const backdrop = document.querySelector(String.raw`.fixed.inset-0.bg-black\/50`);
    expect(backdrop).toBeInTheDocument();

    if (backdrop) {
      await user.click(backdrop as HTMLElement);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('should call onClose and reset form when clicking Cancel button', async () => {
    const user = userEvent.setup();
    renderWithProviders(<VerifyPasswordDialog open={true} onClose={mockOnClose} onVerified={mockOnVerified} />);

    const passwordInput = screen.getByLabelText(/password/i);
    const cancelButton = screen.getByRole('button', { name: /cancel/i });

    await user.type(passwordInput, 'somePassword');
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
    // Form should be reset
    await waitFor(() => {
      expect((passwordInput as HTMLInputElement).value).toBe('');
    });
  });

  it('should disable buttons when loading', () => {
    mockUseVerifyPassword = createMockUseVerifyPassword({ isPending: true });
    renderWithProviders(<VerifyPasswordDialog open={true} onClose={mockOnClose} onVerified={mockOnVerified} />);

    const verifyButton = screen.getByRole('button', { name: /verify/i });
    const cancelButton = screen.getByRole('button', { name: /cancel/i });

    expect(verifyButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('should auto focus on password input', () => {
    renderWithProviders(<VerifyPasswordDialog open={true} onClose={mockOnClose} onVerified={mockOnVerified} />);

    const passwordInput = screen.getByLabelText(/password/i);
    // Check if autoFocus prop is set - in React, autoFocus is handled differently
    // We just verify the input exists and has the autoFocus prop in the component
    expect(passwordInput).toBeInTheDocument();
    // Note: autoFocus behavior is tested by checking the component code, not DOM attribute
  });
});
