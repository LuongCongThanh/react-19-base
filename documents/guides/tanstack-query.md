# 🔄 TanStack Query Convention

Convention cho TanStack Query trong project.

## 📋 Mục lục

- [Query Key Convention](#query-key-convention)
- [API Layer](#api-layer)
- [Hook Pattern](#hook-pattern)
- [Invalidation Strategy](#invalidation-strategy)
- [Error Handling](#error-handling)

---

## Query Key Convention

### Mỗi feature có namespace riêng

```typescript
// src/features/auth/constants/auth-query-keys.constants.ts
export const AUTH_QUERY_KEYS = {
  root: ['auth'] as const,

  me: () => [...AUTH_QUERY_KEYS.root, 'me'] as const,

  sessions: () => [...AUTH_QUERY_KEYS.root, 'sessions'] as const,
};
```

### Query keys với params

```typescript
// src/features/products/constants/product-query-keys.constants.ts
import type { ProductListParams } from '../types/products.types';

export const PRODUCT_QUERY_KEYS = {
  root: ['products'] as const,

  list: (params?: ProductListParams) => [...PRODUCT_QUERY_KEYS.root, 'list', params] as const,

  detail: (id: string) => [...PRODUCT_QUERY_KEYS.root, 'detail', id] as const,
};
```

### Quy tắc

- `root` luôn là array
- Function trả về `as const`
- Không dùng string rời rạc

---

## API Layer

### Mỗi endpoint = 1 file

```typescript
// src/features/auth/api/login.api.ts
import { httpClient } from '@shared/lib/axios.client';
import type { LoginRequest, LoginResponse } from '../types/auth.types';

export const loginApi = {
  login(payload: LoginRequest): Promise<LoginResponse> {
    return httpClient.post('/auth/login', payload);
  },
};
```

### ❌ Không

- Không gọi `useQuery` trong api
- Không chứa queryKey trong api
- Không gom nhiều endpoint vào 1 file

---

## Hook Pattern

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
    staleTime: 5 * 60 * 1000, // 5 minutes
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

### Quy tắc

- `useQuery` / `useMutation` **chỉ nằm trong hooks**
- Mỗi hook = 1 use-case
- Không gọi API trực tiếp trong component

---

## Invalidation Strategy

### Invalidate sau mutation

```typescript
// src/features/auth/hooks/useLogout.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AUTH_QUERY_KEYS } from '../constants/auth-query-keys.constants';
import { logoutApi } from '../api/logout.api';

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutApi.logout,
    onSuccess: () => {
      // Remove tất cả auth queries
      queryClient.removeQueries({
        queryKey: AUTH_QUERY_KEYS.root,
      });
    },
  });
};
```

### Update cache sau mutation

```typescript
// src/features/user/hooks/useUpdateProfile.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { USER_QUERY_KEYS } from '../constants/user-query-keys.constants';
import { userApi } from '../api/update-user-profile.api';

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(USER_QUERY_KEYS.me(), data);
    },
  });
};
```

---

## Error Handling

### Global Error Handler

```typescript
// src/app/app.query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      onError: (error) => {
        // Global error handling
        console.error('Query error:', error);
      },
    },
    mutations: {
      onError: (error) => {
        // Global mutation error handling
        console.error('Mutation error:', error);
      },
    },
  },
});
```

### Component Error Handling

```typescript
// src/features/auth/components/LoginForm.tsx
import { useLogin } from '../hooks/useLogin';

export const LoginForm = () => {
  const { mutate, isPending, error } = useLogin();

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error.message}</div>}
      {/* ... */}
    </form>
  );
};
```

---

## Best Practices

### 1. StaleTime hợp lý

```typescript
// ✅ Đúng: Set staleTime cho data ít thay đổi
useQuery({
  queryKey: ['user', id],
  queryFn: () => fetchUser(id),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// ❌ Sai: Không set staleTime (refetch liên tục)
useQuery({
  queryKey: ['user', id],
  queryFn: () => fetchUser(id),
});
```

### 2. Dùng select để giảm re-render

```typescript
// ✅ Đúng: Chỉ subscribe vào field cần thiết
const { data: userName } = useQuery({
  queryKey: ['user', id],
  queryFn: () => fetchUser(id),
  select: (data) => data.name,
});
```

### 3. Prefetch data

```typescript
// Prefetch khi hover
const handleMouseEnter = () => {
  queryClient.prefetchQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });
};
```

---

## 📚 Tài liệu liên quan

- [Creating a Feature](creating-feature.md)
- [Code Examples](../templates/code-examples.md)
- [Testing Strategy](testing-strategy.md)

---

**TanStack Query giúp quản lý server state dễ dàng! 🚀**
