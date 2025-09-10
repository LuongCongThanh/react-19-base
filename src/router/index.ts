// src/router/index.ts
export { DynamicRouter, DynamicRouterProvider, useRouter } from './DynamicRouter';
export { RouteResolver, RouteResolverProvider, useRouteResolver } from './RouteResolver';
export { GuardComposer, GuardComposerProvider, useGuardComposer, GuardWrapper } from './GuardComposer';
export { LayoutWrapper, LayoutWrapperProvider, useLayoutWrapper, LayoutSwitcher, LayoutGuard } from './LayoutWrapper';
export { RouteErrorBoundary, RouteErrorBoundaryWrapper, useRouteErrorBoundary } from './RouteErrorBoundary';

// ===== ROUTER REGISTRY =====

import { RouteConfig, LayoutType, Guard } from '@/types/routing';
import { DynamicRouterProvider } from './DynamicRouter';
import { RouteResolverProvider } from './RouteResolver';
import { GuardComposerProvider } from './GuardComposer';
import { LayoutWrapperProvider } from './LayoutWrapper';

export class RouterRegistry {
  private static routes: Map<string, RouteConfig> = new Map();
  private static layouts: Map<LayoutType, React.ComponentType<any>> = new Map();
  private static guards: Map<string, Guard> = new Map();
  private static initialized = false;

  static initialize(): void {
    if (this.initialized) return;

    // Initialize default routes, layouts, and guards
    this.initializeDefaultRoutes();
    this.initializeDefaultLayouts();
    this.initializeDefaultGuards();

    this.initialized = true;
  }

  // ===== ROUTE MANAGEMENT =====

  static registerRoute(route: RouteConfig): void {
    this.routes.set(route.code, route);
  }

  static unregisterRoute(code: string): void {
    this.routes.delete(code);
  }

  static getRoute(code: string): RouteConfig | undefined {
    return this.routes.get(code);
  }

  static getAllRoutes(): RouteConfig[] {
    return Array.from(this.routes.values());
  }

  static findRouteByPath(path: string): RouteConfig | undefined {
    for (const route of this.routes.values()) {
      if (route.path === path || (route.exact && route.path === path)) {
        return route;
      }
    }
    return undefined;
  }

  static findRoutesByRole(role: string): RouteConfig[] {
    return this.getAllRoutes().filter(route => 
      !route.security.roles || route.security.roles.includes(role as any)
    );
  }

  static findRoutesByPermission(permission: string): RouteConfig[] {
    return this.getAllRoutes().filter(route => 
      !route.security.permissions || route.security.permissions.includes(permission)
    );
  }

  // ===== LAYOUT MANAGEMENT =====

  static registerLayout(type: LayoutType, component: React.ComponentType<any>): void {
    this.layouts.set(type, component);
  }

  static unregisterLayout(type: LayoutType): void {
    this.layouts.delete(type);
  }

  static getLayout(type: LayoutType): React.ComponentType<any> | undefined {
    return this.layouts.get(type);
  }

  static getAllLayouts(): Map<LayoutType, React.ComponentType<any>> {
    return new Map(this.layouts);
  }

  // ===== GUARD MANAGEMENT =====

  static registerGuard(guard: Guard): void {
    this.guards.set(guard.name, guard);
  }

  static unregisterGuard(name: string): void {
    this.guards.delete(name);
  }

  static getGuard(name: string): Guard | undefined {
    return this.guards.get(name);
  }

  static getAllGuards(): Guard[] {
    return Array.from(this.guards.values());
  }

  static getGuardsByPriority(): Guard[] {
    return this.getAllGuards().sort((a, b) => b.priority - a.priority);
  }

