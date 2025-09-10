// src/router/DynamicRouter.tsx
import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';
import { RouteResolver } from './RouteResolver';
import { GuardComposer } from './GuardComposer';
import { LayoutWrapper } from './LayoutWrapper';
import { RouteErrorBoundary } from './RouteErrorBoundary';

import type { 
  RouteConfig, 
  RouteContext, 
  RouterState, 
  RouterAction, 
  RouteResolution,
  LayoutType,
  RouteRole,
  GuardResult
} from '@/types/routing';

// ===== ROUTER CONTEXT =====

interface RouterContextValue extends RouterState {
  // Navigation
  navigate: (path: string, options?: { replace?: boolean; state?: any }) => void;
  goBack: () => void;
  goForward: () => void;
  
  // Route management
  registerRoute: (route: RouteConfig) => void;
  unregisterRoute: (code: string) => void;
  getRoute: (code: string) => RouteConfig | undefined;
  findRouteByPath: (path: string) => RouteConfig | undefined;
  
  // Guard management
  registerGuard: (guard: any) => void;
  unregisterGuard: (name: string) => void;
  
  // Layout management
  registerLayout: (type: LayoutType, component: React.ComponentType<any>) => void;
  unregisterLayout: (type: LayoutType) => void;
  
  // Route resolution
  resolveRoute: (path: string) => Promise<RouteResolution>;
  preloadRoute: (path: string) => Promise<void>;
  
  // Utilities
  hasPermission: (permission: string) => boolean;
  hasRole: (role: RouteRole) => boolean;
  canAccess: (route: RouteConfig) => boolean;
  
  // State management
  clearError: () => void;
  clearHistory: () => void;
  clearCache: () => void;
}

const RouterContext = createContext<RouterContextValue | undefined>(undefined);

// ===== ROUTER REDUCER =====

const initialState: RouterState = {
  currentRoute: null,
  previousRoute: null,
  isNavigating: false,
  error: null,
  routes: new Map(),
  layouts: new Map(),
  guards: new Map(),
  history: [],
  maxHistorySize: 50,
  preloadedRoutes: new Set(),
  cachedComponents: new Map(),
};

