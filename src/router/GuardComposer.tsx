// src/router/GuardComposer.tsx
import React, { createContext, useContext, useCallback, useMemo, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from './DynamicRouter';
import { GuardRegistry } from '@/guards';

import type { 
  RouteConfig, 
  RouteContext, 
  Guard, 
  GuardResult,
  RouteRole
} from '@/types/routing';

// ===== GUARD COMPOSER CONTEXT =====

interface GuardComposerContextValue {
  // Guard execution
  executeGuards: (route: RouteConfig) => Promise<GuardResult[]>;
  canActivate: (route: RouteConfig) => Promise<boolean>;
  canDeactivate: (route: RouteConfig) => Promise<boolean>;
  
  // Guard state
  isExecuting: boolean;
  guardResults: Map<string, GuardResult>;
  lastError: Error | null;
  
  // Guard utilities
  getGuard: (name: string) => Guard | undefined;
  getRequiredGuards: (route: RouteConfig) => Guard[];
  validateGuardResult: (result: GuardResult) => boolean;
}

const GuardComposerContext = createContext<GuardComposerContextValue | undefined>(undefined);

// ===== GUARD COMPOSER PROVIDER =====

interface GuardComposerProviderProps {
  children: React.ReactNode;
}

export const GuardComposerProvider: React.FC<GuardComposerProviderProps> = ({
  children,
}) => {
  const auth = useAuth();
  const router = useRouter();
  const navigate = useNavigate();
  const location = useLocation();

  const [isExecuting, setIsExecuting] = useState(false);
  const [guardResults, setGuardResults] = useState<Map<string, GuardResult>>(new Map());
  const [lastError, setLastError] = useState<Error | null>(null);

  // ===== GUARD EXECUTION =====

  const executeGuards = useCallback(async (route: RouteConfig): Promise<GuardResult[]> => {
    setIsExecuting(true);
    setLastError(null);

    try {
      const requiredGuards = getRequiredGuards(route);
      const results: GuardResult[] = [];

      for (const guard of requiredGuards) {
        try {
          const context = createRouteContext(route);
          const result = await guard.canActivate(context);
          
          results.push(result);
          setGuardResults(prev => new Map(prev).set(guard.name, result));

          if (!result.allowed) {
            // Handle guard failure
            if (result.redirectTo) {
              navigate(result.redirectTo, { replace: true });
            }
            break;
          }
        } catch (error) {
          const guardError = new Error(`Guard ${guard.name} failed: ${error}`);
          setLastError(guardError);
          results.push({
            allowed: false,
            error: guardError.message,
          });
          break;
        }
      }

      return results;
    } finally {
      setIsExecuting(false);
    }
  }, [navigate]);

  const canActivate = useCallback(async (route: RouteConfig): Promise<boolean> => {
    const results = await executeGuards(route);
    return results.every(result => result.allowed);
  }, [executeGuards]);

  const canDeactivate = useCallback(async (route: RouteConfig): Promise<boolean> => {
    const requiredGuards = getRequiredGuards(route);
    const results: GuardResult[] = [];

    for (const guard of requiredGuards) {
      if (guard.canDeactivate) {
        try {
          const context = createRouteContext(route);
          const result = await guard.canDeactivate(context);
          results.push(result);

          if (!result.allowed) {
            return false;
          }
        } catch (error) {
          console.error(`Guard ${guard.name} deactivation failed:`, error);
          return false;
        }
      }
    }

    return true;
  }, []);

  // ===== GUARD UTILITIES =====

  const getGuard = useCallback((name: string): Guard | undefined => {
    return GuardRegistry.get(name);
  }, []);

  const getRequiredGuards = useCallback((route: RouteConfig): Guard[] => {
    return GuardRegistry.getRequiredGuards(route);
  }, []);

  const validateGuardResult = useCallback((result: GuardResult): boolean => {
    return result.allowed === true;
  }, []);

  // ===== ROUTE CONTEXT CREATION =====

  const createRouteContext = useCallback((route: RouteConfig): RouteContext => {
    return {
      currentRoute: route,
      previousRoute: router.currentRoute,
      user: auth.user,
      tenant: null, // TODO: Add tenant context
      permissions: auth.permissions,
      roles: auth.user ? [auth.user.role] : [],
      isNavigating: router.isNavigating,
      navigationHistory: router.history,
      resolution: null,
      error: null,
    };
  }, [auth, router]);

  // ===== CONTEXT VALUE =====

  const contextValue: GuardComposerContextValue = useMemo(() => ({
    executeGuards,
    canActivate,
    canDeactivate,
    isExecuting,
    guardResults,
    lastError,
    getGuard,
    getRequiredGuards,
    validateGuardResult,
  }), [
    executeGuards,
    canActivate,
    canDeactivate,
    isExecuting,
    guardResults,
    lastError,
    getGuard,
    getRequiredGuards,
    validateGuardResult,
  ]);

  return (
    <GuardComposerContext.Provider value={contextValue}>
      {children}
    </GuardComposerContext.Provider>
  );
};

// ===== GUARD COMPOSER HOOK =====

export const useGuardComposer = (): GuardComposerContextValue => {
  const context = useContext(GuardComposerContext);
  if (context === undefined) {
    throw new Error('useGuardComposer must be used within a GuardComposerProvider');
  }
  return context;
};

// ===== GUARD COMPOSER COMPONENT =====

interface GuardComposerProps {
  route: RouteConfig;
  children: React.ReactNode;
  fallback?: React.ComponentType<any>;
  onGuardFail?: (guard: string, result: GuardResult) => void;
  onError?: (error: Error) => void;
}

export const GuardComposer: React.FC<GuardComposerProps> = ({
  route,
  children,
  fallback: Fallback,
  onGuardFail,
  onError,
}) => {
  const { executeGuards, isExecuting, lastError } = useGuardComposer();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [guardResults, setGuardResults] = useState<GuardResult[]>([]);

  useEffect(() => {
    const checkGuards = async () => {
      try {
        const results = await executeGuards(route);
        setGuardResults(results);
        
        const authorized = results.every(result => result.allowed);
        setIsAuthorized(authorized);

        // Handle guard failures
        const failedGuard = results.find(result => !result.allowed);
        if (failedGuard && onGuardFail) {
          const guardName = route.security.guards?.[results.indexOf(failedGuard)] || 'unknown';
          onGuardFail(guardName, failedGuard);
        }
      } catch (error) {
        const err = error as Error;
        setLastError(err);
        onError?.(err);
        setIsAuthorized(false);
      }
    };

    checkGuards();
  }, [route, executeGuards, onGuardFail, onError]);

  // Show loading state
  if (isExecuting || isAuthorized === null) {
    return Fallback ? <Fallback /> : <div>Checking permissions...</div>;
  }

  // Show error state
  if (lastError) {
    return <div>Permission check failed: {lastError.message}</div>;
  }

  // Show unauthorized state
  if (!isAuthorized) {
    const failedResult = guardResults.find(result => !result.allowed);
    return (
      <div>
        Access denied: {failedResult?.error || 'Insufficient permissions'}
      </div>
    );
  }

  // Render children if authorized
  return <>{children}</>;
};

// ===== GUARD WRAPPER COMPONENT =====

interface GuardWrapperProps {
  guard: string;
  children: React.ReactNode;
  fallback?: React.ComponentType<any>;
  onFail?: (result: GuardResult) => void;
}

export const GuardWrapper: React.FC<GuardWrapperProps> = ({
  guard,
  children,
  fallback: Fallback,
  onFail,
}) => {
  const { getGuard, executeGuards } = useGuardComposer();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [result, setResult] = useState<GuardResult | null>(null);

  useEffect(() => {
    const checkGuard = async () => {
      const guardInstance = getGuard(guard);
      if (!guardInstance) {
        console.warn(`Guard ${guard} not found`);
        setIsAuthorized(false);
        return;
      }

      try {
        // Create a minimal route config for the guard
        const route: RouteConfig = {
          code: 'guard-check',
          path: '/',
          titleKey: 'guard-check',
          component: async () => ({ default: () => null }),
          layout: 'None',
          security: { guards: [guard] },
          meta: { title: 'Guard Check', requiresAuth: false },
        };

        const results = await executeGuards(route);
        const guardResult = results[0];
        
        setResult(guardResult);
        setIsAuthorized(guardResult.allowed);

        if (!guardResult.allowed && onFail) {
          onFail(guardResult);
        }
      } catch (error) {
        console.error(`Guard ${guard} execution failed:`, error);
        setIsAuthorized(false);
      }
    };

    checkGuard();
  }, [guard, getGuard, executeGuards, onFail]);

  if (isAuthorized === null) {
    return Fallback ? <Fallback /> : <div>Checking guard...</div>;
  }

  if (!isAuthorized) {
    return (
      <div>
        Guard {guard} failed: {result?.error || 'Access denied'}
      </div>
    );
  }

  return <>{children}</>;
};

export default GuardComposer;
