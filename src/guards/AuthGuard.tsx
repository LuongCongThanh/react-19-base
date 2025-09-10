// src/guards/AuthGuard.tsx
import { BaseGuard } from './BaseGuard';

import type { RouteContext, GuardResult } from '@/types/routing';

// ===== AUTH GUARD =====

export class AuthGuard extends BaseGuard {
  name = 'AuthGuard';
  priority = 100; // Highest priority

  canActivate(context: RouteContext): GuardResult {
    const { user } = context;
    const { security } = context.currentRoute;

    // Check if authentication is required
    if (!security?.roles || security.roles.includes('guest')) {
      return this.allow();
    }

    // Check if user is authenticated
    if (!this.isAuthenticated(user)) {
      return this.deny(
        'Authentication required',
        '/login',
        { 
          reason: 'not_authenticated',
          requiredRoles: security.roles 
        }
      );
    }

    // Check if session is valid (if available in context)
    // Note: Session validation would be handled by the auth context

    // Check if MFA is required
    if (security.roles.includes('admin') && user.isMfaEnabled && !user.isMfaVerified) {
      return this.deny(
        'Multi-factor authentication required',
        '/auth/mfa',
        { 
          reason: 'mfa_required',
          challengeId: user.mfaChallengeId 
        }
      );
    }

    // Check device trust for sensitive routes
    if (security.roles.includes('admin') && !user.securityContext?.isTrustedDevice) {
      return this.deny(
        'Device verification required',
        '/auth/verify-device',
        { 
          reason: 'device_not_trusted',
          deviceId: user.securityContext?.deviceId 
        }
      );
    }

    // Check concurrent session limits
    if (this.hasConcurrentSessionLimit(user)) {
      return this.deny(
        'Too many active sessions',
        '/auth/sessions',
        { 
          reason: 'concurrent_session_limit',
          maxSessions: user.maxConcurrentSessions 
        }
      );
    }

    // Check suspicious activity
    if (this.hasSuspiciousActivity(user)) {
      return this.deny(
        'Suspicious activity detected',
        '/auth/security-check',
        { 
          reason: 'suspicious_activity',
          riskLevel: user.securityContext?.riskLevel 
        }
      );
    }

    return this.allow({
      userId: user.id,
      deviceId: user.securityContext?.deviceId,
    });
  }

  // Check if user has reached concurrent session limit
  private hasConcurrentSessionLimit(user: any): boolean {
    const maxSessions = user.maxConcurrentSessions || 3;
    const activeSessions = user.activeSessions || 0;
    return activeSessions >= maxSessions;
  }

  // Check for suspicious activity patterns
  private hasSuspiciousActivity(user: any): boolean {
    if (!user.securityContext) return false;
    
    const { riskLevel, lastSecurityCheck } = user.securityContext;
    const timeSinceCheck = Date.now() - new Date(lastSecurityCheck).getTime();
    
    // High risk level
    if (riskLevel === 'high') return true;
    
    // No security check in last 24 hours for admin users
    if (user.role === 'admin' && timeSinceCheck > 24 * 60 * 60 * 1000) return true;
    
    // Multiple failed login attempts
    if (user.failedLoginAttempts > 3) return true;
    
    return false;
  }
}

// ===== AUTH GUARD INSTANCE =====

export const authGuard = new AuthGuard();
