# ⚙️ Configuration Files

Chi tiết cấu hình các file config trong project.

## 📋 Mục lục

- [TypeScript Config](#typescript-config)
- [Vite Config](#vite-config)
- [Tailwind Config](#tailwind-config)
- [ESLint Config](#eslint-config)
- [Prettier Config](#prettier-config)
- [Jest Config](#jest-config)
- [Husky Config](#husky-config)
- [Lint-staged Config](#lint-staged-config)
- [Commitlint Config](#commitlint-config)

---

## TypeScript Config

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "verbatimModuleSyntax": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true,

    /* Path Aliases */
    "baseUrl": ".",
    "paths": {
      "@app/*": ["src/app/*"],
      "@features/*": ["src/features/*"],
      "@shared/*": ["src/shared/*"],
      "@locales/*": ["src/locales/*"],
      "@assets/*": ["src/assets/*"],
      "@tests/*": ["src/tests/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "build"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### `tsconfig.node.json`

```json
{
  "compilerOptions": {
    "composite": true,
    "target": "ES2022",
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "types": ["node"]
  },
  "include": ["vite.config.ts"]
}
```

---

## Vite Config

### `vite.config.ts`

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
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

---

## Tailwind Config

### `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Thêm custom colors nếu cần
      },
    },
  },
  plugins: [],
};

export default config;
```

### `postcss.config.js`

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

---

## ESLint Config

Project sử dụng **ESLint 9** với **flat config** format (file `eslint.config.mjs`).

### `eslint.config.mjs`

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

**Lưu ý**: ESLint 9 sử dụng flat config format, không còn dùng `.eslintrc.*` files nữa.

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

### `.prettierignore`

```
node_modules
dist
build
.vite
*.min.js
*.min.css
package-lock.json
yarn.lock
```

---

## Jest Config

### `jest.config.mjs`

```javascript
import { createDefaultPreset } from 'ts-jest';

const preset = createDefaultPreset({ tsconfig: './tsconfig.json' });

export default {
  ...preset,
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup-jest.ts'],
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

### `src/tests/setup-jest.ts`

```typescript
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

## VS Code Settings

### `.vscode/settings.json`

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

### `.vscode/extensions.json`

```json
{
  "recommendations": ["esbenp.prettier-vscode", "dbaeumer.vscode-eslint", "bradlc.vscode-tailwindcss"]
}
```

---

## Environment Variables

### `.env.example`

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=React 19 Base
```

### `.env.local` (không commit)

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=React 19 Base
```

Sử dụng trong code:

```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

---

## Husky Config

Project sử dụng **Husky 9** để quản lý Git hooks.

### Setup

Husky được tự động khởi tạo qua script `prepare` trong `package.json`:

```json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

### Pre-commit Hook

File `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

Hook này sẽ chạy `lint-staged` trước mỗi commit để kiểm tra và format code.

### Commit-msg Hook

File `.husky/commit-msg`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no-install commitlint --edit "$1"
```

Hook này sẽ kiểm tra format commit message theo quy tắc của commitlint.

---

## Lint-staged Config

Lint-staged được cấu hình trong `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{json,css,md}": ["prettier --write"]
  }
}
```

**Chức năng**:

- Tự động chạy ESLint fix và Prettier format trên các file đã staged
- Chỉ xử lý các file có thay đổi (staged), không chạy trên toàn bộ codebase
- Được trigger tự động qua Husky pre-commit hook

---

## Commitlint Config

Commitlint được cấu hình trong file `commitlint.config.cjs`:

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
    'body-leading-blank': [1, 'always'],
    'body-max-line-length': [2, 'always', 100],
    'footer-leading-blank': [1, 'always'],
    'footer-max-line-length': [2, 'always', 100],
  },
};
```

**Commit message format** (Conventional Commits):

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Ví dụ**:

- `feat(auth): add login functionality`
- `fix(ui): resolve button click issue`
- `docs: update README.md`
- `chore: update dependencies`

**Types cho phép**:

- `feat`: Tính năng mới
- `fix`: Sửa lỗi
- `docs`: Cập nhật tài liệu
- `style`: Thay đổi format (không ảnh hưởng logic)
- `refactor`: Refactor code
- `perf`: Cải thiện hiệu năng
- `test`: Thêm/sửa test
- `build`: Thay đổi build system
- `ci`: Thay đổi CI/CD
- `chore`: Công việc khác
- `revert`: Revert commit

---

## 📝 Notes

- Tất cả config files nên được commit vào git
- `.env.local` không được commit (đã có trong `.gitignore`)
- Path aliases phải khớp giữa `tsconfig.json` và `vite.config.ts`
- ESLint và Prettier nên được setup trong VS Code để format on save
- Husky hooks sẽ tự động chạy khi commit (pre-commit) và kiểm tra commit message (commit-msg)
- Lint-staged chỉ chạy trên các file đã staged, giúp commit nhanh hơn

---

**Lưu ý**: Sau khi thay đổi config, restart dev server và editor.
