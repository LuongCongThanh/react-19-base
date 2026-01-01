/**
 * Sentry configuration and initialization
 * This file handles Sentry setup based on environment variables
 */

import * as Sentry from '@sentry/react';

import { env } from './env.validation';
import { logger, setErrorTrackingService } from './logger';

const isDevelopment = import.meta.env.DEV;

/**
 * Initialize Sentry if error tracking is enabled and DSN is provided
 * Should be called during app initialization
 */
export const initializeSentry = (): void => {
  const isDev = isDevelopment;

  // Skip initialization in development or if error tracking is disabled
  if (isDev || !env.VITE_ENABLE_ERROR_TRACKING) {
    return;
  }

  // Skip if DSN is not provided
  if (!env.VITE_SENTRY_DSN) {
    logger.warn('Sentry DSN is not provided. Error tracking is disabled.');
    return;
  }

  try {
    Sentry.init({
      dsn: env.VITE_SENTRY_DSN,
      environment: isDev ? 'development' : 'production',
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      // Performance Monitoring
      tracesSampleRate: 1, // 100% of transactions
      // Session Replay
      replaysSessionSampleRate: 0.1, // 10% of sessions
      replaysOnErrorSampleRate: 1, // 100% of sessions with errors
    });

    // Integrate Sentry with logger
    setErrorTrackingService({
      captureException: (error: Error, context?: Record<string, unknown>) => {
        Sentry.captureException(error, {
          extra: context,
        });
      },
      captureMessage: (
        message: string,
        level?: 'error' | 'warn' | 'info' | 'debug',
        context?: Record<string, unknown>
      ) => {
        const severityMap: Record<string, Sentry.SeverityLevel> = {
          error: 'error',
          warn: 'warning',
          info: 'info',
          debug: 'debug',
        };
        Sentry.captureMessage(message, {
          level: severityMap[level || 'info'] || 'info',
          extra: context,
        });
      },
    });

    logger.info('Sentry initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Sentry', error as Error);
  }
};
