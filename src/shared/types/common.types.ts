/**
 * Common utility types and branded types for better type safety
 */

/**
 * Branded type for entity IDs
 * Prevents accidentally mixing different ID types
 */
export type EntityId = string & { readonly __brand: 'EntityId' };

/**
 * Branded type for access tokens
 */
export type AccessToken = string & { readonly __brand: 'AccessToken' };

/**
 * Branded type for refresh tokens
 */
export type RefreshToken = string & { readonly __brand: 'RefreshToken' };

/**
 * Helper to create EntityId from string
 */
export function createEntityId(id: string): EntityId {
  return id as EntityId;
}

/**
 * Helper to create AccessToken from string
 */
export function createAccessToken(token: string): AccessToken {
  return token as AccessToken;
}

/**
 * Helper to create RefreshToken from string
 */
export function createRefreshToken(token: string): RefreshToken {
  return token as RefreshToken;
}

/**
 * Utility type to make all properties optional recursively
 */
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

/**
 * Utility type to make all properties required recursively
 */
export type DeepRequired<T> = T extends object
  ? {
      [P in keyof T]-?: DeepRequired<T[P]>;
    }
  : T;

/**
 * Utility type to extract the value type from an object
 */
export type ValueOf<T> = T[keyof T];

/**
 * Utility type for API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

/**
 * Utility type for paginated API response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Utility type for error response
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}
