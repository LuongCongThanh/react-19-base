// setupTests.ts
// Cấu hình cho môi trường test với React Testing Library
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

import { afterEach } from '@jest/globals';
import { cleanup } from '@testing-library/react';
// Polyfill TextEncoder/TextDecoder cho môi trường test Node.js

// Tự động cleanup sau mỗi test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia cho môi trường test
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: globalThis.jest?.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: globalThis.jest?.fn(),
    removeListener: globalThis.jest?.fn(),
    addEventListener: globalThis.jest?.fn(),
    removeEventListener: globalThis.jest?.fn(),
    dispatchEvent: globalThis.jest?.fn(),
  })),
});

// Thiết lập timezone cố định cho test
globalThis.process.env.TZ = 'UTC';

// Tắt warning không cần thiết từ console
const suppressedWarnings = [/Warning:.*not wrapped in act/, /DeprecationWarning/];
const originalWarn = console.warn;
console.warn = (...args) => {
  if (suppressedWarnings.some((pattern) => pattern.test(args[0]))) {
    return;
  }
  originalWarn(...args);
};

// Bạn có thể thêm các thiết lập global khác tại đây nếu cần

if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder as typeof globalThis.TextEncoder;
}
if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;
}
