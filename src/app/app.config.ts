import { env } from '@shared/lib/env.validation';

export const appConfig = {
  name: env.VITE_APP_NAME,
  version: env.VITE_APP_VERSION,
  apiBaseUrl: env.VITE_API_BASE_URL,
  features: {
    enableAnalytics: env.VITE_ENABLE_ANALYTICS,
    enableErrorTracking: env.VITE_ENABLE_ERROR_TRACKING,
  },
} as const;