function routerReducer(state: RouterState, action: RouterAction): RouterState {
  switch (action.type) {
    case 'NAVIGATE_START':
      return {
        ...state,
        isNavigating: true,
        error: null,
      };
    
    case 'NAVIGATE_SUCCESS':
      return {
        ...state,
        isNavigating: false,
        previousRoute: state.currentRoute,
        currentRoute: action.payload.route,
        error: null,
        cachedComponents: new Map(state.cachedComponents).set(
          action.payload.route.code,
          action.payload.component
        ),
      };
    
    case 'NAVIGATE_ERROR':
      return {
        ...state,
        isNavigating: false,
        error: action.payload.error,
      };
    
    case 'SET_CURRENT_ROUTE':
      return {
        ...state,
        currentRoute: action.payload,
      };
    
    case 'SET_PREVIOUS_ROUTE':
      return {
        ...state,
        previousRoute: action.payload,
      };
    
    case 'ADD_TO_HISTORY':
      const newHistory = [...state.history, action.payload];
      if (newHistory.length > state.maxHistorySize) {
        newHistory.shift();
      }
      return {
        ...state,
        history: newHistory,
      };
    
    case 'CLEAR_HISTORY':
      return {
        ...state,
        history: [],
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    
    case 'PRELOAD_ROUTE':
      return {
        ...state,
        preloadedRoutes: new Set(state.preloadedRoutes).add(action.payload),
      };
    
    case 'CACHE_COMPONENT':
      return {
        ...state,
        cachedComponents: new Map(state.cachedComponents).set(
          action.payload.route,
          action.payload.component
        ),
      };
    
    case 'CLEAR_CACHE':
      return {
        ...state,
        cachedComponents: new Map(),
        preloadedRoutes: new Set(),
      };
    
    default:
      return state;
  }
}

// ===== ROUTER PROVIDER =====

interface DynamicRouterProviderProps {
  children: React.ReactNode;
  initialRoutes?: RouteConfig[];
  maxHistorySize?: number;
}

export const DynamicRouterProvider: React.FC<DynamicRouterProviderProps> = ({
  children,
  initialRoutes = [],
  maxHistorySize = 50,
}) => {
  const [state, dispatch] = useReducer(routerReducer, {
    ...initialState,
    maxHistorySize,
  });
  
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // ===== ROUTE REGISTRATION =====

  const registerRoute = useCallback((route: RouteConfig) => {
    const newRoutes = new Map(state.routes);
    newRoutes.set(route.code, route);
    dispatch({ type: 'SET_CURRENT_ROUTE', payload: route });
  }, [state.routes]);

  const unregisterRoute = useCallback((code: string) => {
    const newRoutes = new Map(state.routes);
    newRoutes.delete(code);
    // Update state with new routes map
    // This would need to be handled in the reducer
  }, [state.routes]);

  const getRoute = useCallback((code: string) => {
    return state.routes.get(code);
  }, [state.routes]);

  const findRouteByPath = useCallback((path: string) => {
    for (const route of state.routes.values()) {
      if (route.path === path || (route.exact && route.path === path)) {
        return route;
      }
      // Add more sophisticated path matching here
    }
    return undefined;
  }, [state.routes]);

  // ===== GUARD MANAGEMENT =====

  const registerGuard = useCallback((guard: any) => {
    const newGuards = new Map(state.guards);
    newGuards.set(guard.name, guard);
    // Update state with new guards map
  }, [state.guards]);

  const unregisterGuard = useCallback((name: string) => {
    const newGuards = new Map(state.guards);
    newGuards.delete(name);
    // Update state with new guards map
  }, [state.guards]);

  // ===== LAYOUT MANAGEMENT =====

  const registerLayout = useCallback((type: LayoutType, component: React.ComponentType<any>) => {
    const newLayouts = new Map(state.layouts);
    newLayouts.set(type, component);
    // Update state with new layouts map
  }, [state.layouts]);

  const unregisterLayout = useCallback((type: LayoutType) => {
    const newLayouts = new Map(state.layouts);
    newLayouts.delete(type);
    // Update state with new layouts map
  }, [state.layouts]);

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

      // Cache component
      dispatch({ 
        type: 'CACHE_COMPONENT', 
        payload: { route: route.code, component } 
      });

      return {
        route,
        status: 'resolved',
        component,
        guards: [],
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
  }, [findRouteByPath]);

  const preloadRoute = useCallback(async (path: string) => {
    if (state.preloadedRoutes.has(path)) return;
    
    try {
      await resolveRoute(path);
      dispatch({ type: 'PRELOAD_ROUTE', payload: path });
    } catch (error) {
      console.warn(`Failed to preload route: ${path}`, error);
    }
  }, [resolveRoute, state.preloadedRoutes]);

  // ===== NAVIGATION =====

  const handleNavigate = useCallback((path: string, options: { replace?: boolean; state?: any } = {}) => {
    dispatch({ type: 'NAVIGATE_START', payload: { path, route: findRouteByPath(path) || {} as RouteConfig } });
    
    navigate(path, options);
    dispatch({ type: 'ADD_TO_HISTORY', payload: path });
  }, [navigate, findRouteByPath]);

  const goBack = useCallback(() => {
    if (state.history.length > 1) {
      const previousPath = state.history[state.history.length - 2];
      handleNavigate(previousPath, { replace: true });
    }
  }, [state.history, handleNavigate]);

  const goForward = useCallback(() => {
    // Implementation for forward navigation
    // This would require maintaining a forward history
  }, []);

  // ===== PERMISSION CHECKS =====

  const hasPermission = useCallback((permission: string): boolean => {
    return auth.hasPermission(permission);
  }, [auth]);

  const hasRole = useCallback((role: RouteRole): boolean => {
    return auth.hasRole(role);
  }, [auth]);

  const canAccess = useCallback((route: RouteConfig): boolean => {
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

    return true;
  }, [auth]);

  // ===== STATE MANAGEMENT =====

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const clearHistory = useCallback(() => {
    dispatch({ type: 'CLEAR_HISTORY' });
  }, []);

  const clearCache = useCallback(() => {
    dispatch({ type: 'CLEAR_CACHE' });
  }, []);

  // ===== INITIALIZE ROUTES =====

  useEffect(() => {
    initialRoutes.forEach(route => {
      registerRoute(route);
    });
  }, [initialRoutes, registerRoute]);

  // ===== CONTEXT VALUE =====

  const contextValue: RouterContextValue = useMemo(() => ({
    ...state,
    navigate: handleNavigate,
    goBack,
    goForward,
    registerRoute,
    unregisterRoute,
    getRoute,
    findRouteByPath,
    registerGuard,
    unregisterGuard,
    registerLayout,
    unregisterLayout,
    resolveRoute,
    preloadRoute,
    hasPermission,
    hasRole,
    canAccess,
    clearError,
    clearHistory,
    clearCache,
  }), [
    state,
    handleNavigate,
    goBack,
    goForward,
    registerRoute,
    unregisterRoute,
    getRoute,
    findRouteByPath,
    registerGuard,
    unregisterGuard,
    registerLayout,
    unregisterLayout,
    resolveRoute,
    preloadRoute,
    hasPermission,
    hasRole,
    canAccess,
    clearError,
    clearHistory,
    clearCache,
  ]);

  return (
    <RouterContext.Provider value={contextValue}>
      {children}
    </RouterContext.Provider>
  );
};

