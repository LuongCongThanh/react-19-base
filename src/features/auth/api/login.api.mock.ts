import { createAccessToken, createEntityId, createRefreshToken } from '@shared/types/common.types';

import type { LoginRequest, LoginResponse } from '@features/auth/types/auth.types';

/**
 * Mock credentials for development
 * Sử dụng khi chưa có backend API
 */
export const MOCK_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'admin123',
};

/**
 * Mock login API - Simulate backend login
 * Trả về mock data nếu credentials đúng
 */
export const mockLoginApi = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Validate credentials
    if (payload.email === MOCK_CREDENTIALS.email && payload.password === MOCK_CREDENTIALS.password) {
      const mockToken = 'mock-access-token-' + Date.now();
      const mockRefreshToken = 'mock-refresh-token-' + Date.now();
      const mockUserId = 'user-' + Date.now();

      return {
        token: createAccessToken(mockToken),
        refreshToken: createRefreshToken(mockRefreshToken),
        user: {
          id: createEntityId(mockUserId),
          email: payload.email,
          name: 'Admin User',
          avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=random',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    }

    // Simulate error response
    throw new Error('Email hoặc mật khẩu không đúng');
  },
};
