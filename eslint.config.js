
import js from '@eslint/js';
import eslintPluginImport from 'eslint-plugin-import';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  // Bỏ qua thư mục dist
  { ignores: ['dist'] },

  // JS files
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: globals.browser,
    },
    ...js.configs.recommended,
  },

  // TS/TSX files
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        sourceType: 'module',
      },
      globals: globals.browser,
    },
    plugins: {
      'typescript-eslint': tseslint,
      import: eslintPluginImport,
      'react-hooks': reactHooks,
      reactRefresh,
    },
    rules: {
      // Cơ bản
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      eqeqeq: ['error', 'always'],
      curly: 'error',
      'no-var': 'error',
      'prefer-const': 'error',

      // React
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // TypeScript
      'typescript-eslint/explicit-function-return-type': 'off',

      // Import lint & sắp xếp import
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-unresolved': 'off',
      'import/no-duplicates': 'error',
      'import/newline-after-import': 'warn',
      'import/no-extraneous-dependencies': 'off',
    },
  },
  // Node.js config files (tắt no-undef, bật env node)
  {
    files: ['*.config.js', 'jest.config.js'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      'no-undef': 'off',
    },
  },
  // Tắt no-unused-vars và no-undef cho utils/debounce.ts
  {
    files: ['src/utils/debounce.ts'],
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off',
    },
  },
  // Tắt no-undef cho TSX/JSX (tránh cảnh báo React is not defined)
  {
    files: ['**/*.tsx', '**/*.jsx'],
    rules: {
      'no-undef': 'off',
    },
  },
  // Tắt no-unused-vars cho tất cả file .d.ts
  {
    files: ['**/*.d.ts'],
    rules: {
      'no-unused-vars': 'off',
    },
  },
]);
