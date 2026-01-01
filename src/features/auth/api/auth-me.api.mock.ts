import { createEntityId } from '@shared/types/common.types';

import type { User } from '@features/auth/types/auth.types';

/**
 * Mock auth-me API - Simulate getting current user
 * Trả về thông tin user giả lập
 */
export const mockAuthMeApi = {
  async getMe(): Promise<User> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockUserId = 'user-mock-' + Date.now();

    return {
      id: createEntityId(mockUserId),
      email: 'admin@example.com',
      name: 'Admin User',
      avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=random',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
};
