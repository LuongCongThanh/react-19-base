/**
 * Auth Query Keys
 */

export const AUTH_QUERY_KEYS = {
  root: ['auth'] as const,

  me: () => [...AUTH_QUERY_KEYS.root, 'me'] as const,

  sessions: () => [...AUTH_QUERY_KEYS.root, 'sessions'] as const,
};
