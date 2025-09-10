// src/types/auth.ts

// ===== USER TYPES =====

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  isEmailVerified: boolean;
  isMfaEnabled: boolean;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    bio?: string;
    phone?: string;
    dateOfBirth?: Date;
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    privacy: {
      profileVisibility: 'public' | 'private' | 'friends';
      showEmail: boolean;
      showPhone: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

// ===== AUTH STATE =====

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  session: SessionInfo | null;
  tokens: AuthTokens | null;
  permissions: string[];
  featureFlags: string[];
  securityContext: SecurityContext | null;
  isMfaRequired: boolean;
  mfaChallenge: MfaChallenge | null;
  loginForm: LoginFormState;
  registerForm: RegisterFormState;
  forgotPasswordForm: ForgotPasswordFormState;
  resetPasswordForm: ResetPasswordFormState;
}

// ===== SESSION TYPES =====

export interface SessionInfo {
  id: string;
  userId: string;
  deviceId: string;
  ipAddress: string;
  userAgent: string;
  location?: {
    country: string;
    city: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  isActive: boolean;
  createdAt: Date;
  expiresAt: Date;
  lastActivityAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  scope: string[];
}

// ===== SECURITY TYPES =====

export interface SecurityContext {
  deviceId: string;
  deviceFingerprint: string;
  ipAddress: string;
  userAgent: string;
  location?: {
    country: string;
    city: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  isTrustedDevice: boolean;
  lastSecurityCheck: Date;
  securityScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'password_change' | 'mfa_enabled' | 'mfa_disabled' | 'suspicious_activity' | 'security_violation';
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

// ===== MFA TYPES =====

export interface MfaChallenge {
  id: string;
  type: 'totp' | 'sms' | 'email' | 'backup_code';
  secret?: string;
  qrCode?: string;
  backupCodes?: string[];
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
}

// ===== FORM STATES =====

export interface LoginFormState {
  username: string;
  password: string;
  rememberMe: boolean;
  mfaCode: string;
  isLoading: boolean;
  error: string | null;
  showMfa: boolean;
}

export interface RegisterFormState {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
  isLoading: boolean;
  error: string | null;
  step: 'credentials' | 'verification' | 'profile' | 'complete';
}

export interface ForgotPasswordFormState {
  email: string;
  isLoading: boolean;
  error: string | null;
  success: boolean;
  message: string;
}

export interface ResetPasswordFormState {
  token: string;
  password: string;
  confirmPassword: string;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

// ===== AUTH REQUEST/RESPONSE TYPES =====

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
  mfaCode?: string;
  deviceFingerprint?: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
  deviceFingerprint?: string;
}

export interface AuthResponse {
  user: User;
  session: SessionInfo;
  tokens: AuthTokens;
  permissions: string[];
  featureFlags: string[];
  requiresMfa: boolean;
  mfaChallenge?: MfaChallenge;
}

export interface RefreshTokenResponse {
  tokens: AuthTokens;
  session: SessionInfo;
}

// ===== AUTH ERROR TYPES =====

export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public metadata?: Record<string, any>
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class ValidationError extends AuthError {
  constructor(message: string, field: string, value: any) {
    super(message, 'VALIDATION_ERROR', 400, { field, value });
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AuthError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AuthError {
  constructor(message: string = 'Access denied') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

export class MfaError extends AuthError {
  constructor(message: string, challenge?: MfaChallenge) {
    super(message, 'MFA_ERROR', 400, { challenge });
    this.name = 'MfaError';
  }
}

export class SessionError extends AuthError {
  constructor(message: string = 'Session invalid') {
    super(message, 'SESSION_ERROR', 401);
    this.name = 'SessionError';
  }
}

// ===== AUTH UTILITIES =====

export const createUser = (data: Partial<User>): User => {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    username: '',
    email: '',
    role: 'guest',
    isEmailVerified: false,
    isMfaEnabled: false,
    profile: {
      firstName: '',
      lastName: '',
    },
    preferences: {
      theme: 'auto',
      language: 'en',
      timezone: 'UTC',
      notifications: {
        email: true,
        push: false,
        sms: false,
      },
      privacy: {
        profileVisibility: 'private',
        showEmail: false,
        showPhone: false,
      },
    },
    createdAt: now,
    updatedAt: now,
    ...data,
  };
};

export const validateUser = (user: User): boolean => {
  return !!(
    user.id &&
    user.username &&
    user.email &&
    user.role &&
    user.profile &&
    user.preferences
  );
};

export const hasRole = (user: User, role: string): boolean => {
  return user.role === role;
};

export const hasAnyRole = (user: User, roles: string[]): boolean => {
  return roles.includes(user.role);
};

export const isAdmin = (user: User): boolean => {
  return user.role === 'admin';
};

export const isUser = (user: User): boolean => {
  return user.role === 'user';
};

export const isGuest = (user: User): boolean => {
  return user.role === 'guest';
};
