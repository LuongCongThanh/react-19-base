// src/types/routing.ts
import React from 'react';

// ===== CORE ROUTING TYPES =====

export type LayoutType = 'AdminLayout' | 'UserLayout' | 'PublicLayout' | 'TenantLayout' | 'None';

export type RouteRole = 'admin' | 'user' | 'guest';

export type RouteStatus = 'loading' | 'resolved' | 'error' | 'not-found';

export type GuardResult = {
  allowed: boolean;
  redirectTo?: string;
  error?: string;
  data?: any;
};

// ===== ROUTE CONFIGURATION =====

export interface RouteConfig {
  // Basic route info
  code: string;
  path: string;
  titleKey: string;
  exact?: boolean;
  
  // Component loading
  component: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ComponentType<any>;
  
  // Layout configuration
  layout: LayoutType;
  layoutConfig?: any;
  
  // Security configuration
  security: {
    roles?: RouteRole[];
    permissions?: string[];
    tenantRequired?: boolean;
    csrfRequired?: boolean;
    guards?: string[];
  };
  
  // Route metadata
  meta: {
    title: string;
    description?: string;
    keywords?: string[];
    requiresAuth: boolean;
    isPublic?: boolean;
    isAdmin?: boolean;
    isTenant?: boolean;
    feature?: string;
    priority?: number;
  };
  
  // Navigation
  navigation?: {
    showInMenu?: boolean;
    menuTitle?: string;
    menuIcon?: string;
    menuOrder?: number;
    parent?: string;
    breadcrumb?: string[];
  };
  
  // Performance
  performance?: {
    preload?: boolean;
    cache?: boolean;
    lazy?: boolean;
  };
  
  // Error handling
  errorBoundary?: React.ComponentType<any>;
  onError?: (error: Error) => void;
}

// ===== ROUTE RESOLUTION =====

export interface RouteResolution {
  route: RouteConfig;
  status: RouteStatus;
  component?: React.ComponentType<any>;
  error?: Error;
  guards?: GuardResult[];
  resolvedAt: Date;
}

export interface RouteContext {
  // Current route info
  currentRoute: RouteConfig | null;
  previousRoute: RouteConfig | null;
  
  // User context
  user: any;
  tenant: any;
  permissions: string[];
  roles: string[];
  
  // Navigation state
  isNavigating: boolean;
  navigationHistory: string[];
  
  // Route resolution
  resolution: RouteResolution | null;
  error: Error | null;
}

// ===== GUARD SYSTEM =====

export interface Guard {
  name: string;
  priority: number;
  canActivate: (context: RouteContext) => Promise<GuardResult> | GuardResult;
  canDeactivate?: (context: RouteContext) => Promise<GuardResult> | GuardResult;
}

export interface GuardContext extends RouteContext {
  route: RouteConfig;
  guards: Guard[];
  guardResults: Map<string, GuardResult>;
}

// ===== LAYOUT SYSTEM =====

export interface LayoutConfig {
  type: LayoutType;
  config: any;
  tenant?: any;
  theme?: any;
  features?: string[];
}

export interface LayoutContext {
  layout: LayoutConfig;
  route: RouteConfig;
  user: any;
  tenant: any;
  permissions: string[];
}

// ===== ROUTER STATE =====

export interface RouterState {
  // Current state
  currentRoute: RouteConfig | null;
  previousRoute: RouteConfig | null;
  isNavigating: boolean;
  error: Error | null;
  
  // Route registry
  routes: Map<string, RouteConfig>;
  layouts: Map<LayoutType, React.ComponentType<any>>;
  guards: Map<string, Guard>;
  
  // Navigation history
  history: string[];
  maxHistorySize: number;
  
  // Performance
  preloadedRoutes: Set<string>;
  cachedComponents: Map<string, React.ComponentType<any>>;
}

// ===== ROUTER ACTIONS =====

export type RouterAction =
  | { type: 'NAVIGATE_START'; payload: { path: string; route: RouteConfig } }
  | { type: 'NAVIGATE_SUCCESS'; payload: { route: RouteConfig; component: React.ComponentType<any> } }
  | { type: 'NAVIGATE_ERROR'; payload: { error: Error; path: string } }
  | { type: 'SET_CURRENT_ROUTE'; payload: RouteConfig }
  | { type: 'SET_PREVIOUS_ROUTE'; payload: RouteConfig | null }
  | { type: 'ADD_TO_HISTORY'; payload: string }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'SET_ERROR'; payload: Error | null }
  | { type: 'PRELOAD_ROUTE'; payload: string }
  | { type: 'CACHE_COMPONENT'; payload: { route: string; component: React.ComponentType<any> } }
  | { type: 'CLEAR_CACHE' };

// ===== ROUTE MATCHING =====

export interface RouteMatch {
  route: RouteConfig;
  params: Record<string, string>;
  query: Record<string, string>;
  hash: string;
  isExact: boolean;
}

export interface RouteMatcher {
  match: (path: string, routes: RouteConfig[]) => RouteMatch | null;
  resolve: (route: RouteConfig, params: Record<string, string>) => string;
  parse: (path: string) => { pathname: string; search: string; hash: string };
}

// ===== ERROR TYPES =====

export class RouteError extends Error {
  constructor(
    message: string,
    public code: string,
    public route?: RouteConfig,
    public context?: any
  ) {
    super(message);
    this.name = 'RouteError';
  }
}

export class GuardError extends Error {
  constructor(
    message: string,
    public guard: string,
    public result: GuardResult,
    public context?: any
  ) {
    super(message);
    this.name = 'GuardError';
  }
}

export class LayoutError extends Error {
  constructor(
    message: string,
    public layout: LayoutType,
    public context?: any
  ) {
    super(message);
    this.name = 'LayoutError';
  }
}

// ===== UTILITY TYPES =====

export type RouteConfigMap = Map<string, RouteConfig>;
export type LayoutMap = Map<LayoutType, React.ComponentType<any>>;
export type GuardMap = Map<string, Guard>;

export interface RouteRegistry {
  register: (route: RouteConfig) => void;
  unregister: (code: string) => void;
  get: (code: string) => RouteConfig | undefined;
  getAll: () => RouteConfig[];
  findByPath: (path: string) => RouteConfig | undefined;
  findByRole: (role: RouteRole) => RouteConfig[];
  findByPermission: (permission: string) => RouteConfig[];
}

export interface LayoutRegistry {
  register: (type: LayoutType, component: React.ComponentType<any>) => void;
  unregister: (type: LayoutType) => void;
  get: (type: LayoutType) => React.ComponentType<any> | undefined;
  getAll: () => Map<LayoutType, React.ComponentType<any>>;
}

export interface GuardRegistry {
  register: (guard: Guard) => void;
  unregister: (name: string) => void;
  get: (name: string) => Guard | undefined;
  getAll: () => Guard[];
  getByPriority: () => Guard[];
  getRequiredGuards: (route: RouteConfig) => Guard[];
}
