import { useMutation } from '@tanstack/react-query';

import { changePasswordApi } from '@features/auth/api/change-password.api';

/**
 * Hook for change password functionality
 *
 * Handles changing password when user is logged in
 *
 * @returns Mutation object with changePassword function and state
 *
 * @example
 * ```tsx
 * const { mutate, isPending } = useChangePassword();
 *
 * mutate({ currentPassword: 'old', newPassword: 'new', confirmPassword: 'new' }, {
 *   onSuccess: () => showSuccess('Password changed successfully'),
 *   onError: (error) => showError(error.message),
 * });
 * ```
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePasswordApi.changePassword,
  });
};
