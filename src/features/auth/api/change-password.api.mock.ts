import type { ChangePasswordRequest, ChangePasswordResponse } from '@features/auth/types/auth.types';

/**
 * Mock implementation of change password API
 * Simulates changing password when user is logged in
 */
export const mockChangePasswordApi = {
  async changePassword(payload: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate current password validation
    if (payload.currentPassword === 'wrong-password') {
      throw new Error('Current password is incorrect');
    }

    // In real implementation, this would update the password
    console.log(`[MOCK] Password changed successfully`);

    return {
      success: true,
      message: 'Password changed successfully',
    };
  },
};
