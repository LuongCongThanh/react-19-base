# Hướng dẫn sử dụng React TypeScript Vite Dynamic Router System

## 🎯 Tổng quan

Hệ thống Dynamic Router được thiết kế để cung cấp routing động, bảo mật đa lớp, và hỗ trợ multi-tenant cho ứng dụng React TypeScript. Hệ thống bao gồm:

- **Dynamic Router**: Router chính với khả năng lazy loading và code splitting
- **Guard System**: Hệ thống bảo mật đa lớp với guards có thể tùy chỉnh
- **Layout System**: Hệ thống layout động hỗ trợ multi-tenant
- **Route Resolver**: Xử lý phân giải route và validation
- **Error Boundaries**: Xử lý lỗi route và component

## 🚀 Cài đặt và Sử dụng

### 1. Cấu hình Route

```typescript
import { createRoute } from '@/router';
import type { RouteConfig } from '@/types/routing';

const routes: RouteConfig[] = [
  // Public routes
  createRoute({
    code: 'home',
    path: '/',
    titleKey: 'navigation.home',
    component: () => import('@/pages/home'),
    layout: 'PublicLayout',
    security: { roles: ['guest', 'user', 'admin'] },
    meta: { title: 'Home', requiresAuth: false, isPublic: true },
    exact: true,
  }),
  
  // Protected routes
  createRoute({
    code: 'dashboard',
    path: '/dashboard',
    titleKey: 'navigation.dashboard',
    component: () => import('@/pages/dashboard'),
    layout: 'UserLayout',
    security: { 
      roles: ['user', 'admin'],
      permissions: ['dashboard.read'],
      guards: ['auth', 'role', 'permission']
    },
    meta: { title: 'Dashboard', requiresAuth: true },
  }),
  
  // Admin routes
  createRoute({
    code: 'admin',
    path: '/admin',
    titleKey: 'navigation.admin',
    component: () => import('@/pages/admin'),
    layout: 'AdminLayout',
    security: { 
      roles: ['admin'],
      permissions: ['admin.read'],
      guards: ['auth', 'role', 'permission', 'csrf']
    },
    meta: { title: 'Admin', requiresAuth: true, isAdmin: true },
  }),
];
```

### 2. Sử dụng trong App.tsx

```typescript
import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { AuthProvider } from '@/contexts/AuthContext';
import { TenantProvider } from '@/contexts/TenantContext';
import { SecurityProvider } from '@/security';
import { DynamicRouter, RouterProviderComposer } from '@/router';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <SecurityProvider>
          <AuthProvider>
            <TenantProvider>
              <RouterProviderComposer routes={routes}>
                <DynamicRouter routes={routes} />
              </RouterProviderComposer>
            </TenantProvider>
          </AuthProvider>
        </SecurityProvider>
      </BrowserRouter>
    </Provider>
  );
};
```

## 🛡️ Hệ thống Guards

### 1. Guards có sẵn

- **AuthGuard**: Kiểm tra xác thực người dùng
- **RoleGuard**: Kiểm tra vai trò người dùng
- **PermissionGuard**: Kiểm tra quyền hạn
- **TenantGuard**: Kiểm tra quyền truy cập tenant
- **CSRFGuard**: Bảo vệ CSRF

### 2. Tạo Guard tùy chỉnh

```typescript
import { createGuard } from '@/router';
import type { RouteContext, GuardResult } from '@/types/routing';

const customGuard = createGuard(
  'custom',
  50, // priority
  async (context: RouteContext): Promise<GuardResult> => {
    // Logic kiểm tra tùy chỉnh
    if (context.user?.customProperty) {
      return { allowed: true };
    }
    
    return {
      allowed: false,
      error: 'Custom validation failed',
      redirectTo: '/unauthorized'
    };
  }
);

// Đăng ký guard
RouterRegistry.registerGuard(customGuard);
```

### 3. Sử dụng Guards trong Route

```typescript
const protectedRoute = createRoute({
  code: 'protected',
  path: '/protected',
  component: () => import('@/pages/protected'),
  layout: 'UserLayout',
  security: {
    roles: ['user'],
    permissions: ['read'],
    guards: ['auth', 'role', 'permission', 'custom']
  },
  meta: { title: 'Protected', requiresAuth: true },
});
```

## 🎨 Hệ thống Layout

### 1. Layouts có sẵn

- **PublicLayout**: Layout cho trang công khai
- **UserLayout**: Layout cho người dùng thường
- **AdminLayout**: Layout cho admin
- **TenantLayout**: Layout cho multi-tenant

### 2. Tạo Layout tùy chỉnh

```typescript
import { createLayout } from '@/router';
import type { LayoutType } from '@/types/routing';

const CustomLayout: React.FC<{ children: React.ReactNode; config?: any }> = ({ 
  children, 
  config 
}) => {
  return (
    <div className="custom-layout">
      <header>Custom Header</header>
      <main>{children}</main>
      <footer>Custom Footer</footer>
    </div>
  );
};

// Đăng ký layout
createLayout('CustomLayout' as LayoutType, CustomLayout);
```

### 3. Sử dụng Layout trong Route

