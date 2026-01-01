/**
 * Test data factories for creating mock data
 */

import { createEntityId, createAccessToken, createRefreshToken } from '@shared/types/common.types';

import type {
  User,
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from '@features/auth/types/auth.types';
import type { DashboardData } from '@features/dashboard/types/dashboard.types';

/**
 * Create a mock user with default or custom values
 */
export const createMockUser = (overrides?: Partial<User>): User => {
  const now = new Date().toISOString();
  return {
    id: createEntityId('1'),
    email: 'test@example.com',
    name: 'Test User',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

/**
 * Create multiple mock users
 */
export const createMockUsers = (count: number, overrides?: Partial<User>): User[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockUser({
      id: createEntityId(String(index + 1)),
      email: `user${index + 1}@example.com`,
      name: `User ${index + 1}`,
      ...overrides,
    })
  );
};

/**
 * Create a mock login request
 */
export const createMockLoginRequest = (overrides?: Partial<LoginRequest>): LoginRequest => {
  return {
    email: 'test@example.com',
    password: 'password123',
    ...overrides,
  };
};

/**
 * Create a mock register request
 */
export const createMockRegisterRequest = (overrides?: Partial<RegisterRequest>): RegisterRequest => {
  return {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
    ...overrides,
  };
};

/**
 * Create a mock login response
 */
export const createMockLoginResponse = (overrides?: Partial<LoginResponse>): LoginResponse => {
  const user = createMockUser(overrides?.user);
  return {
    token: createAccessToken('mock-access-token'),
    refreshToken: createRefreshToken('mock-refresh-token'),
    user,
    ...overrides,
  };
};

/**
 * Create a mock register response
 */
export const createMockRegisterResponse = (overrides?: Partial<RegisterResponse>): RegisterResponse => {
  const user = createMockUser(overrides?.user);
  return {
    token: createAccessToken('mock-access-token'),
    refreshToken: createRefreshToken('mock-refresh-token'),
    user,
    ...overrides,
  };
};

/**
 * Create a mock forgot password request
 */
export const createMockForgotPasswordRequest = (overrides?: Partial<ForgotPasswordRequest>): ForgotPasswordRequest => {
  return {
    email: 'test@example.com',
    ...overrides,
  };
};

/**
 * Create a mock reset password request
 */
export const createMockResetPasswordRequest = (overrides?: Partial<ResetPasswordRequest>): ResetPasswordRequest => {
  return {
    token: 'reset-token-123',
    password: 'newPassword123',
    confirmPassword: 'newPassword123',
    ...overrides,
  };
};

/**
 * Create a mock change password request
 */
export const createMockChangePasswordRequest = (overrides?: Partial<ChangePasswordRequest>): ChangePasswordRequest => {
  return {
    currentPassword: 'oldPassword123',
    newPassword: 'newPassword123',
    confirmPassword: 'newPassword123',
    ...overrides,
  };
};

/**
 * Create a mock dashboard data
 */
export const createMockDashboardData = (overrides?: Partial<DashboardData>): DashboardData => {
  return {
    id: createEntityId('1'),
    title: 'Test Dashboard',
    value: 100,
    description: 'Test description',
    trend: 'up',
    trendValue: 10,
    ...overrides,
  };
};

/**
 * Create multiple mock dashboard data items
 */
export const createMockDashboardDataList = (count: number, overrides?: Partial<DashboardData>): DashboardData[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockDashboardData({
      id: createEntityId(String(index + 1)),
      title: `Dashboard ${index + 1}`,
      value: randomNumber(0, 1000),
      ...overrides,
    })
  );
};

/**
 * Generate a random string for testing
 */
export const randomString = (length = 10): string => {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
};

/**
 * Generate a random email for testing
 */
export const randomEmail = (): string => {
  return `${randomString()}@example.com`;
};

/**
 * Generate a random number within range
 */
export const randomNumber = (min = 0, max = 100): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Delay for testing async operations
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
