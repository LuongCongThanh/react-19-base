import { httpClient } from '@shared/lib/axios.client';
import { env } from '@shared/lib/env.validation';
import { createAccessToken, createEntityId, createRefreshToken } from '@shared/types/common.types';

import type { RegisterRequest, RegisterResponse, User } from '@features/auth/types/auth.types';

interface RegisterApiResponse {
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

export const registerApi = {
  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    // Sử dụng mock API nếu chưa có backend
    if (env.VITE_USE_MOCK_API) {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockToken = 'mock-access-token-' + Date.now();
      const mockRefreshToken = 'mock-refresh-token-' + Date.now();
      const mockUserId = 'user-' + Date.now();

      return {
        token: createAccessToken(mockToken),
        refreshToken: createRefreshToken(mockRefreshToken),
        user: {
          id: createEntityId(mockUserId),
          email: payload.email,
          name: payload.name,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(payload.name)}&background=random`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    }

    // httpClient interceptor returns response.data directly, not AxiosResponse
    const response = (await httpClient.post('/auth/register', payload)) as RegisterApiResponse;

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
