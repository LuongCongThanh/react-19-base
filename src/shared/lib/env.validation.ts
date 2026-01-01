import { z } from 'zod';

import { logger } from './logger';

/**
 * Environment variables schema
 */
const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url().optional().default('http://localhost:3000/api'),
  VITE_APP_NAME: z.string().optional().default('React 19 Base'),
  VITE_APP_VERSION: z.string().optional().default('1.0.0'),
  VITE_USE_MOCK_API: z
    .string()
    .optional()
    .transform((val) => val === 'true')
    .default('true'),
  VITE_ENABLE_ANALYTICS: z
    .string()
    .optional()
    .transform((val) => val === 'true')
    .default('false'),
  VITE_ENABLE_ERROR_TRACKING: z
    .string()
    .optional()
    .transform((val) => val === 'true')
    .default('false'),
  VITE_SENTRY_DSN: z.string().url().optional(),
});

type Env = z.infer<typeof envSchema>;

/**
 * Format Zod validation errors into a readable message
 * @param error - Zod error object
 * @returns Formatted error message
 */
const formatValidationErrors = (error: z.ZodError): string => {
  const errors = error.errors
    .map((e) => {
      const path = e.path.length > 0 ? e.path.join('.') : 'root';
      return `${path}: ${e.message}`;
    })
    .join(', ');
  return `Environment validation failed: ${errors}`;
};

/**
 * Validate environment variables
 * Throws error if validation fails with detailed error messages
 *
 * @returns Validated environment variables
 * @throws Error if validation fails
 */
export const validateEnv = (): Env => {
  try {
    return envSchema.parse({
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
      VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
      VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION,
      VITE_USE_MOCK_API: import.meta.env.VITE_USE_MOCK_API,
      VITE_ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS,
      VITE_ENABLE_ERROR_TRACKING: import.meta.env.VITE_ENABLE_ERROR_TRACKING,
      VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = formatValidationErrors(error);
      logger.error(message, error);
      throw new Error(message);
    }
    logger.error('Environment variables validation failed', error as Error);
    throw new Error('Invalid environment variables configuration');
  }
};

/**
 * Validated environment variables
 * Use this instead of import.meta.env directly
 */
export const env = validateEnv();
