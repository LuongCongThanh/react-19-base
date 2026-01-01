import { useMutation } from '@tanstack/react-query';

import { forgotPasswordApi } from '@features/auth/api/forgot-password.api';

/**
 * Hook for forgot password functionality
 *
 * Handles sending password reset email
 *
 * @returns Mutation object with forgotPassword function and state
 *
 * @example
 * ```tsx
 * const { mutate, isPending } = useForgotPassword();
 *
 * mutate({ email: 'user@example.com' }, {
 *   onSuccess: () => showSuccess('Password reset email sent'),
 *   onError: (error) => showError(error.message),
 * });
 * ```
 */
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: forgotPasswordApi.forgotPassword,
  });
};
