# 🚀 Initial Setup Guide

Hướng dẫn setup project React 19 từ đầu với Feature-Based Architecture.

## 📋 Mục lục

- [Yêu cầu](#yêu-cầu)
- [Bước 1: Tạo Project với Vite](#bước-1-tạo-project-với-vite)
- [Bước 2: Cài đặt Dependencies](#bước-2-cài-đặt-dependencies)
- [Bước 3: Cấu hình TypeScript](#bước-3-cấu-hình-typescript)
- [Bước 4: Cấu hình Vite](#bước-4-cấu-hình-vite)
- [Bước 5: Cấu hình Tailwind CSS](#bước-5-cấu-hình-tailwind-css)
- [Bước 6: Cấu hình ESLint + Prettier](#bước-6-cấu-hình-eslint--prettier)
- [Bước 7: Tạo Cấu trúc Thư mục](#bước-7-tạo-cấu-trúc-thư-mục)
- [Bước 8: Setup i18n](#bước-8-setup-i18n)
- [Bước 9: Setup TanStack Query](#bước-9-setup-tanstack-query)
- [Bước 10: Setup TanStack Router](#bước-10-setup-tanstack-router)
- [Bước 11: Setup Axios Client](#bước-11-setup-axios-client)
- [Bước 12: Setup .gitignore](#bước-12-setup-gitignore)
- [Bước 13: Setup package.json Scripts](#bước-13-setup-packagejson-scripts)
- [Bước 14: Complete main.tsx](#bước-14-complete-maintsx)
- [Checklist Hoàn thành](#checklist-hoàn-thành)

---

## ✅ Yêu cầu

- **Node.js**: >= 18.0.0
- **Package Manager**: yarn >= 1.22 (hoặc npm)
- **Editor**: VS Code (khuyến nghị)

---

## Bước 1: Tạo Project với Vite

```bash
# Tạo project với Vite + React + TypeScript
yarn create vite react-19-base --template react-ts

# Hoặc với npm
npm create vite@latest react-19-base --template react-ts

# Di chuyển vào thư mục
cd react-19-base
```

---

## Bước 2: Cài đặt Dependencies

### Core Dependencies

```bash
# React & Vite
yarn add react@latest react-dom@latest

# TypeScript
yarn add -D typescript @types/react @types/react-dom

# Routing
yarn add @tanstack/react-router

# Server State
yarn add @tanstack/react-query

# Client State
yarn add zustand

# i18n
yarn add i18next react-i18next

# Form Validation
yarn add zod
yarn add react-hook-form @hookform/resolvers

# HTTP Client
yarn add axios

# Date utilities
yarn add date-fns

# Class names utility
yarn add clsx tailwind-merge
```

### Dev Dependencies

```bash
# Build & Dev
yarn add -D vite @vitejs/plugin-react

# Styling
yarn add -D tailwindcss postcss autoprefixer

# Linting & Formatting
yarn add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
yarn add -D eslint-plugin-react eslint-plugin-react-hooks
yarn add -D eslint-plugin-import eslint-config-prettier
yarn add -D prettier

# Testing
yarn add -D jest ts-jest @types/jest jest-environment-jsdom
yarn add -D @testing-library/react @testing-library/jest-dom
yarn add -D @testing-library/user-event jsdom
yarn add -D msw @mswjs/data
```

> 📖 Xem danh sách đầy đủ: [Dependencies](dependencies.md)

---

## Bước 3: Cấu hình TypeScript

Tạo/sửa file `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path Aliases */
    "baseUrl": ".",
    "paths": {
      "@app/*": ["src/app/*"],
      "@features/*": ["src/features/*"],
      "@shared/*": ["src/shared/*"],
      "@locales/*": ["src/locales/*"],
      "@assets/*": ["src/assets/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Tạo file `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

---

## Bước 4: Cấu hình Vite

Sửa file `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, './src/app'),
      '@features': path.resolve(__dirname, './src/features'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@locales': path.resolve(__dirname, './src/locales'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
```

Cài đặt `@types/node` để dùng `path`:

```bash
yarn add -D @types/node
```

---

## Bước 5: Cấu hình Tailwind CSS

### 5.1. Khởi tạo Tailwind

```bash
npx tailwindcss init -p
```

### 5.2. Cấu hình `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
```

### 5.3. Tạo file CSS chính

Tạo file `src/styles/tailwind.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Import vào `src/main.tsx`:

```typescript
import './styles/tailwind.css';
```

---

## Bước 6: Cấu hình ESLint + Prettier

### 6.1. ESLint

Tạo file `.eslintrc.cjs`:

```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'prettier',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', '@typescript-eslint', 'import'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    'import/no-relative-parent-imports': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
```

### 6.2. Prettier

Tạo file `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

Tạo file `.prettierignore`:

```
node_modules
dist
build
.vite
```

### 6.3. Thêm scripts vào `package.json`

```json
{
  "scripts": {
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,css}\"",
    "type-check": "tsc --noEmit"
  }
}
```

---

## Bước 7: Tạo Cấu trúc Thư mục

Tạo cấu trúc thư mục cơ bản:

```bash
# App
mkdir -p src/app

# Features (sẽ tạo sau)
mkdir -p src/features

# Shared
mkdir -p src/shared/{ui,layouts,lib,hooks,types,constants,hocs}

# Locales
mkdir -p src/locales/{en,vi}

# Assets
mkdir -p src/assets/{images,icons,fonts}

# Styles
mkdir -p src/styles/{base,components}

# Tests
mkdir -p src/tests/{mocks,utils}
```

> 📖 Xem chi tiết: [Folder Structure](../architecture/folder-structure.md)

---

## Bước 8: Setup i18n

### 8.1. Tạo file cấu hình i18n

Tạo file `src/locales/i18n.config.ts`:

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enCommon from './en/common.json';
import viCommon from './vi/common.json';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: enCommon,
    },
    vi: {
      common: viCommon,
    },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
```

### 8.2. Tạo file translation mẫu

Tạo `src/locales/en/common.json`:

```json
{
  "welcome": "Welcome",
  "hello": "Hello"
}
```

Tạo `src/locales/vi/common.json`:

```json
{
  "welcome": "Chào mừng",
  "hello": "Xin chào"
}
```

### 8.3. Import vào `main.tsx`

```typescript
import './locales/i18n.config';
```

---

## Bước 9: Setup TanStack Query

### 9.1. Tạo Query Client

Tạo file `src/app/app.query-client.ts`:

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

### 9.2. Tạo App Providers

Tạo file `src/app/app.providers.tsx`:

```typescript
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './app.query-client';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

> 💡 **Lưu ý**: Bạn có thể thêm các providers khác vào đây (theme, toast, etc.)

---

## Bước 10: Setup TanStack Router

### 10.1. Tạo Root Route

Tạo file `src/app/app.router.tsx`:

```typescript
import { createRootRoute, Outlet } from '@tanstack/react-router';

export const rootRoute = createRootRoute({
  component: () => <Outlet />,
});
```

### 10.2. Tạo Router Instance

Sửa file `src/app/app.router.tsx`:

```typescript
import { createRouter, createRootRoute, Outlet } from '@tanstack/react-router';

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Route tree ban đầu chỉ có root route
// Sẽ thêm feature routes sau khi tạo features
const routeTree = rootRoute;

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
```

> 💡 **Lưu ý**: Sau khi tạo features, cần import và đăng ký routes vào `routeTree`. Xem: [Creating a Feature](../guides/creating-feature.md#bước-9-tạo-routes)

### 10.3. Sử dụng Router trong `main.tsx`

```typescript
import { RouterProvider } from '@tanstack/react-router';
import { router } from './app/app.router';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
```

---

## Bước 11: Setup Axios Client

### 11.1. Tạo Axios Client

Tạo file `src/shared/lib/axios.client.ts`:

```typescript
import axios from 'axios';

// Tạo axios instance với base URL
export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Thêm token vào header
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
httpClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }

    // Handle other errors
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);
```

### 11.2. Tạo cn.utils

Tạo file `src/shared/lib/cn.utils.ts`:

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 11.3. Tạo Environment Types

Tạo file `src/shared/types/environment.d.ts`:

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

> 📖 Xem chi tiết: [Code Examples](../templates/code-examples.md#axios-client) | [Environment Variables](../guides/environment-variables.md)

---

## Bước 12: Setup .gitignore

Tạo file `.gitignore` ở root của project:

```gitignore
# Dependencies
node_modules
.pnp
.pnp.js

# Testing
coverage

# Production
dist
build

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Vite
.vite
```

---

## Bước 13: Setup package.json Scripts

Thêm scripts vào `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,css}\"",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## Bước 14: Complete main.tsx

Sau khi setup tất cả, file `src/main.tsx` hoàn chỉnh sẽ như sau:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { AppProviders } from './app/app.providers';
import { router } from './app/app.router';
import './locales/i18n.config';
import './styles/tailwind.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </React.StrictMode>
);
```

### Lưu ý

- `AppProviders` wrap `RouterProvider` để cung cấp Query Client và các providers khác
- Import i18n config trước khi render
- Import Tailwind CSS để styles được apply

---

## ✅ Checklist Hoàn thành

- [ ] Project được tạo với Vite
- [ ] Tất cả dependencies đã cài đặt
- [ ] TypeScript config đã setup với path aliases
- [ ] Vite config đã có path aliases
- [ ] Tailwind CSS đã được cấu hình
- [ ] ESLint + Prettier đã setup
- [ ] Cấu trúc thư mục đã được tạo
- [ ] i18n đã được setup
- [ ] TanStack Query đã được setup
- [ ] TanStack Router đã được setup
- [ ] Axios client đã được setup
- [ ] Environment types đã được setup
- [ ] .gitignore đã được tạo
- [ ] package.json scripts đã được setup
- [ ] main.tsx đã được hoàn thiện
- [ ] Chạy `yarn dev` thành công
- [ ] Chạy `yarn lint` không có lỗi
- [ ] Chạy `yarn type-check` không có lỗi

---

## 🎯 Next Steps

1. ✅ Đọc [Architecture Overview](../architecture/overview.md)
2. ✅ Xem [Folder Structure](../architecture/folder-structure.md)
3. ✅ Tạo feature đầu tiên: [Creating a Feature](../guides/creating-feature.md)

---

## 🐛 Troubleshooting

### Lỗi path aliases không hoạt động

- Kiểm tra `tsconfig.json` có đúng `paths`
- Kiểm tra `vite.config.ts` có đúng `resolve.alias`
- Restart dev server

### Lỗi Tailwind không apply styles

- Kiểm tra `tailwind.config.ts` có đúng `content`
- Kiểm tra đã import `tailwind.css` vào `main.tsx`
- Clear cache và restart

### Lỗi ESLint không nhận path aliases

- Cài đặt `eslint-plugin-import`
- Thêm rule `import/no-relative-parent-imports`

### Lỗi axios client không hoạt động

- Kiểm tra `VITE_API_BASE_URL` trong `.env.local`
- Kiểm tra axios instance đã được export đúng chưa
- Kiểm tra interceptors đã được setup chưa

### Lỗi react-hook-form không hoạt động

- Kiểm tra đã cài đặt `react-hook-form` và `@hookform/resolvers`
- Kiểm tra đã import `zodResolver` từ `@hookform/resolvers/zod`
- Kiểm tra schema đã được định nghĩa đúng chưa

---

**Chúc bạn setup thành công! 🚀**
