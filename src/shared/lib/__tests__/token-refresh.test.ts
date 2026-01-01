import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { refreshAccessToken, shouldRefreshToken } from '../token-refresh';
import { tokenStorage } from '../token-storage';

// Mock dependencies
jest.mock('../token-storage', () => ({
  tokenStorage: {
    getRefreshToken: jest.fn(),
    setToken: jest.fn(),
    setRefreshToken: jest.fn(),
    clear: jest.fn(),
  },
}));

jest.mock('../axios.client', () => ({
  httpClient: {
    post: jest.fn(),
  },
}));

jest.mock('../logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('token-refresh', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw error when no refresh token', async () => {
    jest.mocked(tokenStorage.getRefreshToken).mockReturnValue(null);

    await expect(refreshAccessToken()).rejects.toThrow('No refresh token available');
  });

  it('should check if token should be refreshed', () => {
    expect(shouldRefreshToken(null)).toBe(true);
    expect(shouldRefreshToken('')).toBe(true);

    // Token without expiration
    expect(shouldRefreshToken('invalid.token.here')).toBe(true);
  });
});