```typescript
const customRoute = createRoute({
  code: 'custom',
  path: '/custom',
  component: () => import('@/pages/custom'),
  layout: 'CustomLayout',
  layoutConfig: {
    theme: 'dark',
    showSidebar: true
  },
  security: { roles: ['user'] },
  meta: { title: 'Custom', requiresAuth: true },
});
```

## 🔧 Hooks và Utilities

### 1. useRouter Hook

```typescript
import { useRouter } from '@/router';

const MyComponent: React.FC = () => {
  const router = useRouter();
  
  const handleNavigate = () => {
    router.navigate('/dashboard');
  };
  
  const canAccess = router.canAccess(route);
  const hasPermission = router.hasPermission('admin.read');
  const hasRole = router.hasRole('admin');
  
  return (
    <div>
      <button onClick={handleNavigate}>Navigate</button>
      {canAccess && <div>Access granted</div>}
    </div>
  );
};
```

### 2. useTenant Hook

```typescript
import { useTenant } from '@/contexts/TenantContext';

const TenantComponent: React.FC = () => {
  const { 
    currentTenant, 
    hasFeature, 
    getSetting,
    switchTenant 
  } = useTenant();
  
  if (!hasFeature('advanced-analytics')) {
    return <div>Feature not available</div>;
  }
  
  return (
    <div>
      <h1>{currentTenant?.name}</h1>
      <p>Theme: {getSetting('theme')}</p>
    </div>
  );
};
```

### 3. useSecurity Hook

```typescript
import { useSecurity } from '@/security';

const SecurityComponent: React.FC = () => {
  const { 
    csrfToken, 
    sanitizeInput, 
    logSecurityEvent 
  } = useSecurity();
  
  const handleSubmit = (data: any) => {
    const sanitizedData = sanitizeInput(data);
    logSecurityEvent({
      type: 'auth',
      message: 'Form submitted',
      severity: 'low'
    });
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
};
```

## 🧪 Testing

### 1. Test Route Component

```typescript
import { render, screen } from '@testing-library/react';
import { DynamicRouter } from '@/router';

const testRoutes = [
  createRoute({
    code: 'test',
    path: '/test',
    component: () => import('@/components/TestComponent'),
    layout: 'PublicLayout',
    security: { roles: ['guest'] },
    meta: { title: 'Test', requiresAuth: false },
  }),
];

test('renders route component', async () => {
  render(<DynamicRouter routes={testRoutes} />);
  
  // Navigate to test route
  window.history.pushState({}, 'Test', '/test');
  
  await waitFor(() => {
    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });
});
```

### 2. Test Guards

```typescript
import { render, screen } from '@testing-library/react';
import { GuardComposer } from '@/router';

test('guard blocks unauthorized access', async () => {
  const protectedRoute = createRoute({
    code: 'protected',
    path: '/protected',
    component: () => import('@/components/ProtectedComponent'),
    layout: 'UserLayout',
    security: { roles: ['admin'] },
    meta: { title: 'Protected', requiresAuth: true },
  });
  
  render(
    <GuardComposer route={protectedRoute}>
      <div>Protected Content</div>
    </GuardComposer>
  );
  
  await waitFor(() => {
    expect(screen.getByText(/Access denied/)).toBeInTheDocument();
  });
});
```

## 🚨 Error Handling

### 1. Route Error Boundary

```typescript
import { RouteErrorBoundary } from '@/router';

const ErrorFallback: React.FC<{ error: Error; retry: () => void }> = ({ 
  error, 
  retry 
}) => (
  <div>
    <h1>Something went wrong</h1>
    <p>{error.message}</p>
    <button onClick={retry}>Try again</button>
  </div>
);

const App: React.FC = () => (
  <RouteErrorBoundary fallback={ErrorFallback}>
    <DynamicRouter routes={routes} />
  </RouteErrorBoundary>
);
```

### 2. Custom Error Handling

```typescript
const routeWithErrorHandling = createRoute({
  code: 'error-handling',
  path: '/error-handling',
  component: () => import('@/pages/ErrorHandling'),
  layout: 'PublicLayout',
  security: { roles: ['guest'] },
  meta: { title: 'Error Handling', requiresAuth: false },
  onError: (error) => {
    console.error('Route error:', error);
    // Send to monitoring service
  },
});
```

## 🔒 Bảo mật

### 1. CSRF Protection

```typescript
import { useSecurity } from '@/security';

const SecureForm: React.FC = () => {
  const { csrfToken, validateCSRFToken } = useSecurity();
  
  const handleSubmit = async (formData: any) => {
    if (!validateCSRFToken(formData.csrfToken)) {
      throw new Error('Invalid CSRF token');
    }
    
    // Submit form
  };
  
  return (
    <form>
      <input type="hidden" name="csrfToken" value={csrfToken} />
      {/* Form fields */}
    </form>
  );
};
```

### 2. Input Sanitization

```typescript
import { useSecurity } from '@/security';

const SafeInput: React.FC = () => {
  const { sanitizeInput, sanitizeHTML } = useSecurity();
  
  const handleInput = (value: string) => {
    const sanitized = sanitizeInput(value);
    // Use sanitized value
  };
  
  const handleHTML = (html: string) => {
    const sanitized = sanitizeHTML(html);
    // Use sanitized HTML
  };
};
```

