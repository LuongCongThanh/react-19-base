# 🧭 TanStack Router Convention

Convention cho TanStack Router trong project.

## 📋 Mục lục

- [Route Ownership](#route-ownership)
- [Route Definition](#route-definition)
- [Layout System](#layout-system)
- [Auth Guard](#auth-guard)
- [Navigation](#navigation)

---

## Route Ownership

### Route thuộc feature

- Route **thuộc feature**
- Feature **chịu trách nhiệm page của nó**
- Router chỉ compose

---

## Route Definition

### Basic Route

```typescript
// src/features/auth/auth.routes.tsx
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from '@app/app.router';
import { LoginPage } from './pages/LoginPage';

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/login',
  component: LoginPage,
});
```

### Nested Routes

```typescript
// src/features/auth/auth.routes.tsx
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from '@app/app.router';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

export const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
});

export const loginRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/login',
  component: LoginPage,
});

export const registerRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/register',
  component: RegisterPage,
});
```

### Route với params

```typescript
// src/features/products/products.routes.tsx
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from '@app/app.router';
import { ProductDetailPage } from './pages/ProductDetailPage';

export const productDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products/$productId',
  component: ProductDetailPage,
});
```

---

## Layout System

### Layout Route

```typescript
// src/shared/layouts/DashboardLayout.tsx
import { Outlet } from '@tanstack/react-router';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

export const DashboardLayout = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
```

### Sử dụng Layout

```typescript
// src/features/dashboard/dashboard.routes.tsx
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from '@app/app.router';
import { DashboardLayout } from '@shared/layouts/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';

export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardLayout,
});

export const dashboardIndexRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: '/',
  component: DashboardPage,
});
```

---

## Auth Guard

### Protected Route

```typescript
// src/features/dashboard/dashboard.routes.tsx
import { createRoute, redirect } from '@tanstack/react-router';
import { rootRoute } from '@app/app.router';
import { DashboardPage } from './pages/DashboardPage';
import { useAuthStore } from '@features/auth/stores/auth.store';

export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  beforeLoad: async () => {
    const { token } = useAuthStore.getState();
    if (!token) {
      throw redirect({
        to: '/auth/login',
      });
    }
  },
  component: DashboardPage,
});
```

### Public Route (không cần auth)

```typescript
// src/features/auth/auth.routes.tsx
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from '@app/app.router';
import { LoginPage } from './pages/LoginPage';

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/login',
  component: LoginPage,
  // Không có beforeLoad → public route
});
```

---

## Navigation

### Programmatic Navigation

```typescript
import { useNavigate } from '@tanstack/react-router';

export const LoginForm = () => {
  const navigate = useNavigate();
  const { mutate } = useLogin();

  const handleSubmit = (data: LoginFormData) => {
    mutate(data, {
      onSuccess: () => {
        navigate({ to: '/dashboard' });
      },
    });
  };

  return <form onSubmit={handleSubmit}>...</form>;
};
```

### Link Component

```typescript
import { Link } from '@tanstack/react-router';

export const Navigation = () => {
  return (
    <nav>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/products">Products</Link>
    </nav>
  );
};
```

### Active Link

```typescript
import { Link, useRouterState } from '@tanstack/react-router';

export const Navigation = () => {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <nav>
      <Link
        to="/dashboard"
        className={currentPath === '/dashboard' ? 'active' : ''}
      >
        Dashboard
      </Link>
    </nav>
  );
};
```

---

## Route Registration

### Đăng ký routes trong app.router.tsx

```typescript
// src/app/app.router.tsx
import { createRouter, createRootRoute, Outlet } from '@tanstack/react-router';
import { authRoute, loginRoute, registerRoute } from '@features/auth/auth.routes';
import { dashboardRoute } from '@features/dashboard/dashboard.routes';

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const routeTree = rootRoute.addChildren([
  authRoute.addChildren([loginRoute, registerRoute]),
  dashboardRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
```

---

## Best Practices

### 1. Route files trong feature

```typescript
// ✅ Đúng: Route trong feature
// features/auth/auth.routes.tsx

// ❌ Sai: Route trong app
// app/routes/auth.routes.tsx
```

### 2. Page chỉ orchestration

```typescript
// ✅ Đúng
export const LoginPage = () => {
  return <LoginForm />;
};

// ❌ Sai: Logic trong page
export const LoginPage = () => {
  const { mutate } = useLogin();
  return <form onSubmit={...}>...</form>;
};
```

### 3. Layout tái sử dụng

```typescript
// ✅ Đúng: Layout trong shared
// shared/layouts/DashboardLayout.tsx

// ❌ Sai: Layout trong feature
// features/dashboard/layouts/DashboardLayout.tsx
```

---

## Troubleshooting

### Lỗi "Route not found"

**Nguyên nhân**: Route chưa được đăng ký trong route tree.

**Giải pháp**:

1. Kiểm tra route đã được export từ feature chưa
2. Kiểm tra route đã được add vào route tree trong `app.router.tsx` chưa
3. Restart dev server

```typescript
// ✅ Đúng: Đăng ký route
const routeTree = rootRoute.addChildren([authRoute.addChildren([loginRoute, registerRoute])]);
```

### Lỗi "Cannot read property 'pathname' of undefined"

**Nguyên nhân**: Router chưa được setup đúng trong `main.tsx`.

**Giải pháp**:

1. Kiểm tra `RouterProvider` đã wrap app chưa
2. Kiểm tra `router` instance đã được tạo chưa
3. Kiểm tra `routeTree` đã được định nghĩa chưa

```typescript
// ✅ Đúng: Setup router trong main.tsx
<RouterProvider router={router} />
```

### Lỗi TypeScript với route params

**Nguyên nhân**: Chưa define types cho route params.

**Giải pháp**:

1. Define params trong route definition
2. Sử dụng `route.useParams()` để lấy params

```typescript
// ✅ Đúng: Define params
export const productDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products/$productId',
  component: ProductDetailPage,
});

// Trong component
const { productId } = productDetailRoute.useParams();
```

### Lỗi "beforeLoad is not a function"

**Nguyên nhân**: `beforeLoad` không được gọi đúng cách.

**Giải pháp**:

1. Kiểm tra `beforeLoad` là async function
2. Kiểm tra return type (redirect hoặc void)

```typescript
// ✅ Đúng: beforeLoad async
beforeLoad: async () => {
  const { token } = useAuthStore.getState();
  if (!token) {
    throw redirect({ to: '/auth/login' });
  }
};
```

### Lỗi Navigation không hoạt động

**Nguyên nhân**: `useNavigate` hoặc `Link` không được import đúng.

**Giải pháp**:

1. Import từ `@tanstack/react-router`
2. Kiểm tra router đã được setup chưa

```typescript
// ✅ Đúng: Import từ @tanstack/react-router
import { useNavigate, Link } from '@tanstack/react-router';
```

---

## 📚 Tài liệu liên quan

- [Creating a Feature](creating-feature.md)
- [Code Examples](../templates/code-examples.md)
- [Architecture Overview](../architecture/overview.md)

---

**TanStack Router giúp routing type-safe và dễ maintain! 🚀**
