import { useMutation, useQueryClient } from '@tanstack/react-query';

import { tokenStorage } from '@shared/lib/token-storage';

import { registerApi } from '@features/auth/api/register.api';
import { AUTH_QUERY_KEYS } from '@features/auth/constants/auth-query-keys.constants';
import { useAuthStore } from '@features/auth/stores/auth.store';

/**
 * Hook for user registration
 *
 * Handles registration mutation, token storage, and auth state management
 *
 * @returns Mutation object with register function and state
 *
 * @example
 * ```tsx
 * const { mutate, isPending } = useRegister();
 *
 * mutate({ email: 'user@example.com', password: 'password', name: 'John' }, {
 *   onSuccess: () => navigate({ to: '/dashboard' }),
 *   onError: (error) => showError(error.message),
 * });
 * ```
 */
export const useRegister = () => {
  const queryClient = useQueryClient();
  // Sử dụng selector đúng kiểu store, không cần ReturnType
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: registerApi.register,
    onSuccess: (data) => {
      // Save token using secure token storage
      tokenStorage.setToken(data.token);

      // Save refresh token if provided
      if (data.refreshToken) {
        tokenStorage.setRefreshToken(data.refreshToken);
      }

      // Update auth store
      setAuth(data.user, data.token);

      // Set query data for immediate access
      queryClient.setQueryData(AUTH_QUERY_KEYS.me(), data.user);
    },
  });
};
