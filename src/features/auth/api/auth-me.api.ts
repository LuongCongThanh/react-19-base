import { httpClient } from '@shared/lib/axios.client';
import { env } from '@shared/lib/env.validation';
import { createEntityId } from '@shared/types/common.types';

import type { User } from '@features/auth/types/auth.types';

import { mockAuthMeApi } from './auth-me.api.mock';

interface UserApiResponse {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export const authMeApi = {
  async getMe(): Promise<User> {
    // Sử dụng mock API nếu chưa có backend
    if (env.VITE_USE_MOCK_API) {
      return mockAuthMeApi.getMe();
    }

    // httpClient interceptor returns response.data directly, not AxiosResponse
    const response = (await httpClient.get('/auth/me')) as UserApiResponse;

    // Convert plain string ID to branded type
    return {
      ...response,
      id: createEntityId(response.id),
    } as User;
  },
};
