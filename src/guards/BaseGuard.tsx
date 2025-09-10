// src/guards/BaseGuard.tsx
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';

import type { GuardResult, RouteContext, RouteConfig } from '@/types/routing';

// ===== BASE GUARD INTERFACE =====

export interface GuardProps {
  children: ReactNode;
  route: RouteConfig;
  fallback?: ReactNode;
  onGuardFail?: (result: GuardResult) => void;
}

export interface Guard {
  name: string;
  priority: number;
  canActivate: (context: RouteContext) => Promise<GuardResult> | GuardResult;
  canDeactivate?: (context: RouteContext) => Promise<GuardResult> | GuardResult;
}

// ===== BASE GUARD COMPONENT =====

export abstract class BaseGuard implements Guard {
  abstract name: string;
  abstract priority: number;

  abstract canActivate(context: RouteContext): Promise<GuardResult> | GuardResult;
  
  canDeactivate?(context: RouteContext): Promise<GuardResult> | GuardResult {
    return { allowed: true };
  }

  // Helper method to create guard result
  protected allow(metadata?: Record<string, any>): GuardResult {
    return { allowed: true, metadata };
  }

  protected deny(reason: string, redirectTo?: string, metadata?: Record<string, any>): GuardResult {
    return { 
      allowed: false, 
      reason, 
      redirectTo, 
      metadata 
    };
  }

  // Helper method to check if user is authenticated
  protected isAuthenticated(user: any): boolean {
    return !!user && !!user.id;
  }

  // Helper method to check if session is valid
  protected isSessionValid(session: any): boolean {
    if (!session) return false;
    
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    
    return now < expiresAt && session.isActive;
  }

  // Helper method to check if user has required role
  protected hasRole(user: any, requiredRoles: string[]): boolean {
    if (!user || !user.role) return false;
    return requiredRoles.includes(user.role);
  }

  // Helper method to check if user has required permission
  protected hasPermission(user: any, requiredPermissions: string[]): boolean {
    if (!user || !user.permissions) return false;
    return requiredPermissions.some(permission => user.permissions.includes(permission));
  }

  // Helper method to check if user has required feature
  protected hasFeature(featureFlags: string[], requiredFeatures: string[]): boolean {
    return requiredFeatures.every(feature => featureFlags.includes(feature));
  }

  // Helper method to check tenant access
  protected hasTenantAccess(user: any, tenantId?: string): boolean {
    if (!tenantId) return true; // No tenant restriction
    if (!user || !user.tenantId) return false;
    return user.tenantId === tenantId;
  }

  // Helper method to check geographic restrictions
  protected checkGeoRestrictions(restrictions: any[], userLocation: any): boolean {
    if (!restrictions || restrictions.length === 0) return true;
    if (!userLocation) return true; // Allow if no location data
    
    return restrictions.every(restriction => {
      const { countries, type } = restriction;
      const userCountry = userLocation.country;
      
      if (!userCountry) return true; // Allow if country unknown
      
      const hasAccess = countries.includes(userCountry);
      return type === 'allow' ? hasAccess : !hasAccess;
    });
  }

  // Helper method to check rate limiting
  protected checkRateLimit(rateLimit: any, context: RouteContext): boolean {
    if (!rateLimit) return true;
    
    // This would typically check against a rate limiting service
    // For now, we'll implement a simple in-memory check
    const key = `rate_limit_${context.user?.id}_${context.route.code}`;
    const now = Date.now();
    const windowStart = now - rateLimit.windowMs;
    
    // Get stored requests from localStorage (in production, use Redis or similar)
    const stored = localStorage.getItem(key);
    const requests = stored ? JSON.parse(stored) : [];
    
    // Filter requests within the window
    const recentRequests = requests.filter((timestamp: number) => timestamp > windowStart);
    
    // Check if limit exceeded
    if (recentRequests.length >= rateLimit.max) {
      return false;
    }
    
    // Add current request
    recentRequests.push(now);
    localStorage.setItem(key, JSON.stringify(recentRequests));
    
    return true;
  }
}

// ===== GUARD WRAPPER COMPONENT =====

interface GuardWrapperProps {
  guards: Guard[];
  children: ReactNode;
  route: RouteConfig;
  fallback?: ReactNode;
  onGuardFail?: (result: GuardResult) => void;
}

export const GuardWrapper: React.FC<GuardWrapperProps> = ({
  guards,
  children,
  route,
  fallback,
  onGuardFail,
}) => {
  const { user, session, permissions, featureFlags, securityContext } = useAuth();
  const [guardResult, setGuardResult] = React.useState<GuardResult | null>(null);
  const [isChecking, setIsChecking] = React.useState(true);

  React.useEffect(() => {
    const checkGuards = async () => {
      try {
        setIsChecking(true);
        
        // Sort guards by priority (higher priority first)
        const sortedGuards = [...guards].sort((a, b) => b.priority - a.priority);
        
        // Create guard context
        const context: RouteContext = {
          currentRoute: route,
          previousRoute: null,
          user,
          tenant: user?.tenantId ? { id: user.tenantId } as any : null,
          permissions,
          roles: user ? [user.role] : [],
          isNavigating: true,
          navigationHistory: [],
          resolution: null,
          error: null,
        };

        // Check each guard
        for (const guard of sortedGuards) {
          const result = await guard.canActivate(context);
          
          if (!result.allowed) {
            setGuardResult(result);
            onGuardFail?.(result);
            return;
          }
        }
        
        // All guards passed
        setGuardResult({ allowed: true });
      } catch (error) {
        console.error('Guard check failed:', error);
        setGuardResult({
          allowed: false,
          reason: 'Guard check failed',
          redirectTo: '/error',
        });
      } finally {
        setIsChecking(false);
      }
    };

    checkGuards();
  }, [guards, user, session, permissions, featureFlags, route, onGuardFail]);

  // Show loading state
  if (isChecking) {
    return fallback || <div>Checking permissions...</div>;
  }

  // Show guard failure
  if (guardResult && !guardResult.allowed) {
    if (guardResult.redirectTo) {
      return <Navigate to={guardResult.redirectTo} replace />;
    }
    
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">{guardResult.reason}</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // All guards passed, render children
  return <>{children}</>;
};

// ===== GUARD HOOK =====

export const useGuard = (guard: Guard, context: RouteContext) => {
  const [result, setResult] = React.useState<GuardResult | null>(null);
  const [isChecking, setIsChecking] = React.useState(true);

  React.useEffect(() => {
    const checkGuard = async () => {
      try {
        setIsChecking(true);
        const guardResult = await guard.canActivate(context);
        setResult(guardResult);
      } catch (error) {
        console.error('Guard check failed:', error);
        setResult({
          allowed: false,
          reason: 'Guard check failed',
        });
      } finally {
        setIsChecking(false);
      }
    };

    checkGuard();
  }, [guard, context]);

  return { result, isChecking };
};

export default BaseGuard;
