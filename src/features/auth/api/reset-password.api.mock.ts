import type { ResetPasswordRequest, ResetPasswordResponse } from '@features/auth/types/auth.types';

/**
 * Mock implementation of reset password API
 * Simulates resetting password with token
 */
export const mockResetPasswordApi = {
  async resetPassword(payload: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate token validation
    if (!payload.token || payload.token === 'invalid-token') {
      const error = new Error('Invalid or expired reset token') as Error & { code?: string };
      error.code = 'INVALID_TOKEN';
      throw error;
    }

    // Simulate expired token
    if (payload.token.includes('expired')) {
      const error = new Error('Reset token has expired. Please request a new one.') as Error & { code?: string };
      error.code = 'TOKEN_EXPIRED';
      throw error;
    }

    // In real implementation, this would update the password
    console.log(`[MOCK] Password reset for token: ${payload.token}`);
    console.log(`[MOCK] New password: ${payload.password}`);

    return {
      success: true,
      message: 'Password reset successfully',
    };
  },
};
