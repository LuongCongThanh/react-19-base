import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { waitFor } from '@testing-library/react';

import { tokenStorage } from '@shared/lib/token-storage';
import { createAccessToken, createEntityId, createRefreshToken } from '@shared/types/common.types';

import { loginApi } from '@features/auth/api/login.api';
import { AUTH_QUERY_KEYS } from '@features/auth/constants/auth-query-keys.constants';
import { useAuthStore } from '@features/auth/stores/auth.store';
import { createTestQueryClient, renderHookWithQueryClient } from '@tests/test-utils';

import { useLogin } from '../useLogin';

// Mock dependencies
jest.mock('@features/auth/api/login.api', () => ({
  loginApi: {
    login: jest.fn(),
  },
}));

jest.mock('@shared/lib/token-storage', () => ({
  tokenStorage: {
    setToken: jest.fn(),
    setRefreshToken: jest.fn(),
    clear: jest.fn(),
    getToken: jest.fn(),
    getRefreshToken: jest.fn(),
    hasToken: jest.fn(),
  },
}));

jest.mock('@features/auth/stores/auth.store', () => ({
  useAuthStore: jest.fn(),
}));

describe('useLogin', () => {
  const mockSetAuth = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as unknown as jest.Mock).mockReturnValue(mockSetAuth);
  });

  it('should call loginApi.login on mutate', async () => {
    const mockUser = {
      id: createEntityId('user-123'),
      email: 'test@example.com',
      name: 'Test User',
      avatar: 'https://example.com/avatar.jpg',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockResponse = {
      token: createAccessToken('access-token-123'),
      refreshToken: createRefreshToken('refresh-token-123'),
      user: mockUser,
    };

    jest.mocked(loginApi.login).mockResolvedValue(mockResponse);

    const { result } = renderHookWithQueryClient(() => useLogin());

    result.current.mutate({
      email: 'test@example.com',
      password: 'password123',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(loginApi.login).toHaveBeenCalled();
    const callArgs = jest.mocked(loginApi.login).mock.calls[0]?.[0];
    expect(callArgs).toEqual({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.current.data).toEqual(mockResponse);
  });

  it('should save token to storage on successful login', async () => {
    const mockUser = {
      id: createEntityId('user-123'),
      email: 'test@example.com',
      name: 'Test User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockResponse = {
      token: createAccessToken('access-token-123'),
      refreshToken: createRefreshToken('refresh-token-123'),
      user: mockUser,
    };

    jest.mocked(loginApi.login).mockResolvedValue(mockResponse);

    const { result } = renderHookWithQueryClient(() => useLogin());

    result.current.mutate({
      email: 'test@example.com',
      password: 'password123',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(tokenStorage.setToken).toHaveBeenCalledWith('access-token-123');
    expect(tokenStorage.setRefreshToken).toHaveBeenCalledWith('refresh-token-123');
  });

  it('should update auth store on successful login', async () => {
    const mockUser = {
      id: createEntityId('user-123'),
      email: 'test@example.com',
      name: 'Test User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockResponse = {
      token: createAccessToken('access-token-123'),
      refreshToken: createRefreshToken('refresh-token-123'),
      user: mockUser,
    };

    jest.mocked(loginApi.login).mockResolvedValue(mockResponse);

    const { result } = renderHookWithQueryClient(() => useLogin());

    result.current.mutate({
      email: 'test@example.com',
      password: 'password123',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockSetAuth).toHaveBeenCalledWith(mockUser, 'access-token-123');
  });

  it('should set query data for auth me on successful login', async () => {
    const mockUser = {
      id: createEntityId('user-123'),
      email: 'test@example.com',
      name: 'Test User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockResponse = {
      token: createAccessToken('access-token-123'),
      refreshToken: createRefreshToken('refresh-token-123'),
      user: mockUser,
    };

    jest.mocked(loginApi.login).mockResolvedValue(mockResponse);

    const queryClient = createTestQueryClient();

    const { result } = renderHookWithQueryClient(() => useLogin(), { queryClient });

    result.current.mutate({
      email: 'test@example.com',
      password: 'password123',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const queryData = queryClient.getQueryData(AUTH_QUERY_KEYS.me());
    expect(queryData).toEqual(mockUser);
  });

  it('should handle login error', async () => {
    const mockError = new Error('Invalid credentials');

    jest.mocked(loginApi.login).mockRejectedValue(mockError);

    const { result } = renderHookWithQueryClient(() => useLogin());

    result.current.mutate({
      email: 'test@example.com',
      password: 'wrong-password',
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
    expect(tokenStorage.setToken).not.toHaveBeenCalled();
    expect(mockSetAuth).not.toHaveBeenCalled();
  });

  it('should not save refresh token if not provided', async () => {
    const mockUser = {
      id: createEntityId('user-123'),
      email: 'test@example.com',
      name: 'Test User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockResponse = {
      token: createAccessToken('access-token-123'),
      user: mockUser,
    };

    jest.mocked(loginApi.login).mockResolvedValue(mockResponse);

    const { result } = renderHookWithQueryClient(() => useLogin());

    result.current.mutate({
      email: 'test@example.com',
      password: 'password123',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(tokenStorage.setToken).toHaveBeenCalledWith('access-token-123');
    expect(tokenStorage.setRefreshToken).not.toHaveBeenCalled();
  });
});
