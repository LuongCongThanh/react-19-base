# 📝 Code Examples

Template code cho mỗi loại file trong feature.

## 📋 Mục lục

- [Axios Client](#axios-client)
- [Shared UI Components](#shared-ui-components)
- [App Configuration](#app-configuration)
- [Types](#types)
- [API](#api)
- [Query Keys](#query-keys)
- [Hooks](#hooks)
- [Validators](#validators)
- [Components](#components)
- [Pages](#pages)
- [Stores](#stores)
- [Layouts](#layouts)
- [Routes](#routes)
- [Error Handling](#error-handling)

---

## Axios Client

### `src/shared/lib/axios.client.ts`

```typescript
import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { env } from './env.validation';
import { logger } from './logger';
import { navigateTo } from './navigation';
import { refreshAccessToken } from './token-refresh';
import { tokenStorage } from './token-storage';

/**
 * Create axios instance with base URL
 */
export const httpClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Queue type for failed requests waiting for token refresh
 */
type QueuedRequest = {
  resolve: (value: string) => void;
  reject: (reason: Error) => void;
};

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: QueuedRequest[] = [];

/**
 * Process queued requests after token refresh
 */
const processQueue = (error: Error | null, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Request interceptor - Add token to header
 */
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    logger.error('Request interceptor error', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle errors and token refresh
 */
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token: string) => {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return httpClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        processQueue(null, newToken);
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return httpClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        tokenStorage.clear();
        logger.warn('Token refresh failed, redirecting to login', {
          url: originalRequest?.url,
        });
        navigateTo('/auth/login');
        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    const message = error.response?.data?.message || error.message || 'An error occurred';
    logger.error('API request failed', error, {
      url: originalRequest?.url,
      method: originalRequest?.method,
      status: error.response?.status,
    });

    return Promise.reject(new Error(message));
  }
);
```

**Lưu ý**:

- Sử dụng `tokenStorage` thay vì `localStorage` trực tiếp
- Sử dụng `navigateTo` utility thay vì `window.location.href`
- Sử dụng `logger` thay vì `console.error`
- Có token refresh mechanism với request queueing

---

## Shared UI Components

### `src/shared/ui/Button.tsx`

```typescript
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@shared/lib/cn.utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, loading, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 focus:ring-gray-500',
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-base',
      lg: 'h-12 px-6 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

### `src/shared/ui/Input.tsx`

```typescript
import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@shared/lib/cn.utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-md border border-gray-300 px-3 py-2 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

### `src/shared/lib/cn.utils.ts`

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## App Configuration

### `src/app/app.config.ts`

```typescript
import { env } from '@shared/lib/env.validation';

export const appConfig = {
  name: env.VITE_APP_NAME,
  version: env.VITE_APP_VERSION,
  apiBaseUrl: env.VITE_API_BASE_URL,
  features: {
    enableAnalytics: env.VITE_ENABLE_ANALYTICS,
    enableErrorTracking: env.VITE_ENABLE_ERROR_TRACKING,
  },
} as const;
```

**Lưu ý**:

- Sử dụng `env` từ `@shared/lib/env.validation` thay vì `import.meta.env` trực tiếp
- Tất cả env vars được validate với Zod schema
- Type-safe với `as const`

### `src/app/app.store.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  theme: 'light' | 'dark';
  language: 'en' | 'vi';
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'en' | 'vi') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'en',
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'app-storage',
    }
  )
);
```

> 💡 **Lưu ý**:
>
> - `app.config.ts`: Chứa app-level configuration
> - `app.store.ts`: Root store cho app-level state (theme, language, etc.)
> - Cần cài `zustand/middleware` cho persist: `yarn add zustand`

---

## Types

### `src/features/auth/types/auth.types.ts`

```typescript
// Request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// Response types
export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

// Entity types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Other types
export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
```

---

## API

### `src/features/auth/api/login.api.ts`

```typescript
import { httpClient } from '@shared/lib/axios.client';
import type { LoginRequest, LoginResponse } from '../types/auth.types';

export const loginApi = {
  login(payload: LoginRequest): Promise<LoginResponse> {
    return httpClient.post('/auth/login', payload);
  },
};
```

### `src/features/auth/api/register.api.ts`

```typescript
import { httpClient } from '@shared/lib/axios.client';
import type { RegisterRequest, RegisterResponse } from '../types/auth.types';

export const registerApi = {
  register(payload: RegisterRequest): Promise<RegisterResponse> {
    return httpClient.post('/auth/register', payload);
  },
};
```

### `src/features/auth/api/auth-me.api.ts`

```typescript
import { httpClient } from '@shared/lib/axios.client';
import type { User } from '../types/auth.types';

export const authApi = {
  getMe(): Promise<User> {
    return httpClient.get('/auth/me');
  },
};
```

---

## Query Keys

### `src/features/auth/constants/auth-query-keys.constants.ts`

```typescript
export const AUTH_QUERY_KEYS = {
  root: ['auth'] as const,

  me: () => [...AUTH_QUERY_KEYS.root, 'me'] as const,

  sessions: () => [...AUTH_QUERY_KEYS.root, 'sessions'] as const,
};
```

### `src/features/products/constants/product-query-keys.constants.ts`

```typescript
import type { ProductListParams } from '../types/products.types';

export const PRODUCT_QUERY_KEYS = {
  root: ['products'] as const,

  list: (params?: ProductListParams) => [...PRODUCT_QUERY_KEYS.root, 'list', params] as const,

  detail: (id: string) => [...PRODUCT_QUERY_KEYS.root, 'detail', id] as const,
};
```

---

## Hooks

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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AUTH_QUERY_KEYS } from '../constants/auth-query-keys.constants';
import { loginApi } from '../api/login.api';

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginApi.login,
    onSuccess: (data) => {
      // Invalidate queries
      queryClient.setQueryData(AUTH_QUERY_KEYS.me(), data.user);
    },
  });
};
```

### Custom Hook (không dùng Query)

```typescript
// src/features/auth/hooks/useAuth.ts
import { useAuthMe } from './useAuthMe';
import { authStore } from '../stores/auth.store';

export const useAuth = () => {
  const { data: user, isLoading } = useAuthMe();
  const { token } = authStore();

  return {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isLoading,
  };
};
```

---

## Validators

### `src/features/auth/validators/auth.schema.ts`

```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
```

---

## Components

### `src/features/auth/components/LoginForm.tsx`

```typescript
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
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    mutate(data, {
      onError: (error) => {
        setError('root', {
          message: error.message || 'Login failed. Please try again.',
        });
      },
      onSuccess: () => {
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

      {errors.root && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{errors.root.message}</p>
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

> 💡 **Lưu ý**:
>
> - Luôn dùng `useNavigate` từ TanStack Router trong components
> - Chỉ dùng `window.location.href` trong axios interceptor (không có React context)

---

## Layouts

### `src/shared/layouts/AuthLayout.tsx`

```typescript
import { Outlet } from '@tanstack/react-router';

export const AuthLayout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        {children || <Outlet />}
      </div>
    </div>
  );
};
```

### `src/shared/layouts/DashboardLayout.tsx`

```typescript
import { Outlet, Link } from '@tanstack/react-router';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

export const DashboardLayout = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
```

### `src/shared/layouts/components/Sidebar.tsx`

```typescript
import { Link } from '@tanstack/react-router';
import { cn } from '@shared/lib/cn.utils';

interface SidebarProps {
  className?: string;
}

export const Sidebar = ({ className }: SidebarProps) => {
  return (
    <aside className={cn('w-64 bg-gray-900 text-white', className)}>
      <nav className="p-4">
        <ul className="space-y-2">
          <li>
            <Link
              to="/dashboard"
              className="block rounded-md px-3 py-2 hover:bg-gray-800"
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/products"
              className="block rounded-md px-3 py-2 hover:bg-gray-800"
            >
              Products
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};
```

### `src/shared/layouts/components/Header.tsx`

```typescript
export const Header = () => {
  return (
    <header className="border-b bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-4">
          {/* User menu, notifications, etc. */}
        </div>
      </div>
    </header>
  );
};
```

---

## Pages

### `src/features/auth/pages/LoginPage.tsx`

```typescript
import { LoginForm } from '../components/LoginForm';
import { AuthLayout } from '@shared/layouts/AuthLayout';

export const LoginPage = () => {
  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        <LoginForm />
      </div>
    </AuthLayout>
  );
};
```

---

## Stores

### `src/features/auth/stores/auth.store.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { AuthState, User } from '@features/auth/types/auth.types';
import type { AccessToken } from '@shared/types/common.types';

interface AuthStore extends AuthState {
  setAuth: (user: User, token: AccessToken) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),

      clearAuth: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

**Lưu ý**:

- Sử dụng `persist` middleware để lưu state vào storage
- Sử dụng branded types (`AccessToken`) cho type safety
- Có `isAuthenticated` flag để dễ check
- Sử dụng `setAuth` và `clearAuth` thay vì setUser/setToken riêng lẻ

---

## Routes

### `src/features/auth/auth.routes.tsx`

```typescript
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

---

## Error Handling

### API với Error Handling

```typescript
// src/features/auth/api/login.api.ts
import { httpClient } from '@shared/lib/axios.client';
import type { LoginRequest, LoginResponse } from '../types/auth.types';

export const loginApi = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await httpClient.post<LoginResponse>('/auth/login', payload);
      return response;
    } catch (error) {
      // Error đã được handle trong axios interceptor
      // Nhưng có thể customize thêm ở đây nếu cần
      if (error instanceof Error) {
        throw new Error(`Login failed: ${error.message}`);
      }
      throw error;
    }
  },
};
```

### Component với Error Handling (react-hook-form + useNavigate)

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
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    mutate(data, {
      onError: (error) => {
        setError('root', {
          message: error.message || 'Login failed. Please try again.',
        });
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

      {errors.root && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{errors.root.message}</p>
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

> 💡 **Lưu ý**:
>
> - Trong **components**: Dùng `useNavigate` từ TanStack Router
> - Trong **axios interceptor**: Dùng `window.location.href` (vì không có React context)

### Hook với Error Handling

```typescript
// src/features/auth/hooks/useLogin.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { loginApi } from '@features/auth/api/login.api';
import { AUTH_QUERY_KEYS } from '@features/auth/constants/auth-query-keys.constants';
import { useAuthStore } from '@features/auth/stores/auth.store';
import { tokenStorage } from '@shared/lib/token-storage';

/**
 * Hook for user login
 *
 * Handles login mutation, token storage, and auth state management
 *
 * @returns Mutation object with login function and state
 */
export const useLogin = () => {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: loginApi.login,
    onSuccess: (data) => {
      // Save token using secure token storage
      tokenStorage.setToken(data.token);

      // Save refresh token if provided
      if (data.refreshToken) {
        tokenStorage.setRefreshToken(data.refreshToken);
      }

      // Update auth store
      setAuth(data.user, data.token);

      // Set query data for immediate access
      queryClient.setQueryData(AUTH_QUERY_KEYS.me(), data.user);
    },
    // Error đã được handle trong axios interceptor và log bằng logger
    // Component sẽ nhận error qua mutation.error
  });
};
```

**Lưu ý**:

- Sử dụng `tokenStorage` thay vì store để lưu token (bảo mật hơn)
- Error đã được log trong axios interceptor bằng `logger`
- Component nhận error qua `mutation.error` và handle trong `onError` callback

---

## 📚 Tài liệu liên quan

- [Creating a Feature](../guides/creating-feature.md)
- [Coding Conventions](../guides/coding-conventions.md)
- [TanStack Query](../guides/tanstack-query.md)

---

**Copy-paste và customize theo nhu cầu! 🚀**
