import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { waitFor } from '@testing-library/react';

import { changePasswordApi } from '@features/auth/api/change-password.api';
import { renderHookWithQueryClient } from '@tests/test-utils';

import { useChangePassword } from '../useChangePassword';

// Mock the API
jest.mock('@features/auth/api/change-password.api', () => ({
  changePasswordApi: {
    changePassword: jest.fn(),
  },
}));

describe('useChangePassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call changePasswordApi.changePassword on mutate', async () => {
    const mockResponse = {
      success: true,
      message: 'Password changed successfully',
    };

    jest.mocked(changePasswordApi.changePassword).mockResolvedValue(mockResponse);

    const { result } = renderHookWithQueryClient(() => useChangePassword());

    result.current.mutate({
      currentPassword: 'oldPassword123',
      newPassword: 'newPassword123',
      confirmPassword: 'newPassword123',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(changePasswordApi.changePassword).toHaveBeenCalledWith(
      {
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword123',
        confirmPassword: 'newPassword123',
      },
      expect.any(Object)
    );
    expect(result.current.data).toEqual(mockResponse);
  });

  it('should handle incorrect current password error', async () => {
    const mockError = new Error('Current password is incorrect');

    jest.mocked(changePasswordApi.changePassword).mockRejectedValue(mockError);

    const { result } = renderHookWithQueryClient(() => useChangePassword());

    result.current.mutate({
      currentPassword: 'wrong-password',
      newPassword: 'newPassword123',
      confirmPassword: 'newPassword123',
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });
});
