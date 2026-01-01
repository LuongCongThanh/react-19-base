import { beforeEach, describe, expect, it } from '@jest/globals';

import { createTokenStorageInstance, tokenStorage } from '../token-storage';

describe('token-storage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should set and get token from sessionStorage by default', () => {
    tokenStorage.setToken('test-token-123');
    expect(tokenStorage.getToken()).toBe('test-token-123');
    expect(sessionStorage.getItem('token')).toBe('test-token-123');
  });

  it('should set and get refresh token', () => {
    tokenStorage.setRefreshToken('refresh-token-123');
    expect(tokenStorage.getRefreshToken()).toBe('refresh-token-123');
    expect(sessionStorage.getItem('refresh_token')).toBe('refresh-token-123');
  });

  it('should clear all tokens', () => {
    tokenStorage.setToken('test-token');
    tokenStorage.setRefreshToken('refresh-token');
    tokenStorage.clear();

    expect(tokenStorage.getToken()).toBeNull();
    expect(tokenStorage.getRefreshToken()).toBeNull();
  });

  it('should check if token exists', () => {
    expect(tokenStorage.hasToken()).toBe(false);

    tokenStorage.setToken('test-token');
    expect(tokenStorage.hasToken()).toBe(true);
  });

  it('should create localStorage instance', () => {
    const localStorageInstance = createTokenStorageInstance('localStorage');
    localStorageInstance.setToken('local-token');

    expect(localStorageInstance.getToken()).toBe('local-token');
    expect(localStorage.getItem('token')).toBe('local-token');
  });

  it('should throw error when setting invalid token', () => {
    expect(() => tokenStorage.setToken('')).toThrow('Token must be a non-empty string');
    expect(() => tokenStorage.setToken(null as any)).toThrow();
  });
});
