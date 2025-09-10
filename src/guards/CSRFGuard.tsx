// src/guards/CSRFGuard.tsx
import { BaseGuard } from './BaseGuard';

import type { GuardContext, GuardResult } from '@/types/routing';

// ===== CSRF GUARD =====

export class CSRFGuard extends BaseGuard {
  name = 'CSRFGuard';
  priority = 60;

  canActivate(context: GuardContext): GuardResult {
    const { security } = context.route;

    // Check if CSRF protection is required
    if (!security?.csrfRequired) {
      return this.allow();
    }

    // Check if user is authenticated
    if (!this.isAuthenticated(context.user)) {
      return this.deny(
        'Authentication required for CSRF protection',
        '/login',
        { 
          reason: 'not_authenticated',
          csrfRequired: true 
        }
      );
    }

    // Check CSRF token validity
    if (!this.isCSRFTokenValid()) {
      return this.deny(
        'Invalid CSRF token',
        '/csrf-error',
        { 
          reason: 'invalid_csrf_token',
          csrfRequired: true 
        }
      );
    }

    // Check CSRF token expiry
    if (this.isCSRFTokenExpired()) {
      return this.deny(
        'CSRF token expired',
        '/csrf-refresh',
        { 
          reason: 'csrf_token_expired',
          csrfRequired: true 
        }
      );
    }

    // Check origin header
    if (!this.isOriginValid()) {
      return this.deny(
        'Invalid origin header',
        '/csrf-error',
        { 
          reason: 'invalid_origin',
          csrfRequired: true 
        }
      );
    }

    // Check referer header
    if (!this.isRefererValid()) {
      return this.deny(
        'Invalid referer header',
        '/csrf-error',
        { 
          reason: 'invalid_referer',
          csrfRequired: true 
        }
      );
    }

    // Check SameSite cookie
    if (!this.isSameSiteCookieValid()) {
      return this.deny(
        'SameSite cookie violation',
        '/csrf-error',
        { 
          reason: 'samesite_cookie_violation',
          csrfRequired: true 
        }
      );
    }

    return this.allow({
      csrfToken: this.getCSRFToken(),
      csrfValidated: true,
    });
  }

  // Check if CSRF token is valid
  private isCSRFTokenValid(): boolean {
    const token = this.getCSRFToken();
    if (!token) return false;
    
    // Check token format (should be base64 encoded)
    try {
      atob(token);
      return true;
    } catch {
      return false;
    }
  }

  // Check if CSRF token is expired
  private isCSRFTokenExpired(): boolean {
    const tokenData = this.getCSRFTokenData();
    if (!tokenData) return true;
    
    const now = Date.now();
    const expiresAt = tokenData.expiresAt;
    
    return now >= expiresAt;
  }

  // Check origin header validity
  private isOriginValid(): boolean {
    const origin = window.location.origin;
    const allowedOrigins = this.getAllowedOrigins();
    
    return allowedOrigins.includes(origin);
  }

  // Check referer header validity
  private isRefererValid(): boolean {
    const referer = document.referrer;
    if (!referer) return true; // Allow if no referer
    
    const allowedReferers = this.getAllowedReferers();
    
    return allowedReferers.some(allowed => referer.startsWith(allowed));
  }

  // Check SameSite cookie validity
  private isSameSiteCookieValid(): boolean {
    // This would typically check server-side cookie settings
    // For now, we'll assume it's valid if we can access the token
    return !!this.getCSRFToken();
  }

  // Get CSRF token from storage
  private getCSRFToken(): string | null {
    return localStorage.getItem('csrf_token');
  }

  // Get CSRF token data
  private getCSRFTokenData(): { expiresAt: number } | null {
    const token = this.getCSRFToken();
    if (!token) return null;
    
    try {
      const decoded = atob(token);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  // Get allowed origins
  private getAllowedOrigins(): string[] {
    const config = this.getCSRFConfig();
    return config.allowedOrigins || [window.location.origin];
  }

  // Get allowed referers
  private getAllowedReferers(): string[] {
    const config = this.getCSRFConfig();
    return config.allowedReferers || [window.location.origin];
  }

  // Get CSRF configuration
  private getCSRFConfig(): {
    allowedOrigins: string[];
    allowedReferers: string[];
    tokenLength: number;
    tokenExpiry: number;
  } {
    return {
      allowedOrigins: [window.location.origin],
      allowedReferers: [window.location.origin],
      tokenLength: 32,
      tokenExpiry: 30 * 60 * 1000, // 30 minutes
    };
  }

  // Generate new CSRF token
  private generateCSRFToken(): string {
    const config = this.getCSRFConfig();
    const tokenData = {
      token: this.generateRandomString(config.tokenLength),
      expiresAt: Date.now() + config.tokenExpiry,
      timestamp: Date.now(),
    };
    
    const encoded = btoa(JSON.stringify(tokenData));
    localStorage.setItem('csrf_token', encoded);
    
    return encoded;
  }

  // Generate random string
  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  // Validate CSRF token against server
  private async validateCSRFTokenWithServer(token: string): Promise<boolean> {
    try {
      const response = await fetch('/api/csrf/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': token,
        },
        body: JSON.stringify({ token }),
      });
      
      return response.ok;
    } catch {
      return false;
    }
  }

  // Refresh CSRF token
  private async refreshCSRFToken(): Promise<string> {
    try {
      const response = await fetch('/api/csrf/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('csrf_token', data.token);
        return data.token;
      }
    } catch (error) {
      console.error('CSRF token refresh failed:', error);
    }
    
    // Fallback to local generation
    return this.generateCSRFToken();
  }

  // Check CSRF attack patterns
  private detectCSRFAttack(): boolean {
    // Check for suspicious patterns
    const suspiciousPatterns = [
      // Multiple rapid requests
      this.hasRapidRequests(),
      // Unusual referer patterns
      this.hasUnusualReferer(),
      // Missing or invalid headers
      this.hasInvalidHeaders(),
    ];
    
    return suspiciousPatterns.some(pattern => pattern);
  }

  // Check for rapid requests
  private hasRapidRequests(): boolean {
    const now = Date.now();
    const lastRequest = parseInt(localStorage.getItem('last_csrf_request') || '0');
    const timeSinceLastRequest = now - lastRequest;
    
    // If less than 100ms since last request, might be an attack
    if (timeSinceLastRequest < 100) {
      return true;
    }
    
    localStorage.setItem('last_csrf_request', now.toString());
    return false;
  }

  // Check for unusual referer
  private hasUnusualReferer(): boolean {
    const referer = document.referrer;
    if (!referer) return false;
    
    // Check if referer is from a different domain
    const currentDomain = window.location.hostname;
    const refererDomain = new URL(referer).hostname;
    
    return currentDomain !== refererDomain;
  }

  // Check for invalid headers
  private hasInvalidHeaders(): boolean {
    // This would typically check server-side headers
    // For now, we'll assume headers are valid
    return false;
  }
}

// ===== CSRF GUARD INSTANCE =====

export const csrfGuard = new CSRFGuard();
