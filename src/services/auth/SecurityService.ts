import { tokenManager } from './TokenManager';

export interface SecurityEvent {
  type: 'auth' | 'permission' | 'csrf' | 'xss' | 'rate_limit';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

class SecurityService {
  private events: SecurityEvent[] = [];
  private readonly MAX_EVENTS = 1000;

  // CSRF Protection
  generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  validateCSRFToken(token: string, storedToken: string): boolean {
    return token === storedToken;
  }

  // Input Sanitization
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  sanitizeHTML(html: string): string {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  // Permission Validation
  hasPermission(userPermissions: string[], requiredPermission: string): boolean {
    return userPermissions.includes(requiredPermission) || userPermissions.includes('*');
  }

  hasAnyPermission(userPermissions: string[], requiredPermissions: string[]): boolean {
    return requiredPermissions.some(permission => this.hasPermission(userPermissions, permission));
  }

  hasAllPermissions(userPermissions: string[], requiredPermissions: string[]): boolean {
    return requiredPermissions.every(permission => this.hasPermission(userPermissions, permission));
  }

  // Role Validation
  hasRole(userRoles: string[], requiredRole: string): boolean {
    return userRoles.includes(requiredRole);
  }

  hasAnyRole(userRoles: string[], requiredRoles: string[]): boolean {
    return requiredRoles.some(role => this.hasRole(userRoles, role));
  }

  // Security Event Logging
  logSecurityEvent(event: SecurityEvent): void {
    this.events.unshift(event);
    
    // Keep only the most recent events
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(0, this.MAX_EVENTS);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Security Event:', event);
    }

    // In production, you would send this to a security monitoring service
    this.sendToSecurityService(event);
  }

  private sendToSecurityService(event: SecurityEvent): void {
    // TODO: Implement actual security service integration
    // This could be Sentry, LogRocket, or a custom security API
    if (event.severity === 'critical' || event.severity === 'high') {
      // Send immediately for critical/high severity events
      console.error('Critical Security Event:', event);
    }
  }

  getSecurityEvents(): SecurityEvent[] {
    return [...this.events];
  }

  clearSecurityEvents(): void {
    this.events = [];
  }

  // Rate Limiting
  private rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const current = this.rateLimitMap.get(key);

    if (!current || now > current.resetTime) {
      this.rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (current.count >= maxRequests) {
      this.logSecurityEvent({
        type: 'rate_limit',
        message: `Rate limit exceeded for key: ${key}`,
        severity: 'medium',
        metadata: { key, count: current.count, maxRequests }
      });
      return false;
    }

    current.count++;
    return true;
  }

  // Token Security
  validateTokenSecurity(): boolean {
    const token = tokenManager.getToken();
    if (!token) {return false;}

    // Basic token format validation
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      this.logSecurityEvent({
        type: 'auth',
        message: 'Invalid token format detected',
        severity: 'high'
      });
      return false;
    }

    return true;
  }
}

export const securityService = new SecurityService();
export default securityService;
