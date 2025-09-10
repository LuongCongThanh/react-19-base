# AI Context: React TypeScript Vite Dynamic Router System

> **Purpose**: Enhanced AI context for understanding a production-ready React TypeScript project with advanced dynamic routing, multi-tenant support, comprehensive security, and full testing coverage.

## 🏗️ Enhanced Project Architecture

**Tech Stack**: React 19 + TypeScript + Vite + Redux Toolkit + Tailwind CSS + React Router + i18next + Jest + React Testing Library + Cypress

**Architecture Pattern**: Feature-driven development with centralized state management, dynamic routing, multi-tenant support, and comprehensive testing

## 📁 Complete Directory Structure & Patterns

```
src/
├── components/
│   ├── guards/                   # Route protection components
│   │   ├── __tests__/           # Guard unit tests
│   │   ├── AuthGuard.tsx        # Authentication protection
│   │   ├── RoleGuard.tsx        # Role-based access control
│   │   ├── PermissionGuard.tsx  # Permission-based access
│   │   ├── TenantGuard.tsx      # Multi-tenant validation
│   │   ├── GuardComposer.tsx    # Chain multiple guards
│   │   └── index.ts             # Barrel export
│   ├── layouts/                 # Layout components
│   │   ├── __tests__/           # Layout tests
│   │   ├── AdminLayout.tsx      # Admin dashboard layout
│   │   ├── UserLayout.tsx       # User interface layout
│   │   ├── PublicLayout.tsx     # Public pages layout
│   │   ├── TenantLayout.tsx     # Multi-tenant layout
│   │   ├── LayoutProvider.tsx   # Dynamic layout selection
│   │   └── index.ts
│   ├── ui/                      # Reusable UI components
│   │   ├── __tests__/           # UI component tests
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── NotFound.tsx
│   │   ├── Unauthorized.tsx
│   │   └── index.ts
│   └── error-boundaries/        # Error handling components
│       ├── __tests__/
│       ├── AppErrorBoundary.tsx
│       ├── RouteErrorBoundary.tsx
│       └── ComponentErrorBoundary.tsx
├── contexts/                    # React contexts
│   ├── __tests__/               # Context tests
│   ├── AuthContext.tsx          # Authentication state
│   ├── TenantContext.tsx        # Multi-tenant management
│   ├── RouterContext.tsx        # Dynamic routing context
│   └── index.ts
├── hooks/                       # Custom React hooks
│   ├── __tests__/               # Hook tests
│   ├── useAuth.ts               # Authentication hooks
│   ├── useTenant.ts             # Tenant management hooks
│   ├── usePermissions.ts        # Permission checking hooks
│   ├── useRoutes.ts             # Dynamic routing hooks
│   ├── useGuards.ts             # Guard composition hooks
│   └── index.ts
├── pages/                       # Feature-based page organization
│   ├── admin/                   # Admin feature
│   │   ├── __tests__/           # Admin page tests
│   │   ├── components/          # Admin-specific components
│   │   │   ├── __tests__/
│   │   │   ├── AdminDashboard.tsx
│   │   │   └── UserManagement.tsx
│   │   ├── hooks/               # Admin-specific hooks
│   │   ├── services/            # Admin API services
│   │   ├── slices/              # Admin Redux slices
│   │   └── types/               # Admin TypeScript types
│   ├── auth/                    # Authentication feature
│   │   ├── __tests__/
│   │   ├── components/
│   │   │   ├── __tests__/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── hooks/
│   │   ├── services/
│   │   │   └── authService.ts
│   │   ├── slices/
│   │   │   └── authSlice.ts
│   │   └── types/
│   ├── tenant/                  # Multi-tenant feature
│   │   ├── __tests__/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── user/                    # User feature
│   │   ├── __tests__/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   └── public/                  # Public pages
│       ├── __tests__/
│       ├── HomePage.tsx
│       └── AboutPage.tsx
├── router/                      # Dynamic routing system
│   ├── __tests__/               # Router tests
│   ├── DynamicRouter.tsx        # Core dynamic router
│   ├── RouteRenderer.tsx        # Route component renderer
│   ├── RouteResolver.tsx        # Route resolution logic
│   ├── types.ts                 # Router-specific types
│   └── utils.ts                 # Router utilities
├── routes/                      # Route configurations
│   ├── __tests__/               # Route config tests
│   ├── config.ts                # Main route definitions
│   ├── guards.ts                # Guard configurations
│   ├── admin.routes.ts          # Admin route definitions
│   ├── user.routes.ts           # User route definitions
│   ├── tenant.routes.ts         # Tenant route definitions
│   └── public.routes.ts         # Public route definitions
├── services/                    # Shared services
│   ├── __tests__/               # Service tests
│   ├── auth/
│   │   ├── __tests__/
│   │   ├── AuthService.ts       # Authentication API
│   │   ├── TokenManager.ts      # JWT token management
│   │   └── SecurityService.ts   # Security utilities
│   ├── tenant/
│   │   ├── __tests__/
│   │   └── TenantService.ts     # Multi-tenant API
│   ├── api/
│   │   ├── __tests__/
│   │   ├── ApiClient.ts         # HTTP client
│   │   └── interceptors.ts      # Request/response interceptors
│   └── index.ts
├── store/                       # Redux store configuration
│   ├── __tests__/               # Store tests
│   ├── index.ts                 # Store setup
│   ├── middleware.ts            # Custom middleware
│   └── rootReducer.ts           # Root reducer
├── types/                       # Global TypeScript definitions
│   ├── auth.ts                  # Authentication types
│   ├── tenant.ts                # Multi-tenant types
│   ├── route.ts                 # Routing types
│   ├── user.ts                  # User types
│   ├── guards.ts                # Guard types
│   ├── api.ts                   # API response types
│   └── index.ts                 # Barrel exports
├── utils/                       # Utility functions
│   ├── __tests__/               # Utility tests
│   ├── security.ts              # Security helpers
│   ├── validation.ts            # Form validation
│   ├── cache.ts                 # Caching utilities
│   ├── constants.ts             # App constants
│   ├── permissions.ts           # Permission utilities
│   └── testing.ts               # Test utilities
├── config/                      # Configuration
│   ├── axios.ts                 # HTTP client config
│   ├── routes.ts                # Route constants
│   └── security.ts              # Security config
├── i18n/                        # Internationalization
│   ├── index.ts
│   └── resources/
└── App.tsx
├── __tests__/                   # Integration & E2E tests
│   ├── integration/             # Integration tests
│   │   ├── auth-flow.test.tsx
│   │   ├── routing.test.tsx
│   │   └── tenant-switching.test.tsx
│   ├── e2e/                     # Cypress E2E tests
│   │   ├── auth.cy.ts
│   │   ├── admin.cy.ts
│   │   └── tenant.cy.ts
│   └── setup/                   # Test setup files
│       ├── setupTests.ts
│       ├── testUtils.tsx
│       └── mocks/
```

