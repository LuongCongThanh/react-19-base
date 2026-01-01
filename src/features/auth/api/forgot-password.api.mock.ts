import type { ForgotPasswordRequest, ForgotPasswordResponse } from '@features/auth/types/auth.types';

/**
 * Mock implementation of forgot password API
 * Simulates sending password reset email
 */
export const mockForgotPasswordApi = {
  async forgotPassword(payload: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate email validation
    if (!payload.email || !payload.email.includes('@')) {
      throw new Error('Invalid email address');
    }

    // In real implementation, this would send an email
    // For mock, we just return success
    console.log(`[MOCK] Password reset email would be sent to: ${payload.email}`);
    console.log(`[MOCK] Reset link: /auth/reset-password?token=mock-reset-token-${Date.now()}`);

    return {
      success: true,
      message: 'Password reset email sent successfully',
    };
  },
};
