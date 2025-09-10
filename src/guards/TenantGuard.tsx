// src/guards/TenantGuard.tsx
import { BaseGuard } from './BaseGuard';

import type { GuardContext, GuardResult, TenantId } from '@/types/routing';

// ===== TENANT GUARD =====

export class TenantGuard extends BaseGuard {
  name = 'TenantGuard';
  priority = 70;

  canActivate(context: GuardContext): GuardResult {
    const { user, tenant } = context;
    const { security } = context.route;

    // Check if tenant access is required
    if (!security?.tenantRequired) {
      return this.allow();
    }

    // Check if user is authenticated
    if (!this.isAuthenticated(user)) {
      return this.deny(
        'Authentication required for tenant access',
        '/login',
        { 
          reason: 'not_authenticated',
          tenantRequired: true 
        }
      );
    }

    // Check if user has tenant
    if (!user.tenantId) {
      return this.deny(
        'Tenant membership required',
        '/select-tenant',
        { 
          reason: 'no_tenant_membership',
          tenantRequired: true 
        }
      );
    }

    // Check if tenant is active
    if (!this.isTenantActive(user.tenantId)) {
      return this.deny(
        'Tenant account suspended',
        '/tenant-suspended',
        { 
          reason: 'tenant_suspended',
          tenantId: user.tenantId 
        }
      );
    }

    // Check tenant-specific route access
    if (!this.hasTenantRouteAccess(user, context.route)) {
      return this.deny(
        'Route not available for tenant',
        '/tenant-restricted',
        { 
          reason: 'tenant_route_restricted',
          tenantId: user.tenantId,
          route: context.route.code 
        }
      );
    }

    // Check tenant feature access
    if (!this.hasTenantFeatureAccess(user, context.route)) {
      return this.deny(
        'Feature not available for tenant',
        '/feature-restricted',
        { 
          reason: 'tenant_feature_restricted',
          tenantId: user.tenantId,
          feature: this.getRequiredFeature(context.route) 
        }
      );
    }

    // Check tenant data isolation
    if (!this.checkTenantDataIsolation(user, context)) {
      return this.deny(
        'Data access violation',
        '/unauthorized',
        { 
          reason: 'tenant_data_isolation_violation',
          tenantId: user.tenantId 
        }
      );
    }

    // Check tenant switching security
    if (this.hasRecentTenantSwitch(user)) {
      return this.deny(
        'Recent tenant switch detected',
        '/tenant-switch-security',
        { 
          reason: 'recent_tenant_switch',
          tenantId: user.tenantId,
          lastSwitch: user.lastTenantSwitch 
        }
      );
    }

    return this.allow({
      tenantId: user.tenantId,
      tenantName: tenant?.name,
      tenantFeatures: tenant?.features,
    });
  }

  // Check if tenant is active
  private isTenantActive(tenantId: TenantId): boolean {
    // This would typically check against a tenant service
    // For now, we'll use localStorage as a simple check
    const tenantData = localStorage.getItem(`tenant_${tenantId}`);
    if (!tenantData) return false;
    
    const tenant = JSON.parse(tenantData);
    return tenant.status === 'active';
  }

  // Check tenant-specific route access
  private hasTenantRouteAccess(user: any, route: any): boolean {
    const tenantRoutes = user.tenantRoutes || [];
    const allowedRoutes = user.tenantAllowedRoutes || [];
    
    // Check if route is explicitly allowed for tenant
    if (allowedRoutes.includes(route.code)) return true;
    
    // Check if route is restricted for tenant
    if (tenantRoutes.includes(route.code)) return false;
    
    // Default allow for non-restricted routes
    return true;
  }

  // Check tenant feature access
  private hasTenantFeatureAccess(user: any, route: any): boolean {
    const requiredFeature = this.getRequiredFeature(route);
    if (!requiredFeature) return true;
    
    const tenantFeatures = user.tenantFeatures || [];
    return tenantFeatures.includes(requiredFeature);
  }

  // Get required feature for route
  private getRequiredFeature(route: any): string | null {
    const featureMap: Record<string, string> = {
      'admin-dashboard': 'admin_dashboard',
      'user-management': 'user_management',
      'analytics': 'analytics',
      'reports': 'reporting',
      'billing': 'billing',
      'integrations': 'integrations',
    };
    
    return featureMap[route.code] || null;
  }

  // Check tenant data isolation
  private checkTenantDataIsolation(user: any, context: GuardContext): boolean {
    // Check if user is trying to access data from another tenant
    const routeParams = context.route.path.match(/:(\w+)/g);
    if (!routeParams) return true;
    
    // Check for tenant ID in route parameters
    const tenantIdParam = routeParams.find(param => 
      param.includes('tenantId') || param.includes('tenant')
    );
    
    if (tenantIdParam) {
      const paramValue = context.location.searchParams?.get(tenantIdParam.replace(':', ''));
      if (paramValue && paramValue !== user.tenantId) {
        return false;
      }
    }
    
    return true;
  }

  // Check for recent tenant switch
  private hasRecentTenantSwitch(user: any): boolean {
    if (!user.lastTenantSwitch) return false;
    
    const now = new Date();
    const lastSwitch = new Date(user.lastTenantSwitch);
    const timeSinceSwitch = now.getTime() - lastSwitch.getTime();
    
    // Require security check if switched within last 5 minutes
    return timeSinceSwitch < 5 * 60 * 1000;
  }

  // Check tenant subscription status
  private checkTenantSubscription(user: any): boolean {
    const subscription = user.tenantSubscription;
    if (!subscription) return false;
    
    const now = new Date();
    const expiresAt = new Date(subscription.expiresAt);
    
    return now < expiresAt && subscription.status === 'active';
  }

  // Check tenant plan limits
  private checkTenantPlanLimits(user: any, context: GuardContext): boolean {
    const plan = user.tenantPlan;
    if (!plan) return false;
    
    const limits = plan.limits || {};
    const usage = user.tenantUsage || {};
    
    // Check user limit
    if (limits.maxUsers && usage.userCount >= limits.maxUsers) {
      return false;
    }
    
    // Check storage limit
    if (limits.maxStorage && usage.storageUsed >= limits.maxStorage) {
      return false;
    }
    
    // Check API calls limit
    if (limits.maxApiCalls && usage.apiCalls >= limits.maxApiCalls) {
      return false;
    }
    
    return true;
  }

  // Check tenant custom domain
  private checkTenantCustomDomain(user: any, context: GuardContext): boolean {
    const customDomain = user.tenantCustomDomain;
    if (!customDomain) return true;
    
    const currentDomain = window.location.hostname;
    return currentDomain === customDomain || currentDomain.endsWith(`.${customDomain}`);
  }

  // Get tenant context
  private getTenantContext(user: any, context: GuardContext): Record<string, any> {
    return {
      tenantId: user.tenantId,
      tenantName: user.tenantName,
      tenantPlan: user.tenantPlan,
      tenantFeatures: user.tenantFeatures,
      tenantSettings: user.tenantSettings,
      route: context.route.code,
      timestamp: new Date().toISOString(),
    };
  }
}

// ===== TENANT GUARD INSTANCE =====

export const tenantGuard = new TenantGuard();