## 🎯 Enhanced Key Patterns for AI Understanding

### 1. Dynamic Router Pattern

```typescript
// When AI sees: src/router/DynamicRouter.tsx
// Understand: Core routing engine that:
// - Resolves routes dynamically based on user permissions
// - Applies guard chains in sequence
// - Selects appropriate layouts
// - Handles lazy loading and code splitting
// - Manages route-level error boundaries

// Example usage:
const routeConfig: RouteConfig = {
  path: '/admin/*',
  component: () => import('../pages/admin/AdminDashboard'),
  layout: 'admin',
  guards: ['auth', 'role:admin', 'permission:admin.read'],
  meta: { title: 'Admin Dashboard', requiresAuth: true }
}
```

### 2. Guard Composition Pattern

```typescript
// Location: src/components/guards/GuardComposer.tsx
// Pattern: Chain multiple guards with proper error handling
// Guards execute in sequence: auth -> role -> permission -> tenant
// Each guard can redirect, show error, or pass through

// Example:
<GuardComposer route={route}>
  <ComponentToProtect />
</GuardComposer>
// Automatically applies: AuthGuard -> RoleGuard -> PermissionGuard
```

### 3. Multi-Tenant Pattern

```typescript
// Location: src/contexts/TenantContext.tsx
// Pattern: Tenant detection and isolation
// Features: Domain-based detection, custom theming, feature flags
// State: { tenant, loading, features, permissions, config }

// Usage in components:
const { tenant, hasFeature } = useTenant();
if (!hasFeature('advanced-analytics')) return null;
```

