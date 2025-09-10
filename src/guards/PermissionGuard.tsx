// src/guards/PermissionGuard.tsx
import { BaseGuard } from './BaseGuard';

import type { GuardContext, GuardResult, Permission } from '@/types/routing';

// ===== PERMISSION GUARD =====

export class PermissionGuard extends BaseGuard {
  name = 'PermissionGuard';
  priority = 80;

  canActivate(context: GuardContext): GuardResult {
    const { user, permissions } = context;
    const { security } = context.route;

    // Check if permission-based access is required
    if (!security?.permissions || security.permissions.length === 0) {
      return this.allow();
    }

    // Check if user is authenticated
    if (!this.isAuthenticated(user)) {
      return this.deny(
        'Authentication required for permissions',
        '/login',
        { 
          reason: 'not_authenticated',
          requiredPermissions: security.permissions 
        }
      );
    }

    // Check if user has required permissions
    if (!this.hasPermission(user, security.permissions)) {
      return this.deny(
        'Insufficient permissions',
        '/unauthorized',
        { 
          reason: 'insufficient_permissions',
          userPermissions: user.permissions,
          requiredPermissions: security.permissions 
        }
      );
    }

    // Check permission hierarchy
    if (!this.checkPermissionHierarchy(permissions, security.permissions)) {
      return this.deny(
        'Permission hierarchy violation',
        '/unauthorized',
        { 
          reason: 'permission_hierarchy_violation',
          requiredPermissions: security.permissions 
        }
      );
    }

    // Check resource-specific permissions
    if (!this.checkResourcePermissions(user, context.route, security.permissions)) {
      return this.deny(
        'Resource access denied',
        '/unauthorized',
        { 
          reason: 'resource_access_denied',
          resource: context.route.code,
          requiredPermissions: security.permissions 
        }
      );
    }

    // Check time-based permission access
    if (this.isPermissionTimeRestricted(security.permissions)) {
      return this.deny(
        'Permission time restricted',
        '/time-restricted',
        { 
          reason: 'permission_time_restricted',
          requiredPermissions: security.permissions 
        }
      );
    }

    // Check conditional permissions
    if (!this.checkConditionalPermissions(user, context, security.permissions)) {
      return this.deny(
        'Conditional permission not met',
        '/unauthorized',
        { 
          reason: 'conditional_permission_not_met',
          requiredPermissions: security.permissions 
        }
      );
    }

    return this.allow({
      userPermissions: user.permissions,
      requiredPermissions: security.permissions,
    });
  }

  // Check permission hierarchy
  private checkPermissionHierarchy(userPermissions: Permission[], requiredPermissions: Permission[]): boolean {
    const permissionHierarchy: Record<string, string[]> = {
      'admin:all': ['admin:read', 'admin:write', 'admin:delete'],
      'admin:write': ['admin:read'],
      'admin:delete': ['admin:read', 'admin:write'],
      'user:all': ['user:read', 'user:write'],
      'user:write': ['user:read'],
      'moderator:all': ['moderator:read', 'moderator:write', 'moderator:delete'],
      'moderator:write': ['moderator:read'],
      'moderator:delete': ['moderator:read', 'moderator:write'],
    };

    return requiredPermissions.every(required => {
      // Direct permission
      if (userPermissions.includes(required)) return true;
      
      // Check hierarchy
      const hierarchy = permissionHierarchy[required];
      if (hierarchy) {
        return hierarchy.some(perm => userPermissions.includes(perm));
      }
      
      return false;
    });
  }

  // Check resource-specific permissions
  private checkResourcePermissions(user: any, route: any, requiredPermissions: Permission[]): boolean {
    // Check if user has resource-specific permissions
    const resourcePermissions = user.resourcePermissions || {};
    const routeResource = route.code;
    
    if (resourcePermissions[routeResource]) {
      return requiredPermissions.every(perm => 
        resourcePermissions[routeResource].includes(perm)
      );
    }
    
    // Fallback to global permissions
    return this.hasPermission(user, requiredPermissions);
  }

  // Check if permission is time-restricted
  private isPermissionTimeRestricted(permissions: Permission[]): boolean {
    const timeRestrictedPermissions = [
      'admin:maintenance',
      'admin:backup',
      'admin:audit',
    ];
    
    return permissions.some(perm => timeRestrictedPermissions.includes(perm));
  }

  // Check conditional permissions
  private checkConditionalPermissions(user: any, context: GuardContext, requiredPermissions: Permission[]): boolean {
    // Check if user meets conditions for specific permissions
    const conditionalPermissions: Record<string, (user: any, context: GuardContext) => boolean> = {
      'admin:financial': (user, context) => user.department === 'finance' || user.role === 'super_admin',
      'admin:hr': (user, context) => user.department === 'hr' || user.role === 'super_admin',
      'admin:it': (user, context) => user.department === 'it' || user.role === 'super_admin',
      'user:own_data': (user, context) => context.route.params?.userId === user.id,
      'moderator:content': (user, context) => user.role === 'moderator' || user.role === 'admin',
    };

    return requiredPermissions.every(perm => {
      const condition = conditionalPermissions[perm];
      if (condition) {
        return condition(user, context);
      }
      return true; // No condition, allow
    });
  }

  // Check permission delegation
  private hasDelegatedPermissions(user: any, requiredPermissions: Permission[]): boolean {
    if (!user.delegatedPermissions) return false;
    
    return requiredPermissions.every(perm => 
      user.delegatedPermissions.includes(perm)
    );
  }

  // Check temporary permissions
  private hasTemporaryPermissions(user: any, requiredPermissions: Permission[]): boolean {
    if (!user.temporaryPermissions) return false;
    
    const now = new Date();
    return requiredPermissions.every(perm => {
      const tempPerm = user.temporaryPermissions[perm];
      if (!tempPerm) return false;
      
      const expiresAt = new Date(tempPerm.expiresAt);
      return now < expiresAt;
    });
  }

  // Check permission inheritance
  private hasInheritedPermissions(user: any, requiredPermissions: Permission[]): boolean {
    if (!user.inheritedPermissions) return false;
    
    return requiredPermissions.every(perm => 
      user.inheritedPermissions.includes(perm)
    );
  }

  // Get permission context
  private getPermissionContext(user: any, context: GuardContext): Record<string, any> {
    return {
      userId: user.id,
      role: user.role,
      department: user.department,
      tenantId: user.tenantId,
      route: context.route.code,
      timestamp: new Date().toISOString(),
    };
  }
}

// ===== PERMISSION GUARD INSTANCE =====

export const permissionGuard = new PermissionGuard();
