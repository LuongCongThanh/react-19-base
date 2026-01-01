# 🎯 Creating a Feature

Hướng dẫn từng bước tạo feature mới với code examples.

## 📋 Mục lục

- [Checklist](#checklist)
- [Bước 1: Tạo cấu trúc thư mục](#bước-1-tạo-cấu-trúc-thư-mục)
- [Bước 2: Tạo Types](#bước-2-tạo-types)
- [Bước 3: Tạo API Files](#bước-3-tạo-api-files)
- [Bước 4: Tạo Query Keys](#bước-4-tạo-query-keys)
- [Bước 5: Tạo Hooks](#bước-5-tạo-hooks)
- [Bước 6: Tạo Validators](#bước-6-tạo-validators)
- [Bước 7: Tạo Components](#bước-7-tạo-components)
- [Bước 8: Tạo Pages](#bước-8-tạo-pages)
- [Bước 9: Tạo Routes](#bước-9-tạo-routes)
- [Bước 10: Testing](#bước-10-testing)
- [Ví dụ: Feature Auth](#ví-dụ-feature-auth)

---

## ✅ Checklist

Trước khi bắt đầu, đảm bảo bạn đã:

- [ ] Đọc [Architecture Overview](../architecture/overview.md)
- [ ] Hiểu [Folder Structure](../architecture/folder-structure.md)
- [ ] Xem [Code Examples](../templates/code-examples.md)

---

## Bước 1: Tạo cấu trúc thư mục

```bash
# Tạo thư mục feature
mkdir -p src/features/<feature-name>/{api,pages,components,hooks,stores,types,validators,utils,constants}
```

Ví dụ với feature `auth`:

```bash
mkdir -p src/features/auth/{api,pages,components,hooks,stores,types,validators,utils,constants}
```

---

## Bước 2: Tạo Types

Tạo file `src/features/<feature-name>/types/<feature-name>.types.ts`

```typescript
// Ví dụ: src/features/auth/types/auth.types.ts

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  name: string;
}
```

> 📖 Xem template đầy đủ: [Code Examples](../templates/code-examples.md#types)

---

## Bước 3: Tạo API Files

Tạo file cho mỗi API endpoint.

### Ví dụ: `src/features/auth/api/login.api.ts`

```typescript
import { httpClient } from '@shared/lib/axios.client';
import type { LoginRequest, LoginResponse } from '../types/auth.types';

export const loginApi = {
  login(payload: LoginRequest): Promise<LoginResponse> {
    return httpClient.post('/auth/login', payload);
  },
};
```

### Ví dụ: `src/features/auth/api/register.api.ts`

```typescript
import { httpClient } from '@shared/lib/axios.client';
import type { RegisterRequest, RegisterResponse } from '../types/auth.types';

export const registerApi = {
  register(payload: RegisterRequest): Promise<RegisterResponse> {
    return httpClient.post('/auth/register', payload);
  },
};
```

> 📖 Xem template đầy đủ: [Code Examples](../templates/code-examples.md#api)

---

## Bước 4: Tạo Query Keys

Tạo file `src/features/<feature-name>/constants/<feature-name>-query-keys.constants.ts`

```typescript
// Ví dụ: src/features/auth/constants/auth-query-keys.constants.ts

export const AUTH_QUERY_KEYS = {
  root: ['auth'] as const,

  me: () => [...AUTH_QUERY_KEYS.root, 'me'] as const,

  sessions: () => [...AUTH_QUERY_KEYS.root, 'sessions'] as const,
};
```

> 📖 Xem template đầy đủ: [Code Examples](../templates/code-examples.md#query-keys)

---

## Bước 5: Tạo Hooks

Tạo hooks sử dụng TanStack Query.

### Query Hook

```typescript
// src/features/auth/hooks/useAuthMe.ts
import { useQuery } from '@tanstack/react-query';
import { AUTH_QUERY_KEYS } from '../constants/auth-query-keys.constants';
import { authApi } from '../api/auth-me.api';

export const useAuthMe = () => {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.me(),
    queryFn: authApi.getMe,
    staleTime: 5 * 60 * 1000,
  });
};
```

### Mutation Hook

```typescript
// src/features/auth/hooks/useLogin.ts
import { useMutation } from '@tanstack/react-query';
import { loginApi } from '../api/login.api';

export const useLogin = () => {
  return useMutation({
    mutationFn: loginApi.login,
  });
};
```

> 📖 Xem template đầy đủ: [Code Examples](../templates/code-examples.md#hooks)

---

## Bước 6: Tạo Validators

Tạo Zod schemas cho validation.

```typescript
// src/features/auth/validators/auth.schema.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
```

> 📖 Xem template đầy đủ: [Code Examples](../templates/code-examples.md#validators)

---

## Bước 7: Tạo Components

Tạo UI components với form validation.

### Component với react-hook-form + zod

```typescript
// src/features/auth/components/LoginForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useLogin } from '../hooks/useLogin';
import { loginSchema, type LoginFormData } from '../validators/auth.schema';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';

export const LoginForm = () => {
  const navigate = useNavigate();
  const { mutate, isPending, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const navigate = useNavigate();

  const onSubmit = (data: LoginFormData) => {
    mutate(data, {
      onError: (error) => {
        console.error('Login error:', error);
      },
      onSuccess: () => {
        // Navigate using TanStack Router
        navigate({ to: '/dashboard' });
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error.message}</p>
        </div>
      )}

      <div>
        <Input
          {...register('email')}
          type="email"
          placeholder="Email"
          error={errors.email?.message}
        />
      </div>

      <div>
        <Input
          {...register('password')}
          type="password"
          placeholder="Password"
          error={errors.password?.message}
        />
      </div>

      <Button type="submit" loading={isPending} className="w-full">
        Login
      </Button>
    </form>
  );
};
```

### Form Validation Integration

**react-hook-form + zod** hoạt động như sau:

1. **Zod Schema** định nghĩa validation rules
2. **zodResolver** convert Zod schema thành react-hook-form resolver
3. **useForm** với `zodResolver` tự động validate form
4. **errors** object chứa validation errors

> 📖 Xem template đầy đủ: [Code Examples](../templates/code-examples.md#components)

---

## Bước 8: Tạo Pages

Tạo route pages (chỉ orchestration).

```typescript
// src/features/auth/pages/LoginPage.tsx
import { LoginForm } from '../components/LoginForm';

export const LoginPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoginForm />
    </div>
  );
};
```

> 📖 Xem template đầy đủ: [Code Examples](../templates/code-examples.md#pages)

---

## Bước 9: Tạo Routes

Tạo route definitions.

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

### 9.1. Đăng ký routes trong `src/app/app.router.tsx`

Sau khi tạo routes trong feature, cần đăng ký chúng vào router:

```typescript
// src/app/app.router.tsx
import { createRouter, createRootRoute, Outlet } from '@tanstack/react-router';
import { authRoute, loginRoute, registerRoute } from '@features/auth/auth.routes';
// Import các routes khác từ features khác
// import { dashboardRoute } from '@features/dashboard/dashboard.routes';

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Tạo route tree với tất cả feature routes
const routeTree = rootRoute.addChildren([
  authRoute.addChildren([loginRoute, registerRoute]),
  // Thêm các feature routes khác ở đây
  // dashboardRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
```

### 9.2. Lưu ý khi đăng ký routes

1. **Thứ tự routes**: Routes được match theo thứ tự, đặt specific routes trước generic routes
2. **Nested routes**: Sử dụng `addChildren` để tạo nested routes
3. **Type safety**: TypeScript sẽ tự động infer types từ route definitions

> 📖 Xem chi tiết: [TanStack Router Guide](tanstack-router.md)

---

## Bước 10: Testing

### Unit Test

```typescript
// src/features/auth/hooks/useLogin.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useLogin } from './useLogin';

describe('useLogin', () => {
  it('should login successfully', async () => {
    const { result } = renderHook(() => useLogin());

    result.current.mutate({
      email: 'test@test.com',
      password: 'password123',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
```

> 📖 Xem chi tiết: [Testing Strategy](testing-strategy.md)

---

## 📝 Ví dụ: Feature Auth

### Cấu trúc hoàn chỉnh

```
features/auth/
├── api/
│   ├── login.api.ts
│   ├── register.api.ts
│   └── logout.api.ts
├── pages/
│   ├── LoginPage.tsx
│   └── RegisterPage.tsx
├── components/
│   ├── LoginForm.tsx
│   └── RegisterForm.tsx
├── hooks/
│   ├── useLogin.ts
│   ├── useRegister.ts
│   └── useAuth.ts
├── stores/
│   └── auth.store.ts
├── types/
│   └── auth.types.ts
├── validators/
│   └── auth.schema.ts
├── utils/
│   └── token.utils.ts
├── constants/
│   └── auth-query-keys.constants.ts
└── auth.routes.tsx
```

---

## ✅ Checklist hoàn thành

- [ ] Cấu trúc thư mục đã tạo
- [ ] Types đã định nghĩa
- [ ] API files đã tạo
- [ ] Query keys đã tạo
- [ ] Hooks đã tạo
- [ ] Validators đã tạo
- [ ] Components đã tạo
- [ ] Pages đã tạo
- [ ] Routes đã đăng ký
- [ ] Tests đã viết
- [ ] Code đã được lint
- [ ] Type check pass

---

## 🎯 Next Steps

1. ✅ Đọc [Coding Conventions](coding-conventions.md)
2. ✅ Xem [TanStack Query Guide](tanstack-query.md)
3. ✅ Xem [TanStack Router Guide](tanstack-router.md)

---

**Chúc bạn tạo feature thành công! 🚀**
