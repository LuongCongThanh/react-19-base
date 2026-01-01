import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { waitFor } from '@testing-library/react';

import { verifyPasswordApi } from '@features/auth/api/verify-password.api';
import { renderHookWithQueryClient } from '@tests/test-utils';

import { useVerifyPassword } from '../useVerifyPassword';

// Mock the API
jest.mock('@features/auth/api/verify-password.api', () => ({
  verifyPasswordApi: {
    verifyPassword: jest.fn(),
  },
}));

describe('useVerifyPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call verifyPasswordApi.verifyPassword on mutate', async () => {
    const mockResponse = {
      success: true,
      verified: true,
      sessionToken: 'session-token-123',
      expiresIn: 300,
    };

    jest.mocked(verifyPasswordApi.verifyPassword).mockResolvedValue(mockResponse);

    const { result } = renderHookWithQueryClient(() => useVerifyPassword());

    result.current.mutate({ password: 'correctPassword' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(verifyPasswordApi.verifyPassword).toHaveBeenCalledWith({ password: 'correctPassword' }, expect.any(Object));
    expect(result.current.data).toEqual(mockResponse);
  });

  it('should handle incorrect password error', async () => {
    const mockError = new Error('Password is incorrect');

    jest.mocked(verifyPasswordApi.verifyPassword).mockRejectedValue(mockError);

    const { result } = renderHookWithQueryClient(() => useVerifyPassword());

    result.current.mutate({ password: 'wrong-password' });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });
});
