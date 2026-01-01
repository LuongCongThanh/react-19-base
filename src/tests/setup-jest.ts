// === Testing library & polyfills ===
import '@testing-library/jest-dom';
import 'cross-fetch/polyfill';

// === Node polyfills (MUST be before any imports that use them) ===
import { ReadableStream, TransformStream, WritableStream } from 'node:stream/web';
import { TextDecoder, TextEncoder } from 'node:util';

import * as React from 'react';

// === Polyfills for WHATWG/Browser APIs (apply BEFORE other imports) ===
if (!globalThis.TextEncoder) {
  globalThis.TextEncoder = TextEncoder;
}
if (!globalThis.TextDecoder) {
  globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;
}
if (!globalThis.TransformStream) {
  globalThis.TransformStream = TransformStream as typeof globalThis.TransformStream;
}
if (!globalThis.ReadableStream) {
  globalThis.ReadableStream = ReadableStream as typeof globalThis.ReadableStream;
}
if (!globalThis.WritableStream) {
  globalThis.WritableStream = WritableStream as typeof globalThis.WritableStream;
}

// === BroadcastChannel mock (Jest / JSDOM) ===
// Don't use worker_threads version - use lightweight mock instead
class MockBroadcastChannel {
  name: string;
  onmessage: ((ev: MessageEvent) => void) | null = null;

  constructor(name: string) {
    this.name = name;
  }

  postMessage(_message: unknown) {
    // noop
  }

  close() {
    // noop
  }

  addEventListener() {
    // noop
  }

  removeEventListener() {
    // noop
  }
}

if (!globalThis.BroadcastChannel) {
  globalThis.BroadcastChannel = MockBroadcastChannel as unknown as typeof BroadcastChannel;
}

// === Internal test utils (after polyfills) ===
import { registerCustomMatchers } from './custom-matchers';
import { server } from './mocks/server';
import { polyfillStructuredClone } from './utils/structured-clone-polyfill';
import { mockLocalStorage, mockSessionStorage } from './utils/test-helpers';

// === CRITICAL: Mock modules with import.meta BEFORE any imports ===
// Mock axios.client to prevent it from importing env.validation
// which contains import.meta that Jest cannot parse
jest.mock('@shared/lib/axios.client', () => ({
  default: {
    create: jest.fn(() => ({})),
    baseURL: 'http://localhost:3000/api',
  },
  axiosClient: {
    create: jest.fn(() => ({})),
    baseURL: 'http://localhost:3000/api',
  },
}));

// Mock env.validation for direct imports
jest.mock('@shared/lib/env.validation', () => ({
  env: {
    VITE_API_BASE_URL: 'http://localhost:3000/api',
    VITE_APP_NAME: 'React 19 Base',
    VITE_APP_VERSION: '1.0.0',
    VITE_USE_MOCK_API: true,
    VITE_ENABLE_ANALYTICS: false,
    VITE_ENABLE_ERROR_TRACKING: false,
    VITE_SENTRY_DSN: undefined,
  },
  validateEnv: jest.fn(() => ({
    VITE_API_BASE_URL: 'http://localhost:3000/api',
    VITE_APP_NAME: 'React 19 Base',
    VITE_APP_VERSION: '1.0.0',
    VITE_USE_MOCK_API: true,
    VITE_ENABLE_ANALYTICS: false,
    VITE_ENABLE_ERROR_TRACKING: false,
    VITE_SENTRY_DSN: undefined,
  })),
}));

