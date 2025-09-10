// src/pages/auth/services/authService.ts
import type { 
  LoginCredentials, 
  RegisterCredentials, 
  AuthResponse, 
  AuthTokens,
  User,
  SessionInfo,
  SecurityEvent,
  MfaChallenge
} from '@/types/auth';

import axios from '@/config/axios';


// ===== AUTHENTICATION API =====

export const loginApi = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await axios.post('/auth/login', credentials);
  return response.data;
};

export const registerApi = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  const response = await axios.post('/auth/register', credentials);
  return response.data;
};

export const logoutApi = async (sessionId: string): Promise<void> => {
  await axios.post('/auth/logout', { sessionId });
};

export const refreshTokenApi = async (refreshToken: string): Promise<{ tokens: AuthTokens; session: SessionInfo }> => {
  const response = await axios.post('/auth/refresh', { refreshToken });
  return response.data;
};

// ===== USER MANAGEMENT API =====

export const updateProfileApi = async (updates: Partial<User['profile']>): Promise<User> => {
  const response = await axios.patch('/auth/profile', updates);
  return response.data;
};

export const updatePreferencesApi = async (updates: Partial<User['preferences']>): Promise<User> => {
  const response = await axios.patch('/auth/preferences', updates);
  return response.data;
};

export const changePasswordApi = async (oldPassword: string, newPassword: string): Promise<void> => {
  await axios.patch('/auth/password', { oldPassword, newPassword });
};

// ===== MFA API =====

export const enableMfaApi = async (): Promise<{ secret: string; qrCode: string; backupCodes: string[] }> => {
  const response = await axios.post('/auth/mfa/enable');
  return response.data;
};

export const disableMfaApi = async (code: string): Promise<void> => {
  await axios.post('/auth/mfa/disable', { code });
};

export const verifyMfaApi = async (code: string): Promise<boolean> => {
  const response = await axios.post('/auth/mfa/verify', { code });
  return response.data.valid;
};

export const generateBackupCodesApi = async (): Promise<string[]> => {
  const response = await axios.post('/auth/mfa/backup-codes');
  return response.data.codes;
};

// ===== SESSION MANAGEMENT API =====

export const extendSessionApi = async (sessionId: string): Promise<void> => {
  await axios.patch('/auth/sessions/extend', { sessionId });
};

export const terminateSessionApi = async (sessionId: string): Promise<void> => {
  await axios.delete(`/auth/sessions/${sessionId}`);
};

export const getActiveSessionsApi = async (): Promise<SessionInfo[]> => {
  const response = await axios.get('/auth/sessions');
  return response.data;
};

// ===== SECURITY API =====

export const getSecurityEventsApi = async (limit = 50): Promise<SecurityEvent[]> => {
  const response = await axios.get(`/auth/security/events?limit=${limit}`);
  return response.data;
};

export const reportSecurityEventApi = async (event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> => {
  await axios.post('/auth/security/events', event);
};

// ===== AUTH SERVICE CLASS =====

class AuthService {
  // Authentication methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return loginApi(credentials);
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    return registerApi(credentials);
  }

  async logout(sessionId: string): Promise<void> {
    return logoutApi(sessionId);
  }

  async refreshToken(refreshToken: string): Promise<{ tokens: AuthTokens; session: SessionInfo }> {
    return refreshTokenApi(refreshToken);
  }

  // User management methods
  async updateProfile(updates: Partial<User['profile']>): Promise<User> {
    return updateProfileApi(updates);
  }

  async updatePreferences(updates: Partial<User['preferences']>): Promise<User> {
    return updatePreferencesApi(updates);
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    return changePasswordApi(oldPassword, newPassword);
  }

  // MFA methods
  async enableMfa(): Promise<{ secret: string; qrCode: string; backupCodes: string[] }> {
    return enableMfaApi();
  }

  async disableMfa(code: string): Promise<void> {
    return disableMfaApi(code);
  }

  async verifyMfa(code: string): Promise<boolean> {
    return verifyMfaApi(code);
  }

  async generateBackupCodes(): Promise<string[]> {
    return generateBackupCodesApi();
  }

  // Session management methods
  async extendSession(sessionId: string): Promise<void> {
    return extendSessionApi(sessionId);
  }

  async terminateSession(sessionId: string): Promise<void> {
    return terminateSessionApi(sessionId);
  }

  async getActiveSessions(): Promise<SessionInfo[]> {
    return getActiveSessionsApi();
  }

  // Security methods
  async getSecurityEvents(limit = 50): Promise<SecurityEvent[]> {
    return getSecurityEventsApi(limit);
  }

  async reportSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> {
    return reportSecurityEventApi(event);
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export individual functions for backward compatibility
export { loginApi, registerApi, logoutApi };
