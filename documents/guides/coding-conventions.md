# 📝 Coding Conventions

Quy tắc viết code, naming conventions, và import rules.

## 📋 Mục lục

- [Naming Conventions](#naming-conventions)
- [Import Rules](#import-rules)
- [File Organization](#file-organization)
- [Code Style](#code-style)
- [ESLint Rules](#eslint-rules)

---

## Naming Conventions

### Files

| Type      | Pattern                      | Example                              |
| --------- | ---------------------------- | ------------------------------------ |
| API       | `<action>.api.ts`            | `login.api.ts`, `get-user.api.ts`    |
| Hook      | `use<Name>.ts`               | `useLogin.ts`, `useUserProfile.ts`   |
| Component | `<Name>.tsx`                 | `LoginForm.tsx`, `UserCard.tsx`      |
| Page      | `<Name>Page.tsx`             | `LoginPage.tsx`, `DashboardPage.tsx` |
| Store     | `<name>.store.ts`            | `auth.store.ts`, `user.store.ts`     |
| Types     | `<name>.types.ts`            | `auth.types.ts`, `user.types.ts`     |
| Validator | `<name>.schema.ts`           | `auth.schema.ts`, `user.schema.ts`   |
| Constants | `<name>-<type>.constants.ts` | `auth-query-keys.constants.ts`       |
| Utils     | `<name>.utils.ts`            | `date.utils.ts`, `format.utils.ts`   |

### Variables & Functions

```typescript
// ✅ Đúng
const userName = 'John';
const isAuthenticated = true;
const getUserData = () => {};

// ❌ Sai
const user_name = 'John'; // snake_case
const IsAuthenticated = true; // PascalCase cho boolean
const GetUserData = () => {}; // PascalCase cho function
```

### Components

```typescript
// ✅ Đúng: PascalCase với arrow function
export const LoginForm = () => {};

// ✅ Cũng đúng: PascalCase với function declaration (cho components phức tạp)
export function DashboardPage() {}

// ❌ Sai
export const loginForm = () => {}; // camelCase
export const login_form = () => {}; // snake_case
```

**Lưu ý**:

- Ưu tiên `export const Component = () => {}` cho components đơn giản
- Có thể dùng `export function Component() {}` cho components phức tạp hoặc cần hoisting
- Nhưng phải consistent trong cùng một feature

### Constants

```typescript
// ✅ Đúng: UPPER_SNAKE_CASE
export const API_BASE_URL = 'https://api.example.com';
export const MAX_RETRY_ATTEMPTS = 3;

// ❌ Sai
export const apiBaseUrl = 'https://api.example.com'; // camelCase
```

---

## Import Rules

### 1. Luôn dùng Path Aliases

```typescript
// ✅ Đúng
import { Button } from '@shared/ui/Button';
import { useLogin } from '@features/auth/hooks/useLogin';

// ❌ Sai
import { Button } from '../../../shared/ui/Button';
import { useLogin } from '../../hooks/useLogin';
```

### 2. Không dùng Barrel Exports

```typescript
// ✅ Đúng
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';

// ❌ Sai
import { Button, Input } from '@shared/ui'; // barrel export
```

### 3. Import Order

```typescript
// 1. React & external libraries
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

// 2. App imports (nếu có)
import { router } from '@app/app.router';

// 3. Shared imports
import { Button } from '@shared/ui/Button';
import { formatDate } from '@shared/lib/date.utils';
import { logger } from '@shared/lib/logger';

// 4. Feature imports
import { useLogin } from '@features/auth/hooks/useLogin';
import { LoginForm } from '@features/auth/components/LoginForm';

// 5. Types (nếu cần, nên đặt cuối cùng)
import type { User } from '@features/auth/types/auth.types';
```

**Lưu ý**:

- Mỗi group cách nhau bằng một dòng trống
- Types imports nên đặt cuối cùng và dùng `import type`
- Relative imports (./ hoặc ../) chỉ dùng trong cùng folder

### 4. Feature Isolation

```typescript
// ❌ SAI: Feature import feature khác
// features/auth/components/LoginForm.tsx
import { useUser } from '@features/user/hooks/useUser';

// ✅ ĐÚNG: Chỉ import shared
import { Button } from '@shared/ui/Button';
import { useAuth } from '@features/auth/hooks/useAuth';
```

---

## File Organization

### Component Structure

```typescript
// 1. Imports
import React from 'react';
import { Button } from '@shared/ui/Button';

// 2. Types (nếu cần)
interface Props {
  title: string;
}

// 3. Component
export const MyComponent = ({ title }: Props) => {
  // 4. Hooks
  const [state, setState] = React.useState();

  // 5. Handlers
  const handleClick = () => {};

  // 6. Render
  return <Button onClick={handleClick}>{title}</Button>;
};
```

### Hook Structure

```typescript
// 1. Imports
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/example.api';

// 2. Hook
export const useExample = () => {
  return useQuery({
    queryKey: ['example'],
    queryFn: api.getExample,
  });
};
```

---

## Code Style

### TypeScript

```typescript
// ✅ Đúng: Explicit types
interface User {
  id: string;
  name: string;
}

const user: User = {
  id: '1',
  name: 'John',
};

// ❌ Sai: any
const user: any = {
  id: '1',
  name: 'John',
};
```

### React

```typescript
// ✅ Đúng: Functional components
export const MyComponent = () => {
  return <div>Hello</div>;
};

// ❌ Sai: Class components (trừ khi cần thiết)
export class MyComponent extends React.Component {
  render() {
    return <div>Hello</div>;
  }
}
```

### Async/Await

```typescript
// ✅ Đúng: async/await
const fetchData = async () => {
  const response = await api.getData();
  return response;
};

// ❌ Sai: .then() chains (trừ khi cần thiết)
const fetchData = () => {
  return api.getData().then((response) => response);
};
```

---

## ESLint Rules

### Cấu hình `eslint.config.mjs` (Flat Config)

Project sử dụng ESLint 9 với **flat config** format:

```javascript
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import jestDom from 'eslint-plugin-jest-dom';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import testingLibrary from 'eslint-plugin-testing-library';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Base recommended config
  js.configs.recommended,

  // Global ignores
  {
    ignores: [
      'dist',
      'build',
      '.vite',
      'node_modules',
      '*.config.js',
      '*.config.ts',
      '*.config.cjs',
      '*.config.mjs',
      '.husky',
      'coverage',
      '.next',
      '.turbo',
    ],
  },

  // TypeScript files
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      import: importPlugin,
      'testing-library': testingLibrary,
      'jest-dom': jestDom,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    rules: {
      // Testing Library & Jest DOM
      'testing-library/await-async-queries': 'error',
      'testing-library/no-await-sync-queries': 'error',
      'testing-library/no-debugging-utils': 'warn',
      'testing-library/no-dom-import': ['error', 'react'],
      'jest-dom/prefer-checked': 'warn',
      'jest-dom/prefer-enabled-disabled': 'warn',
      'jest-dom/prefer-required': 'warn',
      'jest-dom/prefer-to-have-attribute': 'warn',
      'jest-dom/prefer-to-have-text-content': 'warn',

      // React Refresh rules
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // Import rules
      'import/no-relative-parent-imports': 'error',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          pathGroups: [
            {
              pattern: '@app/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '@shared/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '@features/**',
              group: 'internal',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],

      // TypeScript rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-const': 'error',

      // React rules
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // Testing files
  {
    files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
    rules: {
      // Testing-specific rules can be added here
    },
  },

  // Prettier config (must be last)
  prettier
);
```

---

## Prettier Config

### `.prettierrc`

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 120,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "bracketSpacing": true
}
```

**Lưu ý**:

- `printWidth: 120` để phù hợp với màn hình hiện đại
- `bracketSpacing: true` để có spacing trong object literals

---

## 📚 Tài liệu liên quan

- [Creating a Feature](creating-feature.md)
- [Code Examples](../templates/code-examples.md)
- [Team Handbook](../team-handbook.md)

---

**Tuân thủ conventions giúp code dễ đọc, dễ maintain! 🚀**
