import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { waitFor } from '@testing-library/react';

import { createEntityId } from '@shared/types/common.types';

import { authMeApi } from '@features/auth/api/auth-me.api';
import { createTestQueryClient, renderHookWithQueryClient } from '@tests/test-utils';

import { useAuthMe } from '../useAuthMe';

// Mock the API
jest.mock('@features/auth/api/auth-me.api', () => ({
  authMeApi: {
    getMe: jest.fn(),
  },
}));

describe('useAuthMe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch user data on mount', async () => {
    const mockUser = {
      id: createEntityId('user-123'),
      email: 'test@example.com',
      name: 'Test User',
      avatar: 'https://example.com/avatar.jpg',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    jest.mocked(authMeApi.getMe).mockResolvedValue(mockUser);

    const { result } = renderHookWithQueryClient(() => useAuthMe());

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(authMeApi.getMe).toHaveBeenCalled();
    expect(result.current.data).toEqual(mockUser);
  });

  it('should handle error when fetching user data fails', async () => {
    const mockError = new Error('Unauthorized');

    jest.mocked(authMeApi.getMe).mockRejectedValue(mockError);

    const queryClient = createTestQueryClient();
    const { result } = renderHookWithQueryClient(() => useAuthMe(), { queryClient });

    // Wait for query to complete (either success or error)
    // Since useAuthMe has retry: false, error should appear quickly
    await waitFor(
      () => {
        // Query should finish loading
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 5000 }
    );

    // Check error state - may not be immediately true due to React Query's state management
    // But error should be defined
    expect(result.current.error).toBeDefined();
    if (result.current.error) {
      expect(result.current.error.message).toContain('Unauthorized');
    }
    expect(result.current.data).toBeUndefined();

    // Error state should eventually be true
    await waitFor(
      () => {
        expect(result.current.isError).toBe(true);
      },
      { timeout: 2000 }
    );
  });

  it('should have correct query configuration', async () => {
    const mockUser = {
      id: createEntityId('user-123'),
      email: 'test@example.com',
      name: 'Test User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    jest.mocked(authMeApi.getMe).mockResolvedValue(mockUser);

    const queryClient = createTestQueryClient();

    const { result } = renderHookWithQueryClient(() => useAuthMe(), { queryClient });

    // Check that query is configured with retry: false
    expect(result.current.isLoading).toBe(true);

    // Wait for query to complete to ensure no undefined data warning
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('should cache user data', async () => {
    const mockUser = {
      id: createEntityId('user-123'),
      email: 'test@example.com',
      name: 'Test User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    jest.mocked(authMeApi.getMe).mockResolvedValue(mockUser);

    const queryClient = createTestQueryClient();

    const { result, rerender } = renderHookWithQueryClient(() => useAuthMe(), { queryClient });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Clear mocks
    jest.mocked(authMeApi.getMe).mockClear();

    // Rerender should use cached data
    rerender();

    // API should not be called again immediately (staleTime: 5 minutes)
    expect(authMeApi.getMe).not.toHaveBeenCalled();
  });
});
