import { httpClient } from '@shared/lib/axios.client';
import { env } from '@shared/lib/env.validation';

import type { ForgotPasswordRequest, ForgotPasswordResponse } from '@features/auth/types/auth.types';

import { mockForgotPasswordApi } from './forgot-password.api.mock';

export const forgotPasswordApi = {
  async forgotPassword(payload: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    // Sử dụng mock API nếu chưa có backend
    if (env.VITE_USE_MOCK_API) {
      return mockForgotPasswordApi.forgotPassword(payload);
    }

    // httpClient interceptor returns response.data directly, not AxiosResponse
    const response = (await httpClient.post('/auth/forgot-password', payload)) as ForgotPasswordResponse;

    return response;
  },
};
