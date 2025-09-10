import { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole } from './security';

// Permission constants
export const PERMISSIONS = {
  // Dashboard permissions
  DASHBOARD_READ: 'dashboard.read',
  DASHBOARD_WRITE: 'dashboard.write',
  
  // User management permissions
  USER_READ: 'user.read',
  USER_WRITE: 'user.write',
  USER_DELETE: 'user.delete',
  
  // Admin permissions
  ADMIN_READ: 'admin.read',
  ADMIN_WRITE: 'admin.write',
  ADMIN_DELETE: 'admin.delete',
  
  // Tenant permissions
  TENANT_READ: 'tenant.read',
  TENANT_WRITE: 'tenant.write',
  TENANT_DELETE: 'tenant.delete',
  
  // System permissions
  SYSTEM_READ: 'system.read',
  SYSTEM_WRITE: 'system.write',
  SYSTEM_DELETE: 'system.delete',
} as const;

// Role constants
export const ROLES = {
  GUEST: 'guest',
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const;

// Permission groups
export const PERMISSION_GROUPS = {
  DASHBOARD: [PERMISSIONS.DASHBOARD_READ, PERMISSIONS.DASHBOARD_WRITE],
  USER_MANAGEMENT: [PERMISSIONS.USER_READ, PERMISSIONS.USER_WRITE, PERMISSIONS.USER_DELETE],
  ADMIN: [PERMISSIONS.ADMIN_READ, PERMISSIONS.ADMIN_WRITE, PERMISSIONS.ADMIN_DELETE],
  TENANT: [PERMISSIONS.TENANT_READ, PERMISSIONS.TENANT_WRITE, PERMISSIONS.TENANT_DELETE],
  SYSTEM: [PERMISSIONS.SYSTEM_READ, PERMISSIONS.SYSTEM_WRITE, PERMISSIONS.SYSTEM_DELETE],
} as const;

// Role hierarchy
export const ROLE_HIERARCHY = {
  [ROLES.GUEST]: [],
  [ROLES.USER]: [PERMISSIONS.DASHBOARD_READ],
  [ROLES.ADMIN]: [
    ...PERMISSION_GROUPS.DASHBOARD,
    ...PERMISSION_GROUPS.USER_MANAGEMENT,
    ...PERMISSION_GROUPS.ADMIN,
  ],
  [ROLES.SUPER_ADMIN]: [
    ...Object.values(PERMISSIONS),
  ],
} as const;

// Permission checking utilities
export const checkPermission = (userPermissions: string[], requiredPermission: string): boolean => {
  return hasPermission(userPermissions, requiredPermission);
};

export const checkAnyPermission = (userPermissions: string[], requiredPermissions: string[]): boolean => {
  return hasAnyPermission(userPermissions, requiredPermissions);
};

export const checkAllPermissions = (userPermissions: string[], requiredPermissions: string[]): boolean => {
  return hasAllPermissions(userPermissions, requiredPermissions);
};

export const checkRole = (userRoles: string[], requiredRole: string): boolean => {
  return hasRole(userRoles, requiredRole);
};

export const checkAnyRole = (userRoles: string[], requiredRoles: string[]): boolean => {
  return hasAnyRole(userRoles, requiredRoles);
};

// Get permissions for a role
export const getPermissionsForRole = (role: string): string[] => {
  return ROLE_HIERARCHY[role as keyof typeof ROLE_HIERARCHY] || [];
};

// Check if user has permission through role
export const hasPermissionThroughRole = (userRole: string, requiredPermission: string): boolean => {
  const rolePermissions = getPermissionsForRole(userRole);
  return hasPermission(rolePermissions, requiredPermission);
};

// Check if user can access a feature
export const canAccessFeature = (userPermissions: string[], userRoles: string[], feature: string): boolean => {
  // Check direct permission
  if (hasPermission(userPermissions, feature)) {
    return true;
  }
  
  // Check through roles
  return userRoles.some(role => hasPermissionThroughRole(role, feature));
};

// Get user's effective permissions (permissions + role permissions)
export const getEffectivePermissions = (userPermissions: string[], userRoles: string[]): string[] => {
  const rolePermissions = userRoles.flatMap(role => getPermissionsForRole(role));
  return [...new Set([...userPermissions, ...rolePermissions])];
};

// Permission decorator for components
export const withPermission = (requiredPermission: string) => {
  return <P extends object>(Component: React.ComponentType<P>) => {
    return (props: P & { userPermissions?: string[]; userRoles?: string[] }) => {
      const { userPermissions = [], userRoles = [], ...restProps } = props;
      
      if (!canAccessFeature(userPermissions, userRoles, requiredPermission)) {
        return null;
      }
      
      return <Component {...(restProps as P)} />;
    };
  };
};

// Role decorator for components
export const withRole = (requiredRole: string) => {
  return <P extends object>(Component: React.ComponentType<P>) => {
    return (props: P & { userRoles?: string[] }) => {
      const { userRoles = [], ...restProps } = props;
      
      if (!hasRole(userRoles, requiredRole)) {
        return null;
      }
      
      return <Component {...(restProps as P)} />;
    };
  };
};
