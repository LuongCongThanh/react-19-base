import { useQuery } from '@tanstack/react-query';

import { fetchDashboardData } from '@features/dashboard/api/fetch-dashboard.api';
import { DASHBOARD_QUERY_KEYS } from '@features/dashboard/constants/dashboard-query-keys.constants';

/**
 * Hook to fetch dashboard data
 *
 * @returns Query object with dashboard data, loading, and error states
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useDashboardData();
 *
 * if (isLoading) return <Loading />;
 * if (error) return <Error message={error.message} />;
 *
 * return <DashboardCards data={data} />;
 * ```
 */
export const useDashboardData = () => {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.list(),
    queryFn: fetchDashboardData,
  });
};