  static getRequiredGuards(route: RouteConfig): Guard[] {
    const { security } = route;
    if (!security) return [];

    const requiredGuards: Guard[] = [];

    // Always include AuthGuard if roles are specified
    if (security.roles && security.roles.length > 0) {
      const authGuard = this.getGuard('auth');
      if (authGuard) requiredGuards.push(authGuard);
    }

    // Include RoleGuard if roles are specified
    if (security.roles && security.roles.length > 0) {
      const roleGuard = this.getGuard('role');
      if (roleGuard) requiredGuards.push(roleGuard);
    }

    // Include PermissionGuard if permissions are specified
    if (security.permissions && security.permissions.length > 0) {
      const permissionGuard = this.getGuard('permission');
      if (permissionGuard) requiredGuards.push(permissionGuard);
    }

    // Include TenantGuard if tenant is required
    if (security.tenantRequired) {
      const tenantGuard = this.getGuard('tenant');
      if (tenantGuard) requiredGuards.push(tenantGuard);
    }

    // Include CSRFGuard if CSRF is required
    if (security.csrfRequired) {
      const csrfGuard = this.getGuard('csrf');
      if (csrfGuard) requiredGuards.push(csrfGuard);
    }

    // Include custom guards
    if (security.guards && security.guards.length > 0) {
      security.guards.forEach(guardName => {
        const guard = this.getGuard(guardName);
        if (guard) requiredGuards.push(guard);
      });
    }

    return requiredGuards;
  }

  // ===== INITIALIZATION =====

  private static initializeDefaultRoutes(): void {
    // Default routes will be registered by the application
    // This is a placeholder for future default routes
  }

  private static initializeDefaultLayouts(): void {
    // Default layouts are registered in the layouts module
    // This is a placeholder for future default layouts
  }

  private static initializeDefaultGuards(): void {
    // Default guards are registered in the guards module
    // This is a placeholder for future default guards
  }

  // ===== UTILITIES =====

  static clear(): void {
    this.routes.clear();
    this.layouts.clear();
    this.guards.clear();
    this.initialized = false;
  }

  static getStats(): {
    routeCount: number;
    layoutCount: number;
    guardCount: number;
    initialized: boolean;
  } {
    return {
      routeCount: this.routes.size,
      layoutCount: this.layouts.size,
      guardCount: this.guards.size,
      initialized: this.initialized,
    };
  }
}

// Initialize router registry
RouterRegistry.initialize();

// ===== ROUTER PROVIDER COMPOSER =====

interface RouterProviderComposerProps {
  children: React.ReactNode;
  routes: RouteConfig[];
  layouts?: Map<LayoutType, React.ComponentType<any>>;
  guards?: Guard[];
}

export const RouterProviderComposer: React.FC<RouterProviderComposerProps> = ({
  children,
  routes,
  layouts,
  guards,
}) => {
  // Register routes
  React.useEffect(() => {
    routes.forEach(route => {
      RouterRegistry.registerRoute(route);
    });
  }, [routes]);

  // Register layouts
  React.useEffect(() => {
    if (layouts) {
      layouts.forEach((component, type) => {
        RouterRegistry.registerLayout(type, component);
      });
    }
  }, [layouts]);

  // Register guards
  React.useEffect(() => {
    if (guards) {
      guards.forEach(guard => {
        RouterRegistry.registerGuard(guard);
      });
    }
  }, [guards]);

  return (
    <DynamicRouterProvider initialRoutes={routes}>
      <RouteResolverProvider routes={routes}>
        <GuardComposerProvider>
          <LayoutWrapperProvider>
            {children}
          </LayoutWrapperProvider>
        </GuardComposerProvider>
      </RouteResolverProvider>
    </DynamicRouterProvider>
  );
};

// ===== ROUTER UTILITIES =====

export const createRoute = (config: Omit<RouteConfig, 'component'> & {
  component: () => Promise<{ default: React.ComponentType<any> }>;
}): RouteConfig => {
  return {
    exact: false,
    layout: 'PublicLayout',
    security: { roles: [], permissions: [] },
    meta: { title: '', requiresAuth: false },
    ...config,
  };
};

export const createGuard = (
  name: string,
  priority: number,
  canActivate: (context: any) => Promise<any> | any,
  canDeactivate?: (context: any) => Promise<any> | any
): Guard => ({
  name,
  priority,
  canActivate,
  canDeactivate,
});

export const createLayout = (
  type: LayoutType,
  component: React.ComponentType<any>
): void => {
  RouterRegistry.registerLayout(type, component);
};

// ===== EXPORT ALL =====

export * from './DynamicRouter';
export * from './RouteResolver';
export * from './GuardComposer';
export * from './LayoutWrapper';
export * from './RouteErrorBoundary';
export * from '@/types/routing';
