// src/router/LayoutWrapper.tsx
import React, { createContext, useContext, useCallback, useMemo, useEffect, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from './DynamicRouter';
import { LayoutRegistry } from '@/layouts';

import type { 
  LayoutType, 
  LayoutConfig, 
  LayoutContext,
  RouteConfig
} from '@/types/routing';

// ===== LAYOUT WRAPPER CONTEXT =====

interface LayoutWrapperContextValue {
  // Layout management
  getLayout: (type: LayoutType) => React.ComponentType<any> | undefined;
  registerLayout: (type: LayoutType, component: React.ComponentType<any>) => void;
  unregisterLayout: (type: LayoutType) => void;
  
  // Layout state
  currentLayout: LayoutType | null;
  layoutConfig: LayoutConfig | null;
  isLayoutLoading: boolean;
  layoutError: Error | null;
  
  // Layout utilities
  createLayoutConfig: (type: LayoutType, config?: any, tenant?: any) => LayoutConfig;
  validateLayout: (type: LayoutType) => boolean;
  getLayoutContext: (route: RouteConfig) => LayoutContext;
}

const LayoutWrapperContext = createContext<LayoutWrapperContextValue | undefined>(undefined);

// ===== LAYOUT WRAPPER PROVIDER =====

interface LayoutWrapperProviderProps {
  children: React.ReactNode;
}

export const LayoutWrapperProvider: React.FC<LayoutWrapperProviderProps> = ({
  children,
}) => {
  const auth = useAuth();
  const router = useRouter();

  const [currentLayout, setCurrentLayout] = useState<LayoutType | null>(null);
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig | null>(null);
  const [isLayoutLoading, setIsLayoutLoading] = useState(false);
  const [layoutError, setLayoutError] = useState<Error | null>(null);

  // ===== LAYOUT MANAGEMENT =====

  const getLayout = useCallback((type: LayoutType): React.ComponentType<any> | undefined => {
    return LayoutRegistry.get(type);
  }, []);

  const registerLayout = useCallback((type: LayoutType, component: React.ComponentType<any>) => {
    LayoutRegistry.register(type, component);
  }, []);

  const unregisterLayout = useCallback((type: LayoutType) => {
    LayoutRegistry.unregister(type);
  }, []);

  // ===== LAYOUT UTILITIES =====

  const createLayoutConfig = useCallback((
    type: LayoutType, 
    config: any = {}, 
    tenant: any = null
  ): LayoutConfig => {
    return {
      type,
      config: {
        theme: 'default',
        features: [],
        ...config,
      },
      tenant,
    };
  }, []);

  const validateLayout = useCallback((type: LayoutType): boolean => {
    const layout = getLayout(type);
    return layout !== undefined;
  }, [getLayout]);

  const getLayoutContext = useCallback((route: RouteConfig): LayoutContext => {
    return {
      layout: layoutConfig || createLayoutConfig(route.layout),
      route,
      user: auth.user,
      tenant: null, // TODO: Add tenant context
      permissions: auth.permissions,
    };
  }, [layoutConfig, createLayoutConfig, auth]);

  // ===== CONTEXT VALUE =====

  const contextValue: LayoutWrapperContextValue = useMemo(() => ({
    getLayout,
    registerLayout,
    unregisterLayout,
    currentLayout,
    layoutConfig,
    isLayoutLoading,
    layoutError,
    createLayoutConfig,
    validateLayout,
    getLayoutContext,
  }), [
    getLayout,
    registerLayout,
    unregisterLayout,
    currentLayout,
    layoutConfig,
    isLayoutLoading,
    layoutError,
    createLayoutConfig,
    validateLayout,
    getLayoutContext,
  ]);

  return (
    <LayoutWrapperContext.Provider value={contextValue}>
      {children}
    </LayoutWrapperContext.Provider>
  );
};

// ===== LAYOUT WRAPPER HOOK =====

export const useLayoutWrapper = (): LayoutWrapperContextValue => {
  const context = useContext(LayoutWrapperContext);
  if (context === undefined) {
    throw new Error('useLayoutWrapper must be used within a LayoutWrapperProvider');
  }
  return context;
};

// ===== LAYOUT WRAPPER COMPONENT =====

interface LayoutWrapperProps {
  layout: LayoutType;
  children: React.ReactNode;
  config?: any;
  tenant?: any;
  fallback?: React.ComponentType<any>;
  onError?: (error: Error) => void;
}

export const LayoutWrapper: React.FC<LayoutWrapperProps> = ({
  layout,
  children,
  config = {},
  tenant = null,
  fallback: Fallback,
  onError,
}) => {
  const { 
    getLayout, 
    createLayoutConfig, 
    validateLayout, 
    getLayoutContext 
  } = useLayoutWrapper();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [LayoutComponent, setLayoutComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    const loadLayout = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Validate layout
        if (!validateLayout(layout)) {
          throw new Error(`Layout ${layout} not found`);
        }

        // Get layout component
        const component = getLayout(layout);
        if (!component) {
          throw new Error(`Layout component ${layout} not available`);
        }

        setLayoutComponent(() => component);
      } catch (err) {
        const error = err as Error;
        setError(error);
        onError?.(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLayout();
  }, [layout, validateLayout, getLayout, onError]);

  // Show loading state
  if (isLoading) {
    return Fallback ? <Fallback /> : <div>Loading layout...</div>;
  }

  // Show error state
  if (error || !LayoutComponent) {
    return (
      <div>
        Layout error: {error?.message || `Layout ${layout} not found`}
      </div>
    );
  }

  // Create layout configuration
  const layoutConfig = createLayoutConfig(layout, config, tenant);

  // Render layout with children
  return (
    <LayoutComponent 
      config={layoutConfig.config}
      tenant={layoutConfig.tenant}
      layout={layoutConfig.type}
    >
      {children}
    </LayoutComponent>
  );
};

// ===== LAYOUT SWITCHER COMPONENT =====

interface LayoutSwitcherProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<any>;
  onLayoutChange?: (from: LayoutType, to: LayoutType) => void;
}

