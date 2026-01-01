import { httpClient } from '@shared/lib/axios.client';
import { env } from '@shared/lib/env.validation';
import { createAccessToken, createEntityId, createRefreshToken } from '@shared/types/common.types';

import type { LoginRequest, LoginResponse, User } from '@features/auth/types/auth.types';

import { mockLoginApi } from './login.api.mock';

interface LoginApiResponse {
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    createdAt: string;
    updatedAt: string;
  };
}

export const loginApi = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    // Sử dụng mock API nếu chưa có backend
    if (env.VITE_USE_MOCK_API) {
      return mockLoginApi.login(payload);
    }

    // httpClient interceptor returns response.data directly, not AxiosResponse
    const response = (await httpClient.post('/auth/login', payload)) as LoginApiResponse;

    // Convert plain strings to branded types
    return {
      token: createAccessToken(response.token),
      refreshToken: response.refreshToken ? createRefreshToken(response.refreshToken) : undefined,
      user: {
        ...response.user,
        id: createEntityId(response.user.id),
      } as User,
    };
  },
};
