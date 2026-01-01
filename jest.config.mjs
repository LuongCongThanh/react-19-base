import { createDefaultPreset } from 'ts-jest';

const preset = createDefaultPreset({ tsconfig: './tsconfig.test.json' });

export default {
  ...preset,
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup-jest.ts'],
  moduleNameMapper: {
    // Specific mocks must come FIRST before generic patterns
    '^@shared/lib/env\\.validation$': '<rootDir>/src/tests/mocks/env.validation.ts',
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@locales/(.*)$': '<rootDir>/src/locales/$1',
    '^@assets/(.*)$': '<rootDir>/src/assets/$1',
    '^@tests/(.*)$': '<rootDir>/src/tests/$1',
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'mjs'],
  transform: {
    '^.+\\.(t|j)sx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: './tsconfig.test.json',
      },
    ],
  },
  transformIgnorePatterns: ['/node_modules/(?!(msw|@mswjs/interceptors|until-async)/)'],
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)', '**/*.test.[jt]s?(x)'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/tests/**',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 60,
      statements: 60,
    },
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '\\.mock\\.(ts|tsx|js|jsx)$',
    '/test-utils\\.tsx$',
    '\\.stories\\.(ts|tsx)$',
  ],
  testTimeout: 10000,
  maxWorkers: '75%', // Increased from 50% for faster test execution
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
  verbose: false,
  // bail: 0 for local development (run all tests)
  // Set bail: 1 in CI environment to stop after first failure for faster feedback
  bail: process.env.CI === 'true' ? 1 : 0,
  errorOnDeprecated: true,
  detectOpenHandles: true,
  forceExit: false,
};
