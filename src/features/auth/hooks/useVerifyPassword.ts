import { useMutation } from '@tanstack/react-query';

import { verifyPasswordApi } from '@features/auth/api/verify-password.api';

/**
 * Hook for verify password functionality
 *
 * Handles verifying password for sensitive actions
 *
 * @returns Mutation object with verifyPassword function and state
 *
 * @example
 * ```tsx
 * const { mutate, isPending } = useVerifyPassword();
 *
 * mutate({ password: 'userPassword' }, {
 *   onSuccess: (data) => {
 *     // Use data.sessionToken for sensitive action
 *     executeSensitiveAction(data.sessionToken);
 *   },
 *   onError: (error) => showError(error.message),
 * });
 * ```
 */
export const useVerifyPassword = () => {
  return useMutation({
    mutationFn: verifyPasswordApi.verifyPassword,
  });
};
