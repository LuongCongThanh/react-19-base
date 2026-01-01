import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { waitFor } from '@testing-library/react';

import { tokenStorage } from '@shared/lib/token-storage';
import { createAccessToken, createEntityId, createRefreshToken } from '@shared/types/common.types';

import { registerApi } from '@features/auth/api/register.api';
import { AUTH_QUERY_KEYS } from '@features/auth/constants/auth-query-keys.constants';
import { useAuthStore } from '@features/auth/stores/auth.store';
import { createTestQueryClient, renderHookWithQueryClient } from '@tests/test-utils';

import { useRegister } from '../useRegister';

// Mock dependencies
jest.mock('@features/auth/api/register.api', () => ({
  registerApi: {
    register: jest.fn(),
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

describe('useRegister', () => {
  const mockSetAuth = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as unknown as jest.Mock).mockReturnValue(mockSetAuth);
  });

  it('should call registerApi.register on mutate', async () => {
    const mockUser = {
      id: createEntityId('user-123'),
      email: 'newuser@example.com',
      name: 'New User',
      avatar: 'https://example.com/avatar.jpg',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockResponse = {
      token: createAccessToken('access-token-123'),
      refreshToken: createRefreshToken('refresh-token-123'),
      user: mockUser,
    };

    jest.mocked(registerApi.register).mockResolvedValue(mockResponse);

    const { result } = renderHookWithQueryClient(() => useRegister());

    result.current.mutate({
      email: 'newuser@example.com',
      password: 'password123',
      name: 'New User',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(registerApi.register).toHaveBeenCalled();
    const callArgs = jest.mocked(registerApi.register).mock.calls[0]?.[0];
    expect(callArgs).toEqual({
      email: 'newuser@example.com',
      password: 'password123',
      name: 'New User',
    });
    expect(result.current.data).toEqual(mockResponse);
  });

  it('should save token to storage on successful registration', async () => {
    const mockUser = {
      id: createEntityId('user-123'),
      email: 'newuser@example.com',
      name: 'New User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockResponse = {
      token: createAccessToken('access-token-123'),
      refreshToken: createRefreshToken('refresh-token-123'),
      user: mockUser,
    };

    jest.mocked(registerApi.register).mockResolvedValue(mockResponse);

    const { result } = renderHookWithQueryClient(() => useRegister());

    result.current.mutate({
      email: 'newuser@example.com',
      password: 'password123',
      name: 'New User',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(tokenStorage.setToken).toHaveBeenCalledWith('access-token-123');
    expect(tokenStorage.setRefreshToken).toHaveBeenCalledWith('refresh-token-123');
  });

  it('should update auth store on successful registration', async () => {
    const mockUser = {
      id: createEntityId('user-123'),
      email: 'newuser@example.com',
      name: 'New User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockResponse = {
      token: createAccessToken('access-token-123'),
      refreshToken: createRefreshToken('refresh-token-123'),
      user: mockUser,
    };

    jest.mocked(registerApi.register).mockResolvedValue(mockResponse);

    const { result } = renderHookWithQueryClient(() => useRegister());

    result.current.mutate({
      email: 'newuser@example.com',
      password: 'password123',
      name: 'New User',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockSetAuth).toHaveBeenCalledWith(mockUser, 'access-token-123');
  });

  it('should set query data for auth me on successful registration', async () => {
    const mockUser = {
      id: createEntityId('user-123'),
      email: 'newuser@example.com',
      name: 'New User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockResponse = {
      token: createAccessToken('access-token-123'),
      refreshToken: createRefreshToken('refresh-token-123'),
      user: mockUser,
    };

    jest.mocked(registerApi.register).mockResolvedValue(mockResponse);

    const queryClient = createTestQueryClient();

    const { result } = renderHookWithQueryClient(() => useRegister(), { queryClient });

    result.current.mutate({
      email: 'newuser@example.com',
      password: 'password123',
      name: 'New User',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const queryData = queryClient.getQueryData(AUTH_QUERY_KEYS.me());
    expect(queryData).toEqual(mockUser);
  });

  it('should handle registration error', async () => {
    const mockError = new Error('Email already exists');

    jest.mocked(registerApi.register).mockRejectedValue(mockError);

    const { result } = renderHookWithQueryClient(() => useRegister());

    result.current.mutate({
      email: 'existing@example.com',
      password: 'password123',
      name: 'Existing User',
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
    expect(tokenStorage.setToken).not.toHaveBeenCalled();
    expect(mockSetAuth).not.toHaveBeenCalled();
  });
});
