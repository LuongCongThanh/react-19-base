# ⚡ Quick Reference

Quick reference cho các tasks thường dùng trong React 19 Base Project.

## 📋 Mục lục

- [Tạo Feature Mới](#tạo-feature-mới)
- [Tạo API Endpoint](#tạo-api-endpoint)
- [Tạo Component](#tạo-component)
- [Tạo Page](#tạo-page)
- [Tạo Hook](#tạo-hook)
- [Common Commands](#common-commands)

---

## Tạo Feature Mới

```bash
# Sử dụng script tự động
node scripts/create-feature.js <feature-name>

# Ví dụ
node scripts/create-feature.js user-profile
```

Sau đó:

1. Tạo API files trong `api/`
2. Tạo hooks trong `hooks/`
3. Tạo components trong `components/`
4. Đăng ký routes trong `app.router.tsx`

---

## Tạo API Endpoint

1. Tạo file `api/<action>.api.ts`
2. Import `httpClient` từ `@shared/lib/axios.client`
3. Export API function

```typescript
import { httpClient } from '@shared/lib/axios.client';
import type { RequestType, ResponseType } from '../types/feature.types';

export const actionApi = {
  action(payload: RequestType): Promise<ResponseType> {
    return httpClient.post('/endpoint', payload);
  },
};
```

---

## Tạo Component

1. Tạo file `components/<Name>.tsx`
2. Import hooks và shared UI
3. Implement component

```typescript
import { useHook } from '../hooks/useHook';
import { Button } from '@shared/ui/Button';

export const ComponentName = () => {
  const { data, isLoading } = useHook();

  return <Button>Click me</Button>;
};
```

---

## Tạo Page

1. Tạo file `pages/<Name>Page.tsx`
2. Import components
3. Chỉ compose, không logic

```typescript
import { ComponentName } from '../components/ComponentName';

export const FeaturePage = () => {
  return <ComponentName />;
};
```

---

## Tạo Hook

### Query Hook

```typescript
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../constants/query-keys.constants';
import { api } from '../api/example.api';

export const useExample = () => {
  return useQuery({
    queryKey: QUERY_KEYS.list(),
    queryFn: api.getList,
  });
};
```

### Mutation Hook

```typescript
import { useMutation } from '@tanstack/react-query';
import { api } from '../api/example.api';

export const useCreateExample = () => {
  return useMutation({
    mutationFn: api.create,
  });
};
```

---

## Common Commands

```bash
# Development
yarn dev              # Start dev server
yarn build            # Build for production
yarn preview          # Preview production build

# Code Quality
yarn lint             # Run ESLint
yarn format            # Format with Prettier
yarn type-check        # TypeScript type check

# Testing
yarn test             # Run tests
yarn test:watch        # Run tests in watch mode
yarn test:coverage     # Run tests with coverage
```

---

## Path Aliases

```typescript
@app/*          → src/app/*
@features/*     → src/features/*
@shared/*       → src/shared/*
@locales/*      → src/locales/*
@assets/*       → src/assets/*
```

---

## Import Patterns

```typescript
// App setup
import { queryClient } from '@app/app.query-client';

// Features
import { Component } from '@features/auth/components/Component';

// Shared
import { Button } from '@shared/ui/Button';
import { formatDate } from '@shared/lib/date.utils';
```

---

## 📚 Tài liệu liên quan

- [Creating a Feature](creating-feature.md)
- [Code Examples](../templates/code-examples.md)
- [Coding Conventions](coding-conventions.md)

---

**Quick reference giúp code nhanh hơn! 🚀**
