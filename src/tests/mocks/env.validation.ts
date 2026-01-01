/**
 * Mock environment variables for Jest tests
 * This file replaces @shared/lib/env.validation in tests
 * to avoid issues with import.meta.env
 */
export const env = {
  VITE_API_BASE_URL: 'http://localhost:3000/api',
  VITE_APP_NAME: 'React 19 Base',
  VITE_APP_VERSION: '1.0.0',
  VITE_USE_MOCK_API: true,
  VITE_ENABLE_ANALYTICS: false,
  VITE_ENABLE_ERROR_TRACKING: false,
  VITE_SENTRY_DSN: undefined,
} as const;

/**
 * Mock validateEnv function
 * Returns the mock env object without validation
 */
export const validateEnv = () => env;