### 4. Enhanced Testing Patterns

```typescript
// Test Structure: 
// - Unit tests: Each component/hook/service
// - Integration tests: Feature flows
// - E2E tests: User journeys
// - Visual regression tests: UI consistency

// Test Utilities: src/utils/testing.ts
export const renderWithProviders = (component, options) => {
  return render(component, {
    wrapper: ({ children }) => (
      <AuthProvider>
        <TenantProvider>
          <BrowserRouter>{children}</BrowserRouter>
        </TenantProvider>
      </AuthProvider>
    ),
    ...options
  });
};
```

### 5. Security-First Pattern

```typescript
// Every route goes through security validation
// CSRF protection via tokens
// XSS prevention via sanitization
// Permission-based API access
// Audit logging for security events
// Rate limiting and abuse prevention

// Example security check:
const securityCheck = (user, route, tenant) => {
  return SecurityService.validateAccess({
    user, route, tenant,
    checks: ['auth', 'permissions', 'tenant', 'csrf']
  });
};
```

## 🧪 Testing Strategy & Patterns

### Unit Testing Pattern

```typescript
// Location: Component/__tests__/Component.test.tsx
// Pattern: Test component behavior, hooks, and services in isolation
// Tools: Jest + React Testing Library + MSW for API mocking

// Example:
describe('AuthGuard', () => {
  it('should redirect to login when not authenticated', () => {
    renderWithProviders(
      <AuthGuard><div>Protected</div></AuthGuard>,
      { authState: { isAuthenticated: false } }
    );
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
```

### Integration Testing Pattern

```typescript
// Location: __tests__/integration/
// Pattern: Test feature workflows and component interactions
// Focus: Multi-component flows, context interactions, routing

// Example:
describe('Admin Dashboard Flow', () => {
  it('should allow admin to access user management', async () => {
    const user = mockUser({ roles: ['admin'] });
    renderWithProviders(<App />, { user });
    
    await userEvent.click(screen.getByText('User Management'));
    expect(screen.getByText('Manage Users')).toBeInTheDocument();
  });
});
```

### E2E Testing Pattern

```typescript
// Location: __tests__/e2e/
// Pattern: Full user journeys with Cypress
// Focus: Real browser interactions, visual testing

// Example:
describe('Authentication Flow', () => {
  it('should login admin and access protected routes', () => {
    cy.visit('/login');
    cy.get('[data-testid=email]').type('admin@example.com');
    cy.get('[data-testid=password]').type('password');
    cy.get('[data-testid=login-button]').click();
    cy.url().should('include', '/admin/dashboard');
  });
});
```

## 🔍 Enhanced Code Context Clues

### Import Pattern Analysis

```typescript
// These imports indicate enhanced architecture:
import { useAuth } from '@/contexts/AuthContext';        // Authentication context
import { useTenant } from '@/contexts/TenantContext';    // Multi-tenant context
import { usePermissions } from '@/hooks/usePermissions'; // Permission hooks
import { GuardComposer } from '@/components/guards';     // Route protection
import { DynamicRouter } from '@/router/DynamicRouter';  // Dynamic routing
import { AuthService } from '@/services/auth';          // Authentication API
import { renderWithProviders } from '@/utils/testing';   // Test utilities
```

### File Type Recognition

```typescript
// File naming patterns tell AI about functionality:
// *.test.tsx - Unit tests
// *.cy.ts - Cypress E2E tests  
// *Guard.tsx - Route protection
// *Layout.tsx - Page layouts
// *Service.ts - API services
// *Slice.ts - Redux state
// *Context.tsx - React context
// *Hook.ts - Custom hooks
```

## 🎯 AI Decision Making Guide

### For Dynamic Routing Features

1. **Route Definition**: Create in `src/routes/[feature].routes.ts`
2. **Guard Assignment**: Define guards in route config
3. **Layout Selection**: Assign appropriate layout
4. **Component Creation**: Build with proper TypeScript interfaces
5. **Test Coverage**: Add unit + integration + E2E tests

### For Multi-Tenant Features

