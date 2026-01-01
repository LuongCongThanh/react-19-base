import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { waitFor } from '@testing-library/react';

import { resetPasswordApi } from '@features/auth/api/reset-password.api';
import { renderHookWithQueryClient } from '@tests/test-utils';

import { useResetPassword } from '../useResetPassword';

// Mock the API
jest.mock('@features/auth/api/reset-password.api', () => ({
  resetPasswordApi: {
    resetPassword: jest.fn(),
  },
}));

describe('useResetPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call resetPasswordApi.resetPassword on mutate', async () => {
    const mockResponse = {
      success: true,
      message: 'Password reset successfully',
    };

    jest.mocked(resetPasswordApi.resetPassword).mockResolvedValue(mockResponse);

    const { result } = renderHookWithQueryClient(() => useResetPassword());

    result.current.mutate({
      token: 'valid-token',
      password: 'newPassword123',
      confirmPassword: 'newPassword123',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(resetPasswordApi.resetPassword).toHaveBeenCalledWith(
      {
        token: 'valid-token',
        password: 'newPassword123',
        confirmPassword: 'newPassword123',
      },
      expect.any(Object)
    );
    expect(result.current.data).toEqual(mockResponse);
  });

  it('should handle invalid token error', async () => {
    const mockError = new Error('Invalid or expired reset token');

    jest.mocked(resetPasswordApi.resetPassword).mockRejectedValue(mockError);

    const { result } = renderHookWithQueryClient(() => useResetPassword());

    result.current.mutate({
      token: 'invalid-token',
      password: 'newPassword123',
      confirmPassword: 'newPassword123',
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });
});