// ===== ROUTER HOOK =====

export const useRouter = (): RouterContextValue => {
  const context = useContext(RouterContext);
  if (context === undefined) {
    throw new Error('useRouter must be used within a DynamicRouterProvider');
  }
  return context;
};

// ===== ROUTE RENDERER =====

interface RouteRendererProps {
  route: RouteConfig;
  children?: React.ReactNode;
}

const RouteRenderer: React.FC<RouteRendererProps> = ({ route, children }) => {
  const router = useRouter();
  const [resolution, setResolution] = React.useState<RouteResolution | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  useEffect(() => {
    const loadRoute = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const routeResolution = await router.resolveRoute(route.path);
        setResolution(routeResolution);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadRoute();
  }, [route.path, router]);

  if (loading) {
    return route.fallback ? <route.fallback /> : <div>Loading...</div>;
  }

  if (error || !resolution) {
    return <div>Error loading route: {error?.message}</div>;
  }

  if (resolution.status === 'error') {
    return <div>Route error: {resolution.error?.message}</div>;
  }

  if (!resolution.component) {
    return <div>Component not found</div>;
  }

  const Component = resolution.component;

  return (
    <RouteErrorBoundary route={route} onError={route.onError}>
      <GuardComposer route={route}>
        <LayoutWrapper layout={route.layout} config={route.layoutConfig}>
          <Component />
          {children}
        </LayoutWrapper>
      </GuardComposer>
    </RouteErrorBoundary>
  );
};

// ===== MAIN DYNAMIC ROUTER =====

interface DynamicRouterProps {
  routes: RouteConfig[];
  fallback?: React.ComponentType<any>;
  errorBoundary?: React.ComponentType<any>;
}

export const DynamicRouter: React.FC<DynamicRouterProps> = ({
  routes,
  fallback: Fallback = () => <div>Loading...</div>,
  errorBoundary: ErrorBoundary = RouteErrorBoundary,
}) => {
  return (
    <DynamicRouterProvider initialRoutes={routes}>
      <Suspense fallback={<Fallback />}>
        <Routes>
          {routes.map((route) => (
            <Route
              key={route.code}
              path={route.path}
              element={
                <ErrorBoundary route={route}>
                  <RouteRenderer route={route} />
                </ErrorBoundary>
              }
            />
          ))}
          <Route path="*" element={<div>Not Found</div>} />
        </Routes>
      </Suspense>
    </DynamicRouterProvider>
  );
};

export default DynamicRouter;