export const LayoutSwitcher: React.FC<LayoutSwitcherProps> = ({
  children,
  fallback: Fallback,
  onLayoutChange,
}) => {
  const router = useRouter();
  const { getLayoutContext } = useLayoutWrapper();
  const [currentLayout, setCurrentLayout] = useState<LayoutType | null>(null);

  useEffect(() => {
    if (router.currentRoute) {
      const newLayout = router.currentRoute.layout;
      if (newLayout !== currentLayout) {
        if (currentLayout && onLayoutChange) {
          onLayoutChange(currentLayout, newLayout);
        }
        setCurrentLayout(newLayout);
      }
    }
  }, [router.currentRoute, currentLayout, onLayoutChange]);

  if (!router.currentRoute) {
    return Fallback ? <Fallback /> : <div>No route selected</div>;
  }

  const route = router.currentRoute;
  const layoutContext = getLayoutContext(route);

  return (
    <LayoutWrapper
      layout={route.layout}
      config={route.layoutConfig}
      tenant={layoutContext.tenant}
    >
      {children}
    </LayoutWrapper>
  );
};

// ===== LAYOUT GUARD COMPONENT =====

interface LayoutGuardProps {
  allowedLayouts: LayoutType[];
  children: React.ReactNode;
  fallback?: React.ComponentType<any>;
  onUnauthorized?: (currentLayout: LayoutType) => void;
}

export const LayoutGuard: React.FC<LayoutGuardProps> = ({
  allowedLayouts,
  children,
  fallback: Fallback,
  onUnauthorized,
}) => {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (router.currentRoute) {
      const currentLayout = router.currentRoute.layout;
      const authorized = allowedLayouts.includes(currentLayout);
      
      setIsAuthorized(authorized);
      
      if (!authorized && onUnauthorized) {
        onUnauthorized(currentLayout);
      }
    }
  }, [router.currentRoute, allowedLayouts, onUnauthorized]);

  if (isAuthorized === null) {
    return Fallback ? <Fallback /> : <div>Checking layout permissions...</div>;
  }

  if (!isAuthorized) {
    return (
      <div>
        Layout not authorized: {router.currentRoute?.layout} not in {allowedLayouts.join(', ')}
      </div>
    );
  }

  return <>{children}</>;
};

export default LayoutWrapper;
