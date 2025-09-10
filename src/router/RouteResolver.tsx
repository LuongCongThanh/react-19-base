// src/router/RouteResolver.tsx
import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from './DynamicRouter';

import type { 
  RouteConfig, 
  RouteResolution, 
  RouteContext, 
  RouteMatch,
  RouteRole,
  GuardResult
} from '@/types/routing';

// ===== ROUTE RESOLVER CONTEXT =====

interface RouteResolverContextValue {
  // Route matching
  matchRoute: (path: string) => RouteMatch | null;
  resolveRoute: (path: string) => Promise<RouteResolution>;
  findRouteByPath: (path: string) => RouteConfig | undefined;
  
  // Route validation
  validateRoute: (route: RouteConfig) => boolean;
  canAccessRoute: (route: RouteConfig) => boolean;
  
  // Route utilities
  buildPath: (route: RouteConfig, params?: Record<string, string>) => string;
  parsePath: (path: string) => { pathname: string; search: string; hash: string };
  
  // Route resolution state
  isResolving: boolean;
  resolutionError: Error | null;
}

const RouteResolverContext = createContext<RouteResolverContextValue | undefined>(undefined);

// ===== ROUTE MATCHER =====

class RouteMatcher {
  static match(path: string, routes: RouteConfig[]): RouteMatch | null {
    for (const route of routes) {
      const match = this.matchRoute(path, route);
      if (match) {
        return match;
      }
    }
    return null;
  }

  private static matchRoute(path: string, route: RouteConfig): RouteMatch | null {
    const routePath = route.path;
    const exact = route.exact || false;
    
    // Handle exact matches
    if (exact && path === routePath) {
      return {
        route,
        params: {},
        query: {},
        hash: '',
        isExact: true,
      };
    }
    
    // Handle wildcard matches
    if (routePath === '*') {
      return {
        route,
        params: { '*': path },
        query: {},
        hash: '',
        isExact: false,
      };
    }
    
    // Handle parameterized routes
    const paramNames: string[] = [];
    const regexPattern = routePath
      .replace(/:([^/]+)/g, (match, paramName) => {
        paramNames.push(paramName);
        return '([^/]+)';
      })
      .replace(/\*/g, '.*');
    
    const regex = new RegExp(`^${regexPattern}$`);
    const match = path.match(regex);
    
    if (match) {
      const params: Record<string, string> = {};
      paramNames.forEach((name, index) => {
        params[name] = match[index + 1];
      });
      
      return {
        route,
        params,
        query: this.parseQueryString(path.split('?')[1] || ''),
        hash: path.split('#')[1] || '',
        isExact: path === routePath,
      };
    }
    
    return null;
  }

  private static parseQueryString(queryString: string): Record<string, string> {
    const params: Record<string, string> = {};
    if (!queryString) return params;
    
    queryString.split('&').forEach(param => {
      const [key, value] = param.split('=');
      if (key) {
        params[decodeURIComponent(key)] = decodeURIComponent(value || '');
      }
    });
    
    return params;
  }

  static buildPath(route: RouteConfig, params: Record<string, string> = {}): string {
    let path = route.path;
    
    // Replace parameters
    Object.entries(params).forEach(([key, value]) => {
      path = path.replace(`:${key}`, encodeURIComponent(value));
    });
    
    return path;
  }

  static parsePath(path: string): { pathname: string; search: string; hash: string } {
    const [pathname, searchAndHash] = path.split('?');
    const [search, hash] = (searchAndHash || '').split('#');
    
    return {
      pathname,
      search: search ? `?${search}` : '',
      hash: hash ? `#${hash}` : '',
    };
  }
}

// ===== ROUTE RESOLVER PROVIDER =====

interface RouteResolverProviderProps {
  children: React.ReactNode;
  routes: RouteConfig[];
}

