import { httpClient } from '@shared/lib/axios.client';
import { env } from '@shared/lib/env.validation';

import type { VerifyPasswordRequest, VerifyPasswordResponse } from '@features/auth/types/auth.types';

import { mockVerifyPasswordApi } from './verify-password.api.mock';

export const verifyPasswordApi = {
  async verifyPassword(payload: VerifyPasswordRequest): Promise<VerifyPasswordResponse> {
    // Sử dụng mock API nếu chưa có backend
    if (env.VITE_USE_MOCK_API) {
      return mockVerifyPasswordApi.verifyPassword(payload);
    }

    // httpClient interceptor returns response.data directly, not AxiosResponse
    const response = (await httpClient.post('/auth/verify-password', payload)) as VerifyPasswordResponse;

    return response;
  },
};
