import type { VerifyPasswordRequest, VerifyPasswordResponse } from '@features/auth/types/auth.types';

/**
 * Mock implementation of verify password API
 * Simulates verifying password for sensitive actions
 */
export const mockVerifyPasswordApi = {
  async verifyPassword(payload: VerifyPasswordRequest): Promise<VerifyPasswordResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulate password validation
    if (payload.password === 'wrong-password') {
      throw new Error('Password is incorrect');
    }

    // Generate mock session token (valid for 5 minutes)
    const sessionToken = `session-token-${Date.now()}`;

    console.log(`[MOCK] Password verified. Session token: ${sessionToken}`);

    return {
      success: true,
      verified: true,
      sessionToken,
      expiresIn: 300, // 5 minutes
    };
  },
};