## 📊 Performance

### 1. Code Splitting

```typescript
// Routes tự động được code split
const routes = [
  createRoute({
    code: 'heavy-page',
    path: '/heavy',
    component: () => import('@/pages/HeavyPage'), // Lazy loaded
    layout: 'UserLayout',
    security: { roles: ['user'] },
    meta: { title: 'Heavy Page', requiresAuth: true },
  }),
];
```

### 2. Preloading

```typescript
import { useRouter } from '@/router';

const PreloadComponent: React.FC = () => {
  const { preloadRoute } = useRouter();
  
  const handleHover = () => {
    preloadRoute('/dashboard'); // Preload on hover
  };
  
  return (
    <Link to="/dashboard" onMouseEnter={handleHover}>
      Dashboard
    </Link>
  );
};
```

## 🌐 Multi-tenant Support

### 1. Tenant Detection

```typescript
import { useTenant } from '@/contexts/TenantContext';

const TenantAwareComponent: React.FC = () => {
  const { 
    currentTenant, 
    hasFeature, 
    getSetting 
  } = useTenant();
  
  if (!currentTenant) {
    return <div>Loading tenant...</div>;
  }
  
  return (
    <div style={{ 
      '--primary-color': currentTenant.theme.primaryColor 
    }}>
      <h1>{currentTenant.name}</h1>
      {hasFeature('analytics') && <Analytics />}
    </div>
  );
};
```

### 2. Tenant-specific Routes

```typescript
const tenantRoutes = [
  createRoute({
    code: 'tenant-dashboard',
    path: '/tenant/dashboard',
    component: () => import('@/pages/TenantDashboard'),
    layout: 'TenantLayout',
    security: { 
      roles: ['user'],
      tenantRequired: true 
    },
    meta: { 
      title: 'Tenant Dashboard', 
      requiresAuth: true,
      isTenant: true 
    },
  }),
];
```

## 📝 Best Practices

### 1. Route Organization

```typescript
// Tổ chức routes theo feature
const authRoutes = [
  createRoute({ /* login */ }),
  createRoute({ /* register */ }),
];

const adminRoutes = [
  createRoute({ /* admin dashboard */ }),
  createRoute({ /* user management */ }),
];

const userRoutes = [
  createRoute({ /* user dashboard */ }),
  createRoute({ /* profile */ }),
];

export const allRoutes = [
  ...authRoutes,
  ...adminRoutes,
  ...userRoutes,
];
```

### 2. Guard Composition

```typescript
// Sử dụng guards theo thứ tự ưu tiên
const adminRoute = createRoute({
  code: 'admin',
  path: '/admin',
  component: () => import('@/pages/Admin'),
  layout: 'AdminLayout',
  security: {
    roles: ['admin'],
    permissions: ['admin.read'],
    guards: ['auth', 'role', 'permission', 'csrf'] // Thứ tự quan trọng
  },
  meta: { title: 'Admin', requiresAuth: true },
});
```

### 3. Error Handling

```typescript
// Luôn có error boundary cho routes
const App: React.FC = () => (
  <RouteErrorBoundary
    fallback={CustomErrorFallback}
    onError={(error) => {
      // Log error
      console.error('Route error:', error);
      // Send to monitoring
    }}
  >
    <DynamicRouter routes={routes} />
  </RouteErrorBoundary>
);
```

## 🔧 Troubleshooting

### 1. Route không load

- Kiểm tra path có đúng không
- Kiểm tra component export default
- Kiểm tra security configuration

### 2. Guard block không đúng

- Kiểm tra thứ tự guards
- Kiểm tra user permissions
- Kiểm tra guard logic

### 3. Layout không hiển thị

- Kiểm tra layout type
- Kiểm tra layout component export
- Kiểm tra layout configuration

## 📚 API Reference

### RouteConfig

```typescript
interface RouteConfig {
  code: string;
  path: string;
  titleKey: string;
  component: () => Promise<{ default: React.ComponentType<any> }>;
  layout: LayoutType;
  security: {
    roles?: RouteRole[];
    permissions?: string[];
    tenantRequired?: boolean;
    csrfRequired?: boolean;
    guards?: string[];
  };
  meta: {
    title: string;
    requiresAuth: boolean;
    isPublic?: boolean;
    isAdmin?: boolean;
    isTenant?: boolean;
  };
}
```

### Guard Interface

```typescript
interface Guard {
  name: string;
  priority: number;
  canActivate: (context: RouteContext) => Promise<GuardResult> | GuardResult;
  canDeactivate?: (context: RouteContext) => Promise<GuardResult> | GuardResult;
}
```

### Layout Interface

```typescript
interface LayoutConfig {
  type: LayoutType;
  config: any;
  tenant?: any;
  theme?: any;
  features?: string[];
}
```

---

*Hệ thống Dynamic Router cung cấp một giải pháp hoàn chỉnh cho routing động, bảo mật và multi-tenant trong ứng dụng React TypeScript.*
