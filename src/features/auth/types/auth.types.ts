import type { EntityId, AccessToken, RefreshToken } from '@shared/types/common.types';

/**
 * Auth Types
 */

// Request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// Response types
export interface LoginResponse {
  token: AccessToken;
  refreshToken?: RefreshToken;
  user: User;
}

export interface RegisterResponse {
  token: AccessToken;
  refreshToken?: RefreshToken;
  user: User;
}

// Entity types
export interface User {
  id: EntityId;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// State types
export interface AuthState {
  user: User | null;
  token: AccessToken | null;
  isAuthenticated: boolean;
}

// Password reset types
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface VerifyPasswordRequest {
  password: string;
}

export interface VerifyPasswordResponse {
  success: boolean;
  verified: boolean;
  sessionToken?: string;
  expiresIn?: number;
}

// Other types
export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