export const RouteResolverProvider: React.FC<RouteResolverProviderProps> = ({
  children,
  routes,
}) => {
  const auth = useAuth();
  const router = useRouter();
  const location = useLocation();
  const navigate = useNavigate();

  // ===== ROUTE MATCHING =====

  const matchRoute = useCallback((path: string): RouteMatch | null => {
    return RouteMatcher.match(path, routes);
  }, [routes]);

  const findRouteByPath = useCallback((path: string): RouteConfig | undefined => {
    const match = matchRoute(path);
    return match?.route;
  }, [matchRoute]);

  // ===== ROUTE RESOLUTION =====

  const resolveRoute = useCallback(async (path: string): Promise<RouteResolution> => {
    const route = findRouteByPath(path);
    if (!route) {
      throw new Error(`Route not found: ${path}`);
    }

    try {
      // Load component
      const componentModule = await route.component();
      const component = componentModule.default;

      // Validate route access
      if (!canAccessRoute(route)) {
        throw new Error(`Access denied to route: ${path}`);
      }

      // Execute guards
      const guardResults: GuardResult[] = [];
      if (route.security.guards && route.security.guards.length > 0) {
        for (const guardName of route.security.guards) {
          const guard = router.guards.get(guardName);
          if (guard) {
            const context: RouteContext = {
              currentRoute: route,
              previousRoute: router.currentRoute,
              user: auth.user,
              tenant: null, // TODO: Add tenant context
              permissions: auth.permissions,
              roles: auth.user ? [auth.user.role] : [],
              isNavigating: true,
              navigationHistory: router.history,
              resolution: null,
              error: null,
            };

            const result = await guard.canActivate(context);
            guardResults.push(result);

            if (!result.allowed) {
              if (result.redirectTo) {
                navigate(result.redirectTo, { replace: true });
              }
              throw new Error(result.error || `Guard ${guardName} denied access`);
            }
          }
        }
      }

      return {
        route,
        status: 'resolved',
        component,
        guards: guardResults,
        resolvedAt: new Date(),
      };
    } catch (error) {
      return {
        route,
        status: 'error',
        error: error as Error,
        guards: [],
        resolvedAt: new Date(),
      };
    }
  }, [findRouteByPath, canAccessRoute, router, auth, navigate]);

  // ===== ROUTE VALIDATION =====

  const validateRoute = useCallback((route: RouteConfig): boolean => {
    // Check if route has required properties
    if (!route.code || !route.path || !route.component) {
      return false;
    }

    // Check if route has valid security configuration
    if (route.security) {
      const { roles, permissions } = route.security;
      
      if (roles && !Array.isArray(roles)) {
        return false;
      }
      
      if (permissions && !Array.isArray(permissions)) {
        return false;
      }
    }

    return true;
  }, []);

  const canAccessRoute = useCallback((route: RouteConfig): boolean => {
    // Check if user is authenticated for protected routes
    if (route.meta.requiresAuth && !auth.isAuthenticated) {
      return false;
    }

    // Check roles
    if (route.security.roles && route.security.roles.length > 0) {
      if (!auth.user || !route.security.roles.includes(auth.user.role as RouteRole)) {
        return false;
      }
    }

    // Check permissions
    if (route.security.permissions && route.security.permissions.length > 0) {
      const hasAllPermissions = route.security.permissions.every(permission => 
        auth.hasPermission(permission)
      );
      if (!hasAllPermissions) {
        return false;
      }
    }

    // Check tenant requirements
    if (route.security.tenantRequired) {
      // TODO: Implement tenant checking
      return true;
    }

    return true;
  }, [auth]);

  // ===== ROUTE UTILITIES =====

  const buildPath = useCallback((route: RouteConfig, params: Record<string, string> = {}): string => {
    return RouteMatcher.buildPath(route, params);
  }, []);

  const parsePath = useCallback((path: string) => {
    return RouteMatcher.parsePath(path);
  }, []);

  // ===== CONTEXT VALUE =====

  const contextValue: RouteResolverContextValue = useMemo(() => ({
    matchRoute,
    resolveRoute,
    findRouteByPath,
    validateRoute,
    canAccessRoute,
    buildPath,
    parsePath,
    isResolving: router.isNavigating,
    resolutionError: router.error,
  }), [
    matchRoute,
    resolveRoute,
    findRouteByPath,
    validateRoute,
    canAccessRoute,
    buildPath,
    parsePath,
    router.isNavigating,
    router.error,
  ]);

  return (
    <RouteResolverContext.Provider value={contextValue}>
      {children}
    </RouteResolverContext.Provider>
  );
};

// ===== ROUTE RESOLVER HOOK =====

export const useRouteResolver = (): RouteResolverContextValue => {
  const context = useContext(RouteResolverContext);
  if (context === undefined) {
    throw new Error('useRouteResolver must be used within a RouteResolverProvider');
  }
  return context;
};

// ===== ROUTE RESOLVER COMPONENT =====

interface RouteResolverProps {
  path: string;
  children?: (resolution: RouteResolution) => React.ReactNode;
  fallback?: React.ComponentType<any>;
  onError?: (error: Error) => void;
}

export const RouteResolver: React.FC<RouteResolverProps> = ({
  path,
  children,
  fallback: Fallback,
  onError,
}) => {
  const { resolveRoute, isResolving } = useRouteResolver();
  const [resolution, setResolution] = React.useState<RouteResolution | null>(null);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const loadRoute = async () => {
      try {
        setError(null);
        const routeResolution = await resolveRoute(path);
        setResolution(routeResolution);
      } catch (err) {
        const error = err as Error;
        setError(error);
        onError?.(error);
      }
    };

    loadRoute();
  }, [path, resolveRoute, onError]);

  if (isResolving || !resolution) {
    return Fallback ? <Fallback /> : <div>Loading route...</div>;
  }

  if (error || resolution.status === 'error') {
    return <div>Error loading route: {error?.message || resolution.error?.message}</div>;
  }

  if (children) {
    return <>{children(resolution)}</>;
  }

  if (resolution.component) {
    const Component = resolution.component;
    return <Component />;
  }

  return <div>Route component not found</div>;
};

export default RouteResolver;
