# 🧪 Testing Strategy

Chiến lược testing cho React 19 Base Project.

## 📋 Mục lục

- [Test Pyramid](#test-pyramid)
- [Unit Tests](#unit-tests)
- [Integration Tests](#integration-tests)
- [E2E Tests](#e2e-tests)
- [MSW Setup](#msw-setup)

---

## Test Pyramid

```
        E2E (Playwright)
      ──────────────────
    Integration (RTL + MSW)
  ────────────────────────────
Unit (hooks, utils, validators)
```

### Nguyên tắc

- **Test theo feature**, không theo layer
- Mỗi feature **tự chịu trách nhiệm test của nó**
- **Mock API bằng MSW**, không mock hooks

---

## Unit Tests

### Test cái gì?

- `utils/` - Utility functions
- `validators/` - Zod schemas
- Custom hooks **không dùng Query**
- Store (Zustand)

### Ví dụ: Test Utility

```typescript
// src/features/auth/utils/token.utils.test.ts
import { describe, expect, it } from '@jest/globals';
import { parseJWT, isTokenExpired } from './token.utils';

describe('token.utils', () => {
  it('should parse JWT token', () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
    const decoded = parseJWT(token);
    expect(decoded).toHaveProperty('userId');
  });

  it('should check if token is expired', () => {
    const expiredToken = '...';
    expect(isTokenExpired(expiredToken)).toBe(true);
  });
});
```

### Ví dụ: Test Validator

```typescript
// src/features/auth/validators/auth.schema.test.ts
import { describe, expect, it } from '@jest/globals';
import { loginSchema } from './auth.schema';

describe('loginSchema', () => {
  it('should validate valid login data', () => {
    const data = {
      email: 'test@test.com',
      password: 'password123',
    };
    expect(() => loginSchema.parse(data)).not.toThrow();
  });

  it('should reject invalid email', () => {
    const data = {
      email: 'invalid-email',
      password: 'password123',
    };
    expect(() => loginSchema.parse(data)).toThrow();
  });
});
```

### Ví dụ: Test Store

```typescript
// src/features/auth/stores/auth.store.test.ts
import { beforeEach, describe, expect, it } from '@jest/globals';
import { useAuthStore } from './auth.store';

describe('auth.store', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('should set user', () => {
    const user = { id: '1', email: 'test@test.com', name: 'Test' };
    useAuthStore.getState().setUser(user);
    expect(useAuthStore.getState().user).toEqual(user);
  });

  it('should logout', () => {
    useAuthStore.getState().setUser({ id: '1', email: 'test@test.com', name: 'Test' });
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().user).toBeNull();
  });
});
```

---

## Integration Tests

### Test cái gì?

- Component + Hook + Query + Router
- Form validation
- User interactions
- Navigation

### Setup Test Utils

```typescript
// src/tests/test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router';
import { rootRoute } from '@app/app.router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

export const renderWithProviders = (
  ui: React.ReactElement,
  options?: RenderOptions
) => {
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      {ui}
    </QueryClientProvider>,
    options
  );
};
```

### Ví dụ: Test Component

```typescript
// src/features/auth/components/LoginForm.test.tsx
import { describe, expect, it } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';
import { renderWithProviders } from '@tests/test-utils';

describe('LoginForm', () => {
  it('should render login form', () => {
    renderWithProviders(<LoginForm />);
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    await user.type(screen.getByPlaceholderText('Email'), 'test@test.com');
    await user.type(screen.getByPlaceholderText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/success/i)).toBeInTheDocument();
    });
  });
});
```

### Ví dụ: Test với MSW

```typescript
// src/features/auth/components/LoginForm.test.tsx
import { describe, expect, it } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server } from '@tests/mocks/server';
import { http, HttpResponse } from 'msw';
import { LoginForm } from './LoginForm';
import { renderWithProviders } from '@tests/test-utils';

describe('LoginForm', () => {
  it('should handle login success', async () => {
    server.use(
      http.post('/auth/login', () => {
        return HttpResponse.json({
          token: 'token123',
          user: { id: '1', email: 'test@test.com', name: 'Test' },
        });
      })
    );

    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    await user.type(screen.getByPlaceholderText('Email'), 'test@test.com');
    await user.type(screen.getByPlaceholderText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/success/i)).toBeInTheDocument();
    });
  });

  it('should handle login error', async () => {
    server.use(
      http.post('/auth/login', () => {
        return HttpResponse.json(
          { message: 'Invalid credentials' },
          { status: 401 }
        );
      })
    );

    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    await user.type(screen.getByPlaceholderText('Email'), 'test@test.com');
    await user.type(screen.getByPlaceholderText('Password'), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
```

---

## E2E Tests

### Setup Playwright

```bash
yarn add -D @playwright/test
npx playwright install
```

### Ví dụ: E2E Test

```typescript
// e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test('login flow', async ({ page }) => {
  await page.goto('/auth/login');

  await page.fill('input[type="email"]', 'test@test.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('text=Dashboard')).toBeVisible();
});
```

---

## MSW Setup

### Setup MSW

```typescript
// src/tests/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### Handlers

```typescript
// src/tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: '1', name: 'User 1' },
      { id: '2', name: 'User 2' },
    ]);
  }),

  http.post('/auth/login', async ({ request }) => {
    const body = await request.json();
    if (body.email === 'test@test.com' && body.password === 'password123') {
      return HttpResponse.json({
        token: 'token123',
        user: { id: '1', email: 'test@test.com', name: 'Test' },
      });
    }
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }),
];
```

### Jest Setup

```javascript
// jest.config.mjs
import { createDefaultPreset } from 'ts-jest';

const preset = createDefaultPreset({ tsconfig: './tsconfig.json' });

export default {
  ...preset,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup-jest.ts'],
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@locales/(.*)$': '<rootDir>/src/locales/$1',
    '^@assets/(.*)$': '<rootDir>/src/assets/$1',
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { useESM: true, tsconfig: './tsconfig.json' }],
  },
};
```

```typescript
// src/tests/setup-jest.ts
import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll } from '@jest/globals';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());
```

---

## Best Practices

### 1. Không mock hooks nội bộ

```typescript
// ❌ Sai: Mock hook
jest.mock('@features/auth/hooks/useLogin', () => ({
  useLogin: () => ({ mutate: jest.fn() }),
}));

// ✅ Đúng: Mock API bằng MSW
server.use(
  http.post('/auth/login', () => HttpResponse.json({ ... }))
);
```

### 2. Test behavior, không test implementation

```typescript
// ❌ Sai: Test implementation
expect(component.state.isLoading).toBe(true);

// ✅ Đúng: Test behavior
expect(screen.getByText(/loading/i)).toBeInTheDocument();
```

### 3. Test theo feature

```
features/auth/
├── components/
│   └── LoginForm.test.tsx
├── hooks/
│   └── useLogin.test.ts
└── validators/
    └── auth.schema.test.ts
```

---

## 📚 Tài liệu liên quan

- [Creating a Feature](creating-feature.md)
- [Code Examples](../templates/code-examples.md)
- [Team Handbook](../team-handbook.md)

---

**Testing giúp code ổn định và dễ maintain! 🚀**
