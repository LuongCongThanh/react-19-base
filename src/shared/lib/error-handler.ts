import { logger } from './logger';

export const handleAppError = (error: Error, errorInfo: { componentStack: string }) => {
  logger.error('Unhandled error in application', error, {
    componentStack: errorInfo.componentStack,
  });
};
