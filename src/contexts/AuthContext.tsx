// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { authService } from '@/pages/auth/services/authService';
import { setUser, setLoading, setError, clearError } from '@/pages/auth/slices/authSlice';

import type { 
  User, 
  AuthState, 
  LoginCredentials, 
  RegisterCredentials, 
  AuthResponse,
  SecurityContext,
  SessionInfo,
  MfaChallenge,
  SecurityEvent,
  AuthTokens
} from '@/types/auth';

// ===== AUTH CONTEXT TYPES =====

interface AuthContextValue extends AuthState {
  // Authentication actions
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (credentials: RegisterCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<AuthTokens>;
  
  // User management
  updateProfile: (updates: Partial<User['profile']>) => Promise<User>;
  updatePreferences: (updates: Partial<User['preferences']>) => Promise<User>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  
  // Security actions
  enableMfa: () => Promise<{ secret: string; qrCode: string; backupCodes: string[] }>;
  disableMfa: (code: string) => Promise<void>;
  verifyMfa: (code: string) => Promise<boolean>;
  generateBackupCodes: () => Promise<string[]>;
  
  // Session management
  extendSession: () => Promise<void>;
  terminateSession: (sessionId: string) => Promise<void>;
  getActiveSessions: () => Promise<SessionInfo[]>;
  
  // Security monitoring
  getSecurityEvents: (limit?: number) => Promise<SecurityEvent[]>;
  reportSecurityEvent: (event: Omit<SecurityEvent, 'id' | 'timestamp'>) => Promise<void>;
  
  // Utility functions
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  hasFeature: (feature: string) => boolean;
  isSessionValid: () => boolean;
  getSecurityScore: () => number;
  
  // State management
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

// ===== AUTH REDUCER =====

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_SESSION'; payload: SessionInfo | null }
  | { type: 'SET_TOKENS'; payload: AuthTokens | null }
  | { type: 'SET_PERMISSIONS'; payload: string[] }
  | { type: 'SET_FEATURE_FLAGS'; payload: string[] }
  | { type: 'SET_SECURITY_CONTEXT'; payload: SecurityContext | null }
  | { type: 'SET_MFA_REQUIRED'; payload: boolean }
  | { type: 'SET_MFA_CHALLENGE'; payload: MfaChallenge | null }
  | { type: 'UPDATE_USER_PROFILE'; payload: Partial<User['profile']> }
  | { type: 'UPDATE_USER_PREFERENCES'; payload: Partial<User['preferences']> }
  | { type: 'RESET_AUTH_STATE' };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  session: null,
  tokens: null,
  permissions: [],
  featureFlags: [],
  securityContext: null,
  isMfaRequired: false,
  mfaChallenge: null,
  loginForm: {
    username: '',
    password: '',
    rememberMe: false,
    mfaCode: '',
    isLoading: false,
    error: null,
    showMfa: false,
  },
  registerForm: {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    acceptTerms: false,
    isLoading: false,
    error: null,
    step: 'credentials',
  },
  forgotPasswordForm: {
    email: '',
    isLoading: false,
    error: null,
    success: false,
    message: '',
  },
  resetPasswordForm: {
    token: '',
    password: '',
    confirmPassword: '',
    isLoading: false,
    error: null,
    success: false,
  },
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
      };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'SET_SESSION':
      return { ...state, session: action.payload };
    
    case 'SET_TOKENS':
      return { ...state, tokens: action.payload };
    
    case 'SET_PERMISSIONS':
      return { ...state, permissions: action.payload };
    
    case 'SET_FEATURE_FLAGS':
      return { ...state, featureFlags: action.payload };
    
    case 'SET_SECURITY_CONTEXT':
      return { ...state, securityContext: action.payload };
    
    case 'SET_MFA_REQUIRED':
      return { ...state, isMfaRequired: action.payload };
    
    case 'SET_MFA_CHALLENGE':
      return { ...state, mfaChallenge: action.payload };
    
    case 'UPDATE_USER_PROFILE':
      return {
        ...state,
        user: state.user ? {
          ...state.user,
          profile: { ...state.user.profile, ...action.payload }
        } : null,
      };
    
    case 'UPDATE_USER_PREFERENCES':
      return {
        ...state,
        user: state.user ? {
          ...state.user,
          preferences: { ...state.user.preferences, ...action.payload }
        } : null,
      };
    
    case 'RESET_AUTH_STATE':
      return initialState;
    
    default:
      return state;
  }
}

