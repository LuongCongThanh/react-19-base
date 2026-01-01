import { describe, expect, it, jest } from '@jest/globals';

import { handleAppError } from '../error-handler';
import { logger } from '../logger';

// Mock logger
jest.mock('../logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('error-handler', () => {
  it('should call logger.error with error and errorInfo', () => {
    const error = new Error('Test error');
    const errorInfo = { componentStack: 'Component stack trace' };

    handleAppError(error, errorInfo);

    expect(logger.error).toHaveBeenCalledWith('Unhandled error in application', error, {
      componentStack: 'Component stack trace',
    });
  });
});
