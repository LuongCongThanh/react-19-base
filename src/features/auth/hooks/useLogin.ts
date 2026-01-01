import { useMutation, useQueryClient } from '@tanstack/react-query';

import { tokenStorage } from '@shared/lib/token-storage';

import { loginApi } from '@features/auth/api/login.api';
import { AUTH_QUERY_KEYS } from '@features/auth/constants/auth-query-keys.constants';
import { useAuthStore } from '@features/auth/stores/auth.store';

/**
 * Hook for user login
 *
 * Handles login mutation, token storage, and auth state management
 *
 * @returns Mutation object with login function and state
 *
 * @example
 * ```tsx
 * const { mutate, isPending } = useLogin();
 *
 * mutate({ email: 'user@example.com', password: 'password' }, {
 *   onSuccess: () => navigate({ to: '/dashboard' }),
 *   onError: (error) => showError(error.message),
 * });
 * ```
 */
export const useLogin = () => {
  const queryClient = useQueryClient();
  // Sử dụng selector đúng kiểu store, không cần ReturnType
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: loginApi.login,
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
