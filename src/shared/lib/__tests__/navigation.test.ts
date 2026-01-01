import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { navigateTo, setRouter, getRouter } from '../navigation';

// Mock logger
jest.mock('../logger', () => ({
  logger: {
    warn: jest.fn(),
  },
}));

// Mock globalThis.location
const mockLocation = {
  href: '',
};
Object.defineProperty(globalThis, 'location', {
  value: mockLocation,
  writable: true,
});

describe('navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation.href = '';
    // Reset router instance
    setRouter(null as any);
  });

  it('should set router instance', () => {
    const mockRouter = {
      navigate: jest.fn(),
    };

    setRouter(mockRouter);
    expect(getRouter()).toEqual(mockRouter);
  });

  it('should navigate to path when router is set', () => {
    const mockRouter = {
      navigate: jest.fn(),
    };

    setRouter(mockRouter);
    navigateTo('/dashboard');

    expect(mockRouter.navigate).toHaveBeenCalledWith({ to: '/dashboard' });
  });

  it('should fallback to location.href when router is not set', () => {
    navigateTo('/auth/login');
    expect(mockLocation.href).toBe('/auth/login');
  });

  it('should fallback to location.href when router navigation fails', () => {
    const mockRouter = {
      navigate: jest.fn(() => {
        throw new Error('Navigation failed');
      }),
    };

    setRouter(mockRouter);
    navigateTo('/dashboard');

    expect(mockLocation.href).toBe('/dashboard');
  });
});
