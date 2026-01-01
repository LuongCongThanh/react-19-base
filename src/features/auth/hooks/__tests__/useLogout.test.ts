import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { waitFor } from '@testing-library/react';

import { tokenStorage } from '@shared/lib/token-storage';

import { logoutApi } from '@features/auth/api/logout.api';
import { AUTH_QUERY_KEYS } from '@features/auth/constants/auth-query-keys.constants';
import { useAuthStore } from '@features/auth/stores/auth.store';
import { createTestQueryClient, renderHookWithQueryClient } from '@tests/test-utils';

import { useLogout } from '../useLogout';

// Mock dependencies
jest.mock('@features/auth/api/logout.api', () => ({
  logoutApi: {
    logout: jest.fn(),
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

describe('useLogout', () => {
  const mockClearAuth = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as unknown as jest.Mock).mockReturnValue(mockClearAuth);
  });

  it('should call logoutApi.logout on mutate', async () => {
    jest.mocked(logoutApi.logout).mockResolvedValue(undefined);

    const { result } = renderHookWithQueryClient(() => useLogout());

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(logoutApi.logout).toHaveBeenCalled();
  });

  it('should clear tokens from storage on successful logout', async () => {
    jest.mocked(logoutApi.logout).mockResolvedValue(undefined);

    const { result } = renderHookWithQueryClient(() => useLogout());

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(tokenStorage.clear).toHaveBeenCalled();
  });

  it('should clear auth store on successful logout', async () => {
    jest.mocked(logoutApi.logout).mockResolvedValue(undefined);

    const { result } = renderHookWithQueryClient(() => useLogout());

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockClearAuth).toHaveBeenCalled();
  });

  it('should clear all auth queries on successful logout', async () => {
    jest.mocked(logoutApi.logout).mockResolvedValue(undefined);

    const queryClient = createTestQueryClient();

    // Set some auth query data
    queryClient.setQueryData(AUTH_QUERY_KEYS.me(), { id: 'user-123', email: 'test@example.com' });

    const { result } = renderHookWithQueryClient(() => useLogout(), { queryClient });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Check that auth queries are removed
    const queryData = queryClient.getQueryData(AUTH_QUERY_KEYS.me());
    expect(queryData).toBeUndefined();
  });

  it('should handle logout error', async () => {
    const mockError = new Error('Logout failed');

    jest.mocked(logoutApi.logout).mockRejectedValue(mockError);

    const { result } = renderHookWithQueryClient(() => useLogout());

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
    expect(tokenStorage.clear).not.toHaveBeenCalled();
    expect(mockClearAuth).not.toHaveBeenCalled();
  });
});
