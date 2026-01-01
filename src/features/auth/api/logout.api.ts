import { httpClient } from '@shared/lib/axios.client';
import { env } from '@shared/lib/env.validation';

export const logoutApi = {
  async logout(): Promise<void> {
    // Nếu dùng mock API, chỉ cần delay mô phỏng
    if (env.VITE_USE_MOCK_API) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return;
    }

    return httpClient.post('/auth/logout');
  },
};
