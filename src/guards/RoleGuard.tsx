// src/guards/RoleGuard.tsx
import { BaseGuard } from './BaseGuard';

import type { GuardContext, GuardResult, RouteRole } from '@/types/routing';

// ===== ROLE GUARD =====

export class RoleGuard extends BaseGuard {
  name = 'RoleGuard';
  priority = 90;

  canActivate(context: GuardContext): GuardResult {
    const { user } = context;
    const { security } = context.route;

    // Check if role-based access is required
    if (!security?.roles || security.roles.length === 0) {
      return this.allow();
    }

    // Allow guest access if explicitly allowed
    if (security.roles.includes('guest')) {
      return this.allow();
    }

    // Check if user is authenticated
    if (!this.isAuthenticated(user)) {
      return this.deny(
        'Authentication required for this role',
        '/login',
        { 
          reason: 'not_authenticated',
          requiredRoles: security.roles 
        }
      );
    }

    // Check if user has required role
    if (!this.hasRole(user, security.roles)) {
      return this.deny(
        'Insufficient role permissions',
        this.getRedirectPath(user.role),
        { 
          reason: 'insufficient_role',
          userRole: user.role,
          requiredRoles: security.roles 
        }
      );
    }

    // Check role hierarchy for admin routes
    if (security.roles.includes('admin') && !this.hasAdminAccess(user)) {
      return this.deny(
        'Admin access required',
        '/unauthorized',
        { 
          reason: 'admin_access_required',
          userRole: user.role 
        }
      );
    }

    // Check role-specific restrictions
    if (this.hasRoleRestrictions(user, security.roles)) {
      return this.deny(
        'Role restrictions apply',
        '/restricted',
        { 
          reason: 'role_restrictions',
          restrictions: this.getRoleRestrictions(user.role) 
        }
      );
    }

    // Check time-based role access
    if (this.isTimeRestricted(user, security.roles)) {
      return this.deny(
        'Access restricted by time',
        '/time-restricted',
        { 
          reason: 'time_restricted',
          allowedHours: this.getAllowedHours(user.role) 
        }
      );
    }

    return this.allow({
      userRole: user.role,
      requiredRoles: security.roles,
    });
  }

  // Check if user has admin access
  private hasAdminAccess(user: any): boolean {
    const adminRoles: RouteRole[] = ['admin', 'super_admin'];
    return adminRoles.includes(user.role);
  }

  // Check if user has role restrictions
  private hasRoleRestrictions(user: any, requiredRoles: string[]): boolean {
    const restrictions = this.getRoleRestrictions(user.role);
    return restrictions && restrictions.length > 0;
  }

  // Get role-specific restrictions
  private getRoleRestrictions(role: string): string[] {
    const roleRestrictions: Record<string, string[]> = {
      'user': ['no_admin_access', 'limited_data_access'],
      'moderator': ['no_super_admin_access'],
      'admin': [],
      'super_admin': [],
      'guest': ['no_authenticated_access'],
    };
    
    return roleRestrictions[role] || [];
  }

  // Check if access is time-restricted
  private isTimeRestricted(user: any, requiredRoles: string[]): boolean {
    const allowedHours = this.getAllowedHours(user.role);
    if (!allowedHours) return false;
    
    const now = new Date();
    const currentHour = now.getHours();
    
    return !allowedHours.includes(currentHour);
  }

  // Get allowed hours for role
  private getAllowedHours(role: string): number[] | null {
    const roleHours: Record<string, number[]> = {
      'user': [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], // 8 AM - 6 PM
      'moderator': [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21], // 6 AM - 9 PM
      'admin': null, // 24/7 access
      'super_admin': null, // 24/7 access
    };
    
    return roleHours[role] || null;
  }

  // Get redirect path based on user role
  private getRedirectPath(userRole: string): string {
    const redirectPaths: Record<string, string> = {
      'guest': '/login',
      'user': '/dashboard',
      'moderator': '/moderator-dashboard',
      'admin': '/admin-dashboard',
      'super_admin': '/super-admin-dashboard',
    };
    
    return redirectPaths[userRole] || '/unauthorized';
  }

  // Check role delegation
  private hasDelegatedAccess(user: any, requiredRoles: string[]): boolean {
    if (!user.delegatedRoles) return false;
    
    return requiredRoles.some(role => user.delegatedRoles.includes(role));
  }

  // Check emergency access
  private hasEmergencyAccess(user: any, requiredRoles: string[]): boolean {
    if (!user.emergencyAccess) return false;
    
    const now = new Date();
    const emergencyExpiry = new Date(user.emergencyAccess.expiresAt);
    
    return now < emergencyExpiry && requiredRoles.includes(user.emergencyAccess.role);
  }
}

// ===== ROLE GUARD INSTANCE =====

export const roleGuard = new RoleGuard();
