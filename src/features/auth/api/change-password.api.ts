import { httpClient } from '@shared/lib/axios.client';
import { env } from '@shared/lib/env.validation';

import type { ChangePasswordRequest, ChangePasswordResponse } from '@features/auth/types/auth.types';

import { mockChangePasswordApi } from './change-password.api.mock';

export const changePasswordApi = {
  async changePassword(payload: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    // Sử dụng mock API nếu chưa có backend
    if (env.VITE_USE_MOCK_API) {
      return mockChangePasswordApi.changePassword(payload);
    }

    // httpClient interceptor returns response.data directly, not AxiosResponse
    const response = (await httpClient.post('/auth/change-password', payload)) as ChangePasswordResponse;

    return response;
  },
};
