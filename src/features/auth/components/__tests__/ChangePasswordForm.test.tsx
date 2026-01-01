import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@tests/test-utils';
import { createMockMutationResult } from '@tests/utils/test-mock-helpers';

import { ChangePasswordForm } from '../ChangePasswordForm';

// Helper to get inputs by ID
const getInputs = () => ({
  currentPassword: document.querySelector('#currentPassword') as HTMLInputElement,
  newPassword: document.querySelector('#newPassword') as HTMLInputElement,
  confirmPassword: document.querySelector('#confirmPassword') as HTMLInputElement,
});

// Mock hooks
const mockMutate = jest.fn();

// Factory function for creating mock useChangePassword
const createMockUseChangePassword = (overrides?: { isPending?: boolean; isSuccess?: boolean; isError?: boolean }) => {
  return createMockMutationResult({
    mutate: mockMutate as any,
    isPending: false,
    isSuccess: false,
    isError: false,
    ...overrides,
  });
};

let mockUseChangePassword = createMockUseChangePassword();

jest.mock('@features/auth/hooks/useChangePassword', () => ({
  useChangePassword: () => mockUseChangePassword,
}));

describe('ChangePasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockMutate.mockClear();
    mockUseChangePassword = createMockUseChangePassword();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render form with currentPassword, newPassword, and confirmPassword inputs', () => {
      renderWithProviders(<ChangePasswordForm />);

      const { currentPassword, newPassword, confirmPassword } = getInputs();
      expect(currentPassword).toBeInTheDocument();
      expect(newPassword).toBeInTheDocument();
      expect(confirmPassword).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /change password/i })).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should display validation errors when submitting empty form', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<ChangePasswordForm />);

      const submitButton = screen.getByRole('button', { name: /change password/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/current password is required/i)).toBeInTheDocument();
      });
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });

    it('should display validation error when currentPassword is empty', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<ChangePasswordForm />);

      const { newPassword, confirmPassword } = getInputs();
      const submitButton = screen.getByRole('button', { name: /change password/i });

      await user.type(newPassword, 'newpassword123');
      await user.type(confirmPassword, 'newpassword123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/current password is required/i)).toBeInTheDocument();
      });
    });

    it('should display validation error when newPassword is too short', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<ChangePasswordForm />);

      const { currentPassword, newPassword, confirmPassword } = getInputs();
      const submitButton = screen.getByRole('button', { name: /change password/i });

      await user.type(currentPassword, 'oldpassword123');
      await user.type(newPassword, '12345');
      await user.type(confirmPassword, '12345');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
      });
    });

    it('should display validation error when confirmPassword does not match', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<ChangePasswordForm />);

      const { currentPassword, newPassword, confirmPassword } = getInputs();
      const submitButton = screen.getByRole('button', { name: /change password/i });

      await user.type(currentPassword, 'oldpassword123');
      await user.type(newPassword, 'newpassword123');
      await user.type(confirmPassword, 'newpassword456');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
      });
    });

    it('should display validation error when newPassword is same as currentPassword', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<ChangePasswordForm />);

      const { currentPassword, newPassword, confirmPassword } = getInputs();
      const submitButton = screen.getByRole('button', { name: /change password/i });

      await user.type(currentPassword, 'samepassword123');
      await user.type(newPassword, 'samepassword123');
      await user.type(confirmPassword, 'samepassword123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/new password must be different from current password/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call mutate with correct data when submitting valid form', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<ChangePasswordForm />);

      const { currentPassword, newPassword, confirmPassword } = getInputs();
      const submitButton = screen.getByRole('button', { name: /change password/i });

      await user.type(currentPassword, 'oldpassword123');
      await user.type(newPassword, 'newpassword123');
      await user.type(confirmPassword, 'newpassword123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          {
            currentPassword: 'oldpassword123',
            newPassword: 'newpassword123',
            confirmPassword: 'newpassword123',
          },
          expect.objectContaining({
            onError: expect.any(Function),
            onSuccess: expect.any(Function),
          })
        );
      });
    });
  });

  describe('Loading States', () => {
    it('should display loading state when isPending is true', () => {
      mockUseChangePassword = createMockUseChangePassword({ isPending: true });
      renderWithProviders(<ChangePasswordForm />);

      const submitButton = screen.getByRole('button', { name: /change password/i });
      expect(submitButton).toBeDisabled();
    });

    it('should disable submit button when loading', () => {
      mockUseChangePassword = createMockUseChangePassword({ isPending: true });
      renderWithProviders(<ChangePasswordForm />);

      const submitButton = screen.getByRole('button', { name: /change password/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should display root error message when mutation fails', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<ChangePasswordForm />);

      const { currentPassword, newPassword, confirmPassword } = getInputs();
      const submitButton = screen.getByRole('button', { name: /change password/i });

      await user.type(currentPassword, 'oldpassword123');
      await user.type(newPassword, 'newpassword123');
      await user.type(confirmPassword, 'newpassword123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
      });

      // Simulate error callback
      const callArgs = mockMutate.mock.calls[0]?.[1];
      if (callArgs && typeof callArgs === 'object' && 'onError' in callArgs) {
        const mockError = new Error('Failed to change password');
        (callArgs.onError as (error: Error) => void)(mockError);
      }

      await waitFor(() => {
        expect(screen.getByText(/failed to change password/i)).toBeInTheDocument();
      });
    });

    it('should display fallback error message when mutation fails without error message', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<ChangePasswordForm />);

      const { currentPassword, newPassword, confirmPassword } = getInputs();
      const submitButton = screen.getByRole('button', { name: /change password/i });

      await user.type(currentPassword, 'oldpassword123');
      await user.type(newPassword, 'newpassword123');
      await user.type(confirmPassword, 'newpassword123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
      });

      // Simulate error callback without message
      const callArgs = mockMutate.mock.calls[0]?.[1];
      if (callArgs && typeof callArgs === 'object' && 'onError' in callArgs) {
        const mockError = { message: undefined } as unknown as Error;
        (callArgs.onError as (error: Error) => void)(mockError);
      }

      await waitFor(() => {
        expect(screen.getByText(/failed to change password. please try again./i)).toBeInTheDocument();
      });
    });
  });

  describe('Success Handling', () => {
    it('should display success message when mutation succeeds', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<ChangePasswordForm />);

      const { currentPassword, newPassword, confirmPassword } = getInputs();
      const submitButton = screen.getByRole('button', { name: /change password/i });

      await user.type(currentPassword, 'oldpassword123');
      await user.type(newPassword, 'newpassword123');
      await user.type(confirmPassword, 'newpassword123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
      });

      // Simulate success callback
      const callArgs = mockMutate.mock.calls[0]?.[1];
      if (callArgs && typeof callArgs === 'object' && 'onSuccess' in callArgs) {
        (callArgs.onSuccess as () => void)();
      }

      await waitFor(() => {
        expect(screen.getByText(/password changed success/i)).toBeInTheDocument();
      });
    });

    it('should reset form after success', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<ChangePasswordForm />);

      const inputs = getInputs();
      const submitButton = screen.getByRole('button', { name: /change password/i });

      await user.type(inputs.currentPassword, 'oldpassword123');
      await user.type(inputs.newPassword, 'newpassword123');
      await user.type(inputs.confirmPassword, 'newpassword123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
      });

      // Simulate success callback
      const callArgs = mockMutate.mock.calls[0]?.[1];
      if (callArgs && typeof callArgs === 'object' && 'onSuccess' in callArgs) {
        (callArgs.onSuccess as () => void)();
      }

      await waitFor(() => {
        // Form should be reset (inputs should be empty)
        const resetInputs = getInputs();
        expect(resetInputs.currentPassword.value).toBe('');
        expect(resetInputs.newPassword.value).toBe('');
        expect(resetInputs.confirmPassword.value).toBe('');
      });
    });

    it('should hide success message after 3 seconds', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<ChangePasswordForm />);

      const { currentPassword, newPassword, confirmPassword } = getInputs();
      const submitButton = screen.getByRole('button', { name: /change password/i });

      await user.type(currentPassword, 'oldpassword123');
      await user.type(newPassword, 'newpassword123');
      await user.type(confirmPassword, 'newpassword123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
      });

      // Simulate success callback
      const callArgs = mockMutate.mock.calls[0]?.[1];
      if (callArgs && typeof callArgs === 'object' && 'onSuccess' in callArgs) {
        (callArgs.onSuccess as () => void)();
      }

      await waitFor(() => {
        expect(screen.getByText(/password changed success/i)).toBeInTheDocument();
      });

      // Fast-forward 3 seconds
      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.queryByText(/password changed success/i)).not.toBeInTheDocument();
      });
    });
  });
});
