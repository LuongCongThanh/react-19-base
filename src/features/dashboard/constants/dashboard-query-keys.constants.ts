// Query keys cho dashboard
export const DASHBOARD_QUERY_KEYS = {
  all: ['dashboard'] as const,
  list: () => [...DASHBOARD_QUERY_KEYS.all, 'list'] as const,
};
