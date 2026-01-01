import { httpClient } from '@shared/lib/axios.client';
import { env } from '@shared/lib/env.validation';

import type { ResetPasswordRequest, ResetPasswordResponse } from '@features/auth/types/auth.types';

import { mockResetPasswordApi } from './reset-password.api.mock';

export const resetPasswordApi = {
  async resetPassword(payload: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    // Sử dụng mock API nếu chưa có backend
    if (env.VITE_USE_MOCK_API) {
      return mockResetPasswordApi.resetPassword(payload);
    }

    // httpClient interceptor returns response.data directly, not AxiosResponse
    const response = (await httpClient.post('/auth/reset-password', payload)) as ResetPasswordResponse;

    return response;
  },
};