// Mock logger to avoid import.meta.env issues
jest.mock('@shared/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// === Mock import.meta for Jest (must be before any imports that use it) ===
// Jest doesn't support import.meta in Node.js environment
// We need to provide a polyfill that works with ts-jest ESM mode
const mockImportMeta = {
  env: {
    VITE_API_BASE_URL: 'http://localhost:3000/api',
    VITE_APP_NAME: 'React 19 Base',
    VITE_APP_VERSION: '1.0.0',
    VITE_USE_MOCK_API: 'true',
    VITE_ENABLE_ANALYTICS: 'false',
    VITE_ENABLE_ERROR_TRACKING: 'false',
    VITE_SENTRY_DSN: undefined,
    DEV: true,
    PROD: false,
    MODE: 'test',
    SSR: false,
  },
};

// Store in globalThis for access
(globalThis as unknown as Record<string, unknown>).importMeta = mockImportMeta;

// For files that use import.meta.env directly, we need to ensure it's available
// This is handled by ts-jest transform, but we provide a fallback
if ((globalThis as unknown as Record<string, unknown>).import === undefined) {
  Object.defineProperty(globalThis, 'import', {
    value: {
      meta: mockImportMeta,
    },
    writable: false,
    configurable: false,
  });
}

registerCustomMatchers();

// Polyfill structuredClone for React 19 (if not available)
polyfillStructuredClone();

// === Mock i18next ===
jest.mock('react-i18next', () => {
  const mockT = (key: string, options?: Record<string, unknown>) => {
    // Handle namespaced keys (e.g., 'common:button.submit')
    if (key.includes(':')) {
      const parts = key.split(':');
      const namespaceKey = parts[1] || key;
      return namespaceKey.replaceAll(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
    }

    // Handle interpolation
    if (options) {
      let result = key.replaceAll(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
      Object.entries(options).forEach(([k, v]) => {
        result = result.replaceAll(`{{${k}}}`, String(v));
      });
      return result;
    }

    return key.replaceAll(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
  };

  return {
    useTranslation: (namespace?: string | string[]) => ({
      t: mockT,
      i18n: {
        changeLanguage: jest.fn(),
        language: 'en',
        getResourceBundle: jest.fn(() => ({})),
        hasResourceBundle: jest.fn(() => true),
        loadNamespaces: jest.fn(),
        isInitialized: true,
        options: {
          defaultNS: 'common',
          ns: namespace || 'common',
        },
      },
      ready: true,
    }),
    Trans: ({ children, i18nKey }: { children: React.ReactNode; i18nKey?: string }) => {
      if (i18nKey) {
        return React.createElement(React.Fragment, null, mockT(i18nKey));
      }
      return React.createElement(React.Fragment, null, children);
    },
    useTranslationContext: () => ({ language: 'en' }),
    I18nextProvider: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    initReactI18next: {
      type: 'languageDetector',
      init: jest.fn(),
    },
  };
});

// Suppress console errors/warnings in tests unless explicitly needed
const originalError = console.error;
const originalWarn = console.warn;

// Patterns to suppress in console output
const suppressedErrorPatterns = [
  /Not implemented: HTMLFormElement\.prototype\.submit/,
  /Could not parse CSS stylesheet/,
  /Error: Not implemented: HTMLCanvasElement\.prototype\.getContext/,
  /Warning: ReactDOM\.render/,
  /An update to .* inside a test was not wrapped in act/, // TanStack Router async updates
  /A suspended resource finished loading inside a test/, // React Suspense async loading
  /Jest encountered an unexpected token/, // Jest parsing errors (caught by error boundaries)
  /Cannot use 'import\.meta' outside a module/, // Import.meta errors (caught by error boundaries)
  /Query data cannot be undefined/, // React Query warning when query function returns undefined (expected in error cases)
];

const suppressedWarnPatterns = [
  /ReactDOM\.render is no longer supported/,
  /componentWillReceiveProps has been renamed/,
  /The following error wasn't caught by any route/, // TanStack Router uncaught errors
  /Cannot use 'import\.meta' outside a module/, // Import.meta warnings
];

beforeAll(() => {
  // Setup localStorage and sessionStorage mocks
  mockLocalStorage();
  mockSessionStorage();

  // Suppress specific React/JSDOM warnings that are not actionable
  console.error = (...args: unknown[]) => {
    const firstArg = args[0] as string | undefined;
    const message = firstArg !== undefined && typeof firstArg === 'string' ? firstArg : '';
    if (message && suppressedErrorPatterns.some((pattern) => pattern.test(message))) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: unknown[]) => {
    const firstArg = args[0] as string | undefined;
    const message = firstArg !== undefined && typeof firstArg === 'string' ? firstArg : '';
    if (message && suppressedWarnPatterns.some((pattern) => pattern.test(message))) {
      return;
    }
    originalWarn.call(console, ...args);
  };

  server.listen({ onUnhandledRequest: 'warn' });
});

beforeEach(() => {
  // Reset DOM between tests
  document.body.innerHTML = '';
  document.head.innerHTML = '';

  // Clear storage between tests
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  server.resetHandlers();
  jest.clearAllTimers();
  // Clear any pending timers or async operations
  jest.clearAllMocks();
});

afterAll(() => {
  server.close();
  console.error = originalError;
  console.warn = originalWarn;
});
