import { useMutation, useQueryClient } from '@tanstack/react-query';

import { tokenStorage } from '@shared/lib/token-storage';

import { logoutApi } from '@features/auth/api/logout.api';
import { AUTH_QUERY_KEYS } from '@features/auth/constants/auth-query-keys.constants';
import { useAuthStore } from '@features/auth/stores/auth.store';

export const useLogout = () => {
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: logoutApi.logout,
    onSuccess: () => {
      // Remove all tokens using secure token storage
      tokenStorage.clear();

      // Clear auth store
      clearAuth();

      // Clear all auth queries
      queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.root });
    },
  });
};
