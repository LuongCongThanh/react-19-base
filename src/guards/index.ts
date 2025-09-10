// src/guards/index.ts
export { BaseGuard, GuardWrapper, useGuard } from './BaseGuard';
export { AuthGuard, authGuard } from './AuthGuard';
export { RoleGuard, roleGuard } from './RoleGuard';
export { PermissionGuard, permissionGuard } from './PermissionGuard';
export { TenantGuard, tenantGuard } from './TenantGuard';
export { CSRFGuard, csrfGuard } from './CSRFGuard';

// ===== GUARD REGISTRY =====

import { authGuard } from './AuthGuard';
import { Guard } from './BaseGuard';
import { csrfGuard } from './CSRFGuard';
import { permissionGuard } from './PermissionGuard';
import { roleGuard } from './RoleGuard';
import { tenantGuard } from './TenantGuard';

export class GuardRegistry {
  private static guards: Map<string, Guard> = new Map();
  private static initialized = false;

  static initialize(): void {
    if (this.initialized) {return;}

    // Register default guards
    this.register(authGuard);
    this.register(roleGuard);
    this.register(permissionGuard);
    this.register(tenantGuard);
    this.register(csrfGuard);

    this.initialized = true;
  }

  static register(guard: Guard): void {
    this.guards.set(guard.name, guard);
  }

  static unregister(guardName: string): void {
    this.guards.delete(guardName);
  }

  static get(guardName: string): Guard | undefined {
    return this.guards.get(guardName);
  }

  static getAll(): Guard[] {
    return Array.from(this.guards.values());
  }

  static getByPriority(): Guard[] {
    return this.getAll().sort((a, b) => b.priority - a.priority);
  }

  static getRequiredGuards(routeConfig: any): Guard[] {
    const { security } = routeConfig;
    if (!security) {return [];}

    const requiredGuards: Guard[] = [];

    // Always include AuthGuard if roles are specified
    if (security.roles && security.roles.length > 0) {
      requiredGuards.push(authGuard);
    }

    // Include RoleGuard if roles are specified
    if (security.roles && security.roles.length > 0) {
      requiredGuards.push(roleGuard);
    }

    // Include PermissionGuard if permissions are specified
    if (security.permissions && security.permissions.length > 0) {
      requiredGuards.push(permissionGuard);
    }

    // Include TenantGuard if tenant is required
    if (security.tenantRequired) {
      requiredGuards.push(tenantGuard);
    }

    // Include CSRFGuard if CSRF is required
    if (security.csrfRequired) {
      requiredGuards.push(csrfGuard);
    }

    return requiredGuards;
  }

  static clear(): void {
    this.guards.clear();
    this.initialized = false;
  }
}

// Initialize guard registry
GuardRegistry.initialize();

// ===== GUARD UTILITIES =====

export const createCustomGuard = (
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

export const combineGuards = (...guards: Guard[]): Guard => ({
  name: 'CombinedGuard',
  priority: 0,
  canActivate: async (context) => {
    for (const guard of guards) {
      const result = await guard.canActivate(context);
      if (!result.allowed) {
        return result;
      }
    }
    return { allowed: true };
  },
  canDeactivate: async (context) => {
    for (const guard of guards) {
      const result = await guard.canDeactivate?.(context);
      if (result && !result.allowed) {
        return result;
      }
    }
    return { allowed: true };
  },
});

// ===== EXPORT ALL =====

export * from './BaseGuard';
export * from './AuthGuard';
export * from './RoleGuard';
export * from './PermissionGuard';
export * from './TenantGuard';
export * from './CSRFGuard';
