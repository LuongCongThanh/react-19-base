import { useQuery } from '@tanstack/react-query';

import { authMeApi } from '@features/auth/api/auth-me.api';
import { AUTH_QUERY_KEYS } from '@features/auth/constants/auth-query-keys.constants';

export const useAuthMe = () => {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.me(),
    queryFn: authMeApi.getMe,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
};
