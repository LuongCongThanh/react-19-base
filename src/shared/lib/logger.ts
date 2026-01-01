/**
 * Logger utility for consistent error logging across the application
 * Integrated with Sentry for error tracking in production
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  error?: Error;
  context?: Record<string, unknown>;
  timestamp: string;
}

interface ErrorTrackingService {
  captureException: (error: Error, context?: Record<string, unknown>) => void;
  captureMessage?: (message: string, level?: LogLevel, context?: Record<string, unknown>) => void;
}

// Module-level state
const isDevelopment = import.meta.env.DEV;
let errorTrackingService: ErrorTrackingService | null = null;

/**
 * Create a log entry object
 */
const createLogEntry = (
  level: LogLevel,
  message: string,
  error?: Error,
  context?: Record<string, unknown>
): LogEntry => {
  return {
    level,
    message,
    error,
    context,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Core logging function
 */
const log = (level: LogLevel, message: string, error?: Error, context?: Record<string, unknown>): void => {
  const entry = createLogEntry(level, message, error, context);

  // In development, log to console
  if (isDevelopment) {
    const consoleMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    consoleMethod(`[${level.toUpperCase()}] ${message}`, {
      error,
      context,
      timestamp: entry.timestamp,
    });
  }

  // In production, send to error tracking service
  if (!isDevelopment && errorTrackingService) {
    if (level === 'error' && error) {
      errorTrackingService.captureException(error, context);
    } else if (level === 'warn' && errorTrackingService.captureMessage) {
      errorTrackingService.captureMessage(message, level, context);
    }
  }
};

/**
 * Log an error message
 * @param message - Error message
 * @param error - Optional Error object
 * @param context - Optional context data
 */
export const logError = (message: string, error?: Error, context?: Record<string, unknown>): void => {
  log('error', message, error, context);
};

/**
 * Log a warning message
 * @param message - Warning message
 * @param context - Optional context data
 */
export const logWarn = (message: string, context?: Record<string, unknown>): void => {
  log('warn', message, undefined, context);
};

/**
 * Log an info message
 * @param message - Info message
 * @param context - Optional context data
 */
export const logInfo = (message: string, context?: Record<string, unknown>): void => {
  log('info', message, undefined, context);
};

/**
 * Log a debug message
 * @param message - Debug message
 * @param context - Optional context data
 */
export const logDebug = (message: string, context?: Record<string, unknown>): void => {
  log('debug', message, undefined, context);
};

/**
 * Set error tracking service (e.g., Sentry)
 * This allows custom error tracking services to be used
 * Should be called during app initialization if error tracking is enabled
 * @param service - Error tracking service instance
 *
 * @example
 * ```tsx
 * import { setErrorTrackingService } from '@shared/lib/logger';
 * import * as Sentry from '@sentry/react';
 *
 * // After Sentry.init()
 * setErrorTrackingService({
 *   captureException: (error, context) => Sentry.captureException(error, { extra: context }),
 *   captureMessage: (message, level, context) => Sentry.captureMessage(message, { level, extra: context }),
 * });
 * ```
 */
export const setErrorTrackingService = (service: ErrorTrackingService | null): void => {
  errorTrackingService = service;
};

/**
 * Get current error tracking service
 */
export const getErrorTrackingService = (): ErrorTrackingService | null => {
  return errorTrackingService;
};

// Export default logger object for backward compatibility
export const logger = {
  error: logError,
  warn: logWarn,
  info: logInfo,
  debug: logDebug,
};
