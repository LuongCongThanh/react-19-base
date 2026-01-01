/**
 * Navigation utility for use outside React components
 * This allows navigation from axios interceptors and other non-React contexts
 */

import { logger } from './logger';

/**
 * Router instance interface
 */
interface RouterInstance {
  navigate: (options: { to: string }) => void;
}

// Module-level state
let routerInstance: RouterInstance | null = null;

/**
 * Set router instance for navigation
 * Should be called once during app initialization
 *
 * @param router - Router instance from TanStack Router or similar
 *
 * @example
 * ```tsx
 * import { setRouter } from '@shared/lib/navigation';
 * import { router } from './router';
 *
 * setRouter(router);
 * ```
 */
export const setRouter = (router: RouterInstance): void => {
  routerInstance = router;
};

/**
 * Navigate to a route
 * Falls back to globalThis.location if router is not set
 *
 * @param path - Path to navigate to
 *
 * @example
 * ```tsx
 * import { navigateTo } from '@shared/lib/navigation';
 *
 * navigateTo('/auth/login');
 * ```
 */
export const navigateTo = (path: string): void => {
  if (routerInstance) {
    try {
      routerInstance.navigate({ to: path });
    } catch (error) {
      // Log error and fallback to browser navigation
      logger.warn('Router navigation failed, using fallback', {
        path,
        error: error instanceof Error ? error.message : String(error),
      });
      globalThis.location.href = path;
    }
  } else {
    // Fallback for cases where router is not yet initialized
    globalThis.location.href = path;
  }
};

/**
 * Get current router instance
 * @returns Current router instance or null
 */
export const getRouter = (): RouterInstance | null => {
  return routerInstance;
};