// ===== AUTH CONTEXT =====

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ===== AUTH PROVIDER =====

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const reduxDispatch = useDispatch();

  // ===== DEVICE FINGERPRINTING =====
  
  const generateDeviceFingerprint = useCallback((): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
    ].join('|');
    
    return btoa(fingerprint).slice(0, 32);
  }, []);

  // ===== SECURITY CONTEXT =====
  
  const createSecurityContext = useCallback((): SecurityContext => {
    return {
      deviceId: localStorage.getItem('deviceId') || crypto.randomUUID(),
      deviceFingerprint: generateDeviceFingerprint(),
      ipAddress: '', // Will be set by server
      userAgent: navigator.userAgent,
      location: undefined, // Will be set if geolocation is available
      isTrustedDevice: localStorage.getItem('trustedDevice') === 'true',
      lastSecurityCheck: new Date(),
      securityScore: 0,
      riskLevel: 'low',
    };
  }, [generateDeviceFingerprint]);

  // ===== SESSION VALIDATION =====
  
  const isSessionValid = useCallback((): boolean => {
    if (!state.session || !state.tokens) return false;
    
    const now = new Date();
    const expiresAt = new Date(state.session.expiresAt);
    
    return now < expiresAt && state.session.isActive;
  }, [state.session, state.tokens]);

  // ===== TOKEN REFRESH =====
  
  const refreshToken = useCallback(async (): Promise<AuthTokens> => {
    if (!state.tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await authService.refreshToken(state.tokens.refreshToken);
      
      dispatch({ type: 'SET_TOKENS', payload: response.tokens });
      dispatch({ type: 'SET_SESSION', payload: response.session });
      
      return response.tokens;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Token refresh failed' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.tokens]);

  // ===== AUTHENTICATION ACTIONS =====
  
  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const securityContext = createSecurityContext();
      const response = await authService.login({
        ...credentials,
        deviceFingerprint: securityContext.deviceFingerprint,
      });
      
      // Store device ID if remember me is checked
      if (credentials.rememberMe) {
        localStorage.setItem('deviceId', securityContext.deviceId);
        localStorage.setItem('trustedDevice', 'true');
      }
      
      // Update state
      dispatch({ type: 'SET_USER', payload: response.user });
      dispatch({ type: 'SET_SESSION', payload: response.session });
      dispatch({ type: 'SET_TOKENS', payload: response.tokens });
      dispatch({ type: 'SET_PERMISSIONS', payload: response.permissions });
      dispatch({ type: 'SET_FEATURE_FLAGS', payload: response.featureFlags });
      dispatch({ type: 'SET_SECURITY_CONTEXT', payload: securityContext });
      
      // Update Redux store
      reduxDispatch(setUser(response.user));
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [createSecurityContext, reduxDispatch]);

  const register = useCallback(async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const securityContext = createSecurityContext();
      const response = await authService.register({
        ...credentials,
        deviceFingerprint: securityContext.deviceFingerprint,
      });
      
      // Update state
      dispatch({ type: 'SET_USER', payload: response.user });
      dispatch({ type: 'SET_SESSION', payload: response.session });
      dispatch({ type: 'SET_TOKENS', payload: response.tokens });
      dispatch({ type: 'SET_PERMISSIONS', payload: response.permissions });
      dispatch({ type: 'SET_FEATURE_FLAGS', payload: response.featureFlags });
      dispatch({ type: 'SET_SECURITY_CONTEXT', payload: securityContext });
      
      // Update Redux store
      reduxDispatch(setUser(response.user));
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [createSecurityContext, reduxDispatch]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      if (state.session?.id) {
        await authService.logout(state.session.id);
      }
      
      // Clear all auth data
      dispatch({ type: 'RESET_AUTH_STATE' });
      reduxDispatch(setUser(null));
      
      // Clear local storage
      localStorage.removeItem('deviceId');
      localStorage.removeItem('trustedDevice');
      
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.session, reduxDispatch]);

  // ===== USER MANAGEMENT =====
  
  const updateProfile = useCallback(async (updates: Partial<User['profile']>): Promise<User> => {
    if (!state.user) throw new Error('User not authenticated');
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const updatedUser = await authService.updateProfile(updates);
      
      dispatch({ type: 'UPDATE_USER_PROFILE', payload: updates });
      reduxDispatch(setUser(updatedUser));
      
      return updatedUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.user, reduxDispatch]);

  const updatePreferences = useCallback(async (updates: Partial<User['preferences']>): Promise<User> => {
    if (!state.user) throw new Error('User not authenticated');
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const updatedUser = await authService.updatePreferences(updates);
      
      dispatch({ type: 'UPDATE_USER_PREFERENCES', payload: updates });
      reduxDispatch(setUser(updatedUser));
      
      return updatedUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Preferences update failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.user, reduxDispatch]);

  const changePassword = useCallback(async (oldPassword: string, newPassword: string): Promise<void> => {
    if (!state.user) throw new Error('User not authenticated');
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      await authService.changePassword(oldPassword, newPassword);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password change failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.user]);

  // ===== MFA ACTIONS =====
  
  const enableMfa = useCallback(async (): Promise<{ secret: string; qrCode: string; backupCodes: string[] }> => {
    if (!state.user) throw new Error('User not authenticated');
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const result = await authService.enableMfa();
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'MFA setup failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.user]);

  const disableMfa = useCallback(async (code: string): Promise<void> => {
    if (!state.user) throw new Error('User not authenticated');
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      await authService.disableMfa(code);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'MFA disable failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.user]);

  const verifyMfa = useCallback(async (code: string): Promise<boolean> => {
    if (!state.user) throw new Error('User not authenticated');
    
    try {
      const isValid = await authService.verifyMfa(code);
      return isValid;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'MFA verification failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return false;
    }
  }, [state.user]);

  const generateBackupCodes = useCallback(async (): Promise<string[]> => {
    if (!state.user) throw new Error('User not authenticated');
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const codes = await authService.generateBackupCodes();
      
      return codes;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Backup codes generation failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.user]);

  // ===== SESSION MANAGEMENT =====
  
  const extendSession = useCallback(async (): Promise<void> => {
    if (!state.session) throw new Error('No active session');
    
    try {
      await authService.extendSession(state.session.id);
      
      // Update session expiry
      const newExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      dispatch({ type: 'SET_SESSION', payload: { ...state.session, expiresAt: newExpiresAt } });
      
    } catch (error) {
      console.error('Session extension failed:', error);
    }
  }, [state.session]);

  const terminateSession = useCallback(async (sessionId: string): Promise<void> => {
    try {
      await authService.terminateSession(sessionId);
      
      // If terminating current session, logout
      if (state.session?.id === sessionId) {
        await logout();
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Session termination failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, [state.session, logout]);

  const getActiveSessions = useCallback(async (): Promise<SessionInfo[]> => {
    if (!state.user) throw new Error('User not authenticated');
    
    try {
      const sessions = await authService.getActiveSessions();
      return sessions;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get active sessions';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, [state.user]);

  // ===== SECURITY MONITORING =====
  
  const getSecurityEvents = useCallback(async (limit = 50): Promise<SecurityEvent[]> => {
    if (!state.user) throw new Error('User not authenticated');
    
    try {
      const events = await authService.getSecurityEvents(limit);
      return events;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get security events';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, [state.user]);

  const reportSecurityEvent = useCallback(async (event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> => {
    try {
      await authService.reportSecurityEvent(event);
    } catch (error) {
      console.error('Failed to report security event:', error);
    }
  }, []);

  // ===== UTILITY FUNCTIONS =====
  
  const hasPermission = useCallback((permission: string): boolean => {
    return state.permissions.includes(permission);
  }, [state.permissions]);

  const hasRole = useCallback((role: string): boolean => {
    return state.user?.role === role;
  }, [state.user]);

  const hasFeature = useCallback((feature: string): boolean => {
    return state.featureFlags.includes(feature);
  }, [state.featureFlags]);

  const getSecurityScore = useCallback((): number => {
    if (!state.securityContext) return 0;
    
    let score = 0;
    
    // Base score
    score += 20;
    
    // Trusted device
    if (state.securityContext.isTrustedDevice) score += 20;
    
    // MFA enabled
    if (state.user?.isMfaEnabled) score += 30;
    
    // Recent security check
    const timeSinceCheck = Date.now() - state.securityContext.lastSecurityCheck.getTime();
    if (timeSinceCheck < 24 * 60 * 60 * 1000) score += 15; // Within 24 hours
    
    // Email verified
    if (state.user?.isEmailVerified) score += 15;
    
    return Math.min(score, 100);
  }, [state.securityContext, state.user]);

  // ===== STATE MANAGEMENT =====
  
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  // ===== AUTO TOKEN REFRESH =====
  
  useEffect(() => {
    if (!state.tokens || !state.session) return;
    
    const interval = setInterval(async () => {
      if (isSessionValid()) {
        try {
          await refreshToken();
        } catch (error) {
          console.error('Auto token refresh failed:', error);
          await logout();
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
    
    return () => clearInterval(interval);
  }, [state.tokens, state.session, isSessionValid, refreshToken, logout]);

  // ===== CONTEXT VALUE =====
  
  const contextValue: AuthContextValue = useMemo(() => ({
    ...state,
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    updatePreferences,
    changePassword,
    enableMfa,
    disableMfa,
    verifyMfa,
    generateBackupCodes,
    extendSession,
    terminateSession,
    getActiveSessions,
    getSecurityEvents,
    reportSecurityEvent,
    hasPermission,
    hasRole,
    hasFeature,
    isSessionValid,
    getSecurityScore,
    clearError,
    setLoading,
  }), [
    state,
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    updatePreferences,
    changePassword,
    enableMfa,
    disableMfa,
    verifyMfa,
    generateBackupCodes,
    extendSession,
    terminateSession,
    getActiveSessions,
    getSecurityEvents,
    reportSecurityEvent,
    hasPermission,
    hasRole,
    hasFeature,
    isSessionValid,
    getSecurityScore,
    clearError,
    setLoading,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ===== AUTH HOOK =====

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
