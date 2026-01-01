import { useMutation } from '@tanstack/react-query';

import { resetPasswordApi } from '@features/auth/api/reset-password.api';

/**
 * Hook for reset password functionality
 *
 * Handles resetting password with token from email
 *
 * @returns Mutation object with resetPassword function and state
 *
 * @example
 * ```tsx
 * const { mutate, isPending } = useResetPassword();
 *
 * mutate({ token: 'reset-token', password: 'newPassword', confirmPassword: 'newPassword' }, {
 *   onSuccess: () => navigate({ to: '/auth/login' }),
 *   onError: (error) => showError(error.message),
 * });
 * ```
 */
export const useResetPassword = () => {
  return useMutation({
    mutationFn: resetPasswordApi.resetPassword,
  });
};