1. **Tenant Detection**: Use `useTenant()` hook
2. **Feature Gating**: Check `tenant.features`
3. **Custom Branding**: Use tenant config for theming
4. **Data Isolation**: Include tenant context in API calls
5. **Testing**: Mock different tenant configurations

### For Security Implementation

1. **Route Protection**: Apply appropriate guards
2. **Permission Checks**: Use `usePermissions()` hook
3. **API Security**: Include auth headers and CSRF tokens
4. **Input Validation**: Sanitize all user inputs
5. **Audit Logging**: Log security-relevant events

### For Testing Implementation

1. **Test Planning**: Write tests before implementation
2. **Mock Strategy**: Use MSW for API, mock contexts for isolation
3. **Test Utilities**: Use `renderWithProviders` for consistent setup
4. **Coverage Goals**: 80%+ unit, 60%+ integration, critical paths E2E
5. **Visual Testing**: Include snapshot tests for UI components

## 📋 Enhanced Naming Conventions

| Type           | Pattern                    | Example                    | Test Pattern              |
|----------------|----------------------------|----------------------------|---------------------------|
| Components     | PascalCase                 | `UserDashboard.tsx`        | `UserDashboard.test.tsx`  |
| Hooks          | camelCase + use prefix     | `usePermissions.ts`        | `usePermissions.test.ts`  |
| Services       | PascalCase + Service       | `AuthService.ts`           | `AuthService.test.ts`     |
| Guards         | PascalCase + Guard         | `TenantGuard.tsx`          | `TenantGuard.test.tsx`    |
| Contexts       | PascalCase + Context       | `TenantContext.tsx`        | `TenantContext.test.tsx`  |
| Utils          | camelCase                  | `permissions.ts`           | `permissions.test.ts`     |
| Types          | PascalCase                 | `RouteConfig`, `AuthState` | -                         |
| E2E Tests      | kebab-case + .cy.ts        | `admin-flow.cy.ts`         | -                         |

## 🎯 Common AI Tasks & Context

### "Add a new protected admin route"

1. Define route in `src/routes/admin.routes.ts`
2. Create component in `src/pages/admin/components/`
3. Add guards: `['auth', 'role:admin']`
4. Assign layout: `'admin'`
5. Write tests: unit + integration + E2E
6. Add to navigation in `AdminLayout.tsx`

### "Implement multi-tenant feature"

1. Check tenant context in component
2. Use `tenant.features.includes('feature-name')`
3. Apply tenant branding from `tenant.config`
4. Include tenant ID in API calls
5. Test with different tenant configurations

### "Add new authentication guard"

1. Create guard component in `src/components/guards/`
2. Implement guard logic with proper error handling
3. Add to `GuardComposer.tsx` switch statement
4. Write comprehensive tests
5. Document guard usage in route config

### "Create reusable UI component"

1. Build in `src/components/ui/`
2. Add TypeScript interfaces for props
3. Support tenant theming
4. Include accessibility attributes
5. Write visual regression tests
6. Add Storybook story (if using Storybook)

## 🔗 Integration Points

**Dynamic Router**: All routes processed through guard chains and layout selection
**Multi-Tenant**: Tenant context affects routing, theming, and feature access
**Security**: Every route and API call includes security validation
**Testing**: Comprehensive coverage with multiple testing strategies
**Performance**: Code splitting, lazy loading, and caching at multiple levels
**Error Handling**: Layered error boundaries with graceful fallbacks

## 📊 Performance & Security Considerations

### Performance Optimizations

- **Route-based Code Splitting**: Each route loads independently
- **Guard Memoization**: Cache permission checks
- **Component Lazy Loading**: Load components on demand
- **API Response Caching**: Cache frequently accessed data
- **Bundle Analysis**: Monitor and optimize bundle sizes

### Security Implementations

- **Defense in Depth**: Multiple security layers
- **Principle of Least Privilege**: Minimal required permissions
- **Input Validation**: Client and server-side validation
- **CSRF Protection**: Token-based CSRF prevention
- **Audit Trail**: Comprehensive security event logging

---

*This enhanced context provides AI with comprehensive understanding of a production-ready React TypeScript application with advanced routing, security, multi-tenant support, and extensive testing coverage.*