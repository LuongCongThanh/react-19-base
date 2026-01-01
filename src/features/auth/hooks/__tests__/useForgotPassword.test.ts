import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { waitFor } from '@testing-library/react';

import { forgotPasswordApi } from '@features/auth/api/forgot-password.api';
import { renderHookWithQueryClient } from '@tests/test-utils';

import { useForgotPassword } from '../useForgotPassword';

// Mock the API
jest.mock('@features/auth/api/forgot-password.api', () => ({
  forgotPasswordApi: {
    forgotPassword: jest.fn(),
  },
}));

describe('useForgotPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call forgotPasswordApi.forgotPassword on mutate', async () => {
    const mockResponse = {
      success: true,
      message: 'Password reset email sent',
    };

    jest.mocked(forgotPasswordApi.forgotPassword).mockResolvedValue(mockResponse);

    const { result } = renderHookWithQueryClient(() => useForgotPassword());

    result.current.mutate({ email: 'test@example.com' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(forgotPasswordApi.forgotPassword).toHaveBeenCalledWith({ email: 'test@example.com' }, expect.any(Object));
    expect(result.current.data).toEqual(mockResponse);
  });

  it('should handle errors correctly', async () => {
    const mockError = new Error('Email not found');

    jest.mocked(forgotPasswordApi.forgotPassword).mockRejectedValue(mockError);

    const { result } = renderHookWithQueryClient(() => useForgotPassword());

    result.current.mutate({ email: 'notfound@example.com' });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });
});
