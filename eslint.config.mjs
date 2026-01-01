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
      // boundaries,
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
      // 'boundaries/include': ['src/**/*'],
      // 'boundaries/elements': [
      //   { type: 'app', pattern: 'src/app' },
      //   { type: 'feature', pattern: 'src/features/*/**', capture: ['featureName'] },
      //   { type: 'shared', pattern: 'src/shared' },
      //   { type: 'locales', pattern: 'src/locales' },
      //   { type: 'assets', pattern: 'src/assets' },
      //   { type: 'tests', pattern: 'src/tests' },
      // ],
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
      // Disable no-relative-parent-imports vì chúng ta dùng path aliases (@shared, @features, etc.)
      // Path aliases không phải là relative imports nên rule này không áp dụng
      'import/no-relative-parent-imports': 'off',
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

      // ESLint built-in rules
      'prefer-const': 'error',

      // React rules
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // Node.js files (scripts, config files)
  {
    files: ['scripts/**/*.js', '*.config.{js,ts}', '*.config.{cjs,mjs}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  // Testing files: apply recommended rules
  {
    files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
    rules: {
      // ...testingLibrary.configs['flat/react'].rules,
      // ...jestDom.configs['flat/recommended'].rules,
      // Disable TypeScript errors for test files (types are handled by Jest/ts-jest)
      '@typescript-eslint/no-explicit-any': 'off',
      // Allow triple slash references in test files for jest-dom types
      '@typescript-eslint/triple-slash-reference': 'off',
    },
  },

  // Architecture Boundaries
  // {
  //   files: ['src/**/*.{ts,tsx}'],
  //   rules: {
  //     'boundaries/element-types': [
  //       'error',
  //       {
  //         default: 'allow',
  //         rules: [
  //           // Shared can only import from libs, shared, locales, assets
  //           {
  //             from: ['shared'],
  //             disallow: ['app', 'feature', 'tests'],
  //             message: 'Shared module should not import from upper layers (${dependency.type})',
  //           },
  //           // Features can import from shared, locales, assets, and SAME feature
  //           {
  //             from: ['feature'],
  //             disallow: [
  //               'app', // Features should not depend on App config
  //               ['feature', { featureName: '!${from.featureName}' }], // Disallow other features
  //             ],
  //             message: 'Feature should not import from other features or app layer',
  //           },
  //         ],
  //       },
  //     ],
  //   },
  // },

  // Prettier config (must be last)
  prettier
);
