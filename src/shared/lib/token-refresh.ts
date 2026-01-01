import { createAccessToken, createRefreshToken } from '@shared/types/common.types';

import { httpClient } from './axios.client';
import { logger } from './logger';
import { tokenStorage } from './token-storage';

/**
 * Token refresh API response
 */
interface RefreshTokenResponse {
  token: string;
  refreshToken?: string;
}

/**
 * JWT payload interface
 */
interface JWTPayload {
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

/**
 * Token refresh buffer time in milliseconds (5 minutes)
 * Tokens will be refreshed this amount of time before expiration
 */
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

/**
 * Decode JWT token to get payload
 * @param token - JWT token string
 * @returns Decoded JWT payload or null if invalid
 */
const decodeJWT = (token: string): JWTPayload | null => {
  try {
    const parts = token.split('.');
    // JWT must have exactly 3 parts: header.payload.signature
    if (parts.length !== 3) {
      return null;
    }

    const base64Url = parts[1];
    // Validate payload is not empty
    if (!base64Url || base64Url.length === 0) {
      return null;
    }

    // Convert base64url to base64
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    // Decode base64 to JSON string
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    // Parse JSON payload
    const payload = JSON.parse(jsonPayload);

    // Validate payload is an object
    if (typeof payload !== 'object' || payload === null) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};

/**
 * Refresh access token using refresh token
 *
 * @returns Promise resolving to new access token
 * @throws Error if refresh fails
 *
 * @example
 * ```tsx
 * try {
 *   const newToken = await refreshAccessToken();
 *   // Use new token
 * } catch (error) {
 *   // Handle refresh failure - redirect to login
 * }
 * ```
 */
export const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = tokenStorage.getRefreshToken();

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = (await httpClient.post('/auth/refresh', {
      refreshToken,
    })) as RefreshTokenResponse;

    // Update tokens
    const newAccessToken = createAccessToken(response.token);
    tokenStorage.setToken(newAccessToken);

    if (response.refreshToken) {
      const newRefreshToken = createRefreshToken(response.refreshToken);
      tokenStorage.setRefreshToken(newRefreshToken);
    }

    logger.info('Access token refreshed successfully');
    return newAccessToken;
  } catch (error) {
    logger.error('Failed to refresh access token', error as Error);
    // Clear tokens on refresh failure
    tokenStorage.clear();
    throw error;
  }
};

/**
 * Check if token is expired or should be refreshed
 * Decodes JWT and checks expiration time with a 5-minute buffer
 *
 * @param token - Access token to check
 * @returns true if token should be refreshed (expired or missing)
 */
export const shouldRefreshToken = (token: string | null): boolean => {
  if (!token) return true;

  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    // If we can't decode or no expiration, assume it needs refresh
    return true;
  }

  const expirationTime = payload.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();

  return currentTime >= expirationTime - TOKEN_REFRESH_BUFFER_MS;
};
