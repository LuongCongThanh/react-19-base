// src/security/index.ts
import React, { createContext, useContext, useCallback, useMemo, useEffect } from 'react';

// ===== SECURITY CONTEXT TYPES =====

interface SecurityContextValue {
  // CSRF Protection
  csrfToken: string | null;
  generateCSRFToken: () => string;
  validateCSRFToken: (token: string) => boolean;
  
  // XSS Protection
  sanitizeInput: (input: string) => string;
  sanitizeHTML: (html: string) => string;
  
  // Rate Limiting
  isRateLimited: (key: string) => boolean;
  recordRequest: (key: string) => void;
  
  // Security Headers
  getSecurityHeaders: () => Record<string, string>;
  
  // Audit Logging
  logSecurityEvent: (event: SecurityEvent) => void;
  getSecurityEvents: () => SecurityEvent[];
  
  // Security State
  isSecure: boolean;
  securityScore: number;
  lastSecurityCheck: Date | null;
}

interface SecurityEvent {
  id: string;
  type: 'auth' | 'csrf' | 'xss' | 'rate_limit' | 'suspicious' | 'error';
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

// ===== SECURITY CONTEXT =====

const SecurityContext = createContext<SecurityContextValue | undefined>(undefined);

// ===== SECURITY PROVIDER =====

interface SecurityProviderProps {
  children: React.ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const [csrfToken, setCsrfToken] = React.useState<string | null>(null);
  const [securityEvents, setSecurityEvents] = React.useState<SecurityEvent[]>([]);
  const [rateLimitMap, setRateLimitMap] = React.useState<Map<string, { count: number; resetTime: number }>>(new Map());
  const [isSecure, setIsSecure] = React.useState(true);
  const [securityScore, setSecurityScore] = React.useState(100);
  const [lastSecurityCheck, setLastSecurityCheck] = React.useState<Date | null>(null);

  // ===== CSRF PROTECTION =====

  const generateCSRFToken = useCallback((): string => {
    const token = crypto.randomUUID();
    setCsrfToken(token);
    localStorage.setItem('csrf_token', token);
    return token;
  }, []);

  const validateCSRFToken = useCallback((token: string): boolean => {
    const storedToken = localStorage.getItem('csrf_token');
    return token === storedToken;
  }, []);

  // ===== XSS PROTECTION =====

  const sanitizeInput = useCallback((input: string): string => {
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }, []);

  const sanitizeHTML = useCallback((html: string): string => {
    // Simple HTML sanitization - in production, use a library like DOMPurify
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
      .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
      .replace(/javascript:/gi, ''); // Remove javascript: protocol
  }, []);

  // ===== RATE LIMITING =====

  const isRateLimited = useCallback((key: string): boolean => {
    const now = Date.now();
    const limit = rateLimitMap.get(key);
    
    if (!limit) return false;
    
    if (now > limit.resetTime) {
      setRateLimitMap(prev => {
        const newMap = new Map(prev);
        newMap.delete(key);
        return newMap;
      });
      return false;
    }
    
    return limit.count >= 10; // 10 requests per window
  }, [rateLimitMap]);

  const recordRequest = useCallback((key: string) => {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const resetTime = now + windowMs;
    
    setRateLimitMap(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(key);
      
      if (current && now < current.resetTime) {
        newMap.set(key, { count: current.count + 1, resetTime: current.resetTime });
      } else {
        newMap.set(key, { count: 1, resetTime });
      }
      
      return newMap;
    });
  }, []);

  // ===== SECURITY HEADERS =====

  const getSecurityHeaders = useCallback((): Record<string, string> => {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    };
  }, []);

  // ===== AUDIT LOGGING =====

  const logSecurityEvent = useCallback((event: Omit<SecurityEvent, 'id' | 'timestamp'>) => {
    const securityEvent: SecurityEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...event,
    };
    
    setSecurityEvents(prev => [...prev.slice(-99), securityEvent]); // Keep last 100 events
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Security Event:', securityEvent);
    }
    
    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to monitoring service
    }
  }, []);

  const getSecurityEvents = useCallback((): SecurityEvent[] => {
    return securityEvents;
  }, [securityEvents]);

  // ===== SECURITY MONITORING =====

  const performSecurityCheck = useCallback(() => {
    const now = new Date();
    setLastSecurityCheck(now);
    
    // Check for suspicious patterns
    const recentEvents = securityEvents.filter(
      event => now.getTime() - event.timestamp.getTime() < 5 * 60 * 1000 // Last 5 minutes
    );
    
    const criticalEvents = recentEvents.filter(event => event.severity === 'critical');
    const highEvents = recentEvents.filter(event => event.severity === 'high');
    
    // Calculate security score
    let score = 100;
    score -= criticalEvents.length * 20;
    score -= highEvents.length * 10;
    score -= recentEvents.length * 2;
    
    setSecurityScore(Math.max(0, score));
    setIsSecure(score > 50);
    
    // Log security check
    logSecurityEvent({
      type: 'auth',
      message: 'Security check performed',
      severity: 'low',
      metadata: { score, eventCount: recentEvents.length },
    });
  }, [securityEvents, logSecurityEvent]);

  // ===== EFFECTS =====

  useEffect(() => {
    // Initialize CSRF token
    const storedToken = localStorage.getItem('csrf_token');
    if (storedToken) {
      setCsrfToken(storedToken);
    } else {
      generateCSRFToken();
    }
  }, [generateCSRFToken]);

  useEffect(() => {
    // Perform security check every 5 minutes
    const interval = setInterval(performSecurityCheck, 5 * 60 * 1000);
    
    // Initial security check
    performSecurityCheck();
    
    return () => clearInterval(interval);
  }, [performSecurityCheck]);

  // ===== CONTEXT VALUE =====

  const contextValue: SecurityContextValue = useMemo(() => ({
    csrfToken,
    generateCSRFToken,
    validateCSRFToken,
    sanitizeInput,
    sanitizeHTML,
    isRateLimited,
    recordRequest,
    getSecurityHeaders,
    logSecurityEvent,
    getSecurityEvents,
    isSecure,
    securityScore,
    lastSecurityCheck,
  }), [
    csrfToken,
    generateCSRFToken,
    validateCSRFToken,
    sanitizeInput,
    sanitizeHTML,
    isRateLimited,
    recordRequest,
    getSecurityHeaders,
    logSecurityEvent,
    getSecurityEvents,
    isSecure,
    securityScore,
    lastSecurityCheck,
  ]);

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>
  );
};

// ===== SECURITY HOOK =====

export const useSecurity = (): SecurityContextValue => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

// ===== SECURITY UTILITIES =====

export const createSecurityEvent = (
  type: SecurityEvent['type'],
  message: string,
  severity: SecurityEvent['severity'] = 'medium',
  metadata?: Record<string, any>
): Omit<SecurityEvent, 'id' | 'timestamp'> => ({
  type,
  message,
  severity,
  metadata,
});

export const validateSecurityHeaders = (headers: Record<string, string>): boolean => {
  const requiredHeaders = [
    'X-Content-Type-Options',
    'X-Frame-Options',
    'X-XSS-Protection',
  ];
  
  return requiredHeaders.every(header => headers[header]);
};

export const generateSecureId = (): string => {
  return crypto.randomUUID();
};

export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const generateSecureToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export default SecurityProvider;
