import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { QueryClient } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';

import { fetchDashboardData } from '@features/dashboard/api/fetch-dashboard.api';
import { renderHookWithQueryClient } from '@tests/test-utils';

import { useDashboardData } from '../useDashboardData';

// Mock the API
jest.mock('@features/dashboard/api/fetch-dashboard.api', () => ({
  fetchDashboardData: jest.fn(),
}));

describe('useDashboardData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch dashboard data on mount', async () => {
    const mockData = [
      {
        id: '1' as any,
        title: 'Total Users',
        value: 1234,
        trend: 'up' as const,
        trendValue: 12,
      },
      {
        id: '2' as any,
        title: 'Revenue',
        value: 50000,
        trend: 'down' as const,
        trendValue: -5,
      },
    ];

    jest.mocked(fetchDashboardData).mockResolvedValue(mockData);

    const { result } = renderHookWithQueryClient(() => useDashboardData());

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(fetchDashboardData).toHaveBeenCalled();
    expect(result.current.data).toEqual(mockData);
  });

  it('should handle error when fetching dashboard data fails', async () => {
    const mockError = new Error('Failed to fetch dashboard data');

    // Create a fresh query client to avoid cached data from previous test
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    jest.mocked(fetchDashboardData).mockRejectedValue(mockError);

    const { result } = renderHookWithQueryClient(() => useDashboardData(), { queryClient });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Wait for error state
    await waitFor(
      () => {
        expect(result.current.isError).toBe(true);
      },
      { timeout: 5000 }
    );

    expect(result.current.error).toBeDefined();
    if (result.current.error) {
      expect(result.current.error.message).toContain('Failed to fetch dashboard data');
    }
  });
});
