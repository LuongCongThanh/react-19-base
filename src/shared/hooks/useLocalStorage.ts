import { useState } from 'react';

import { logger } from '@shared/lib/logger';

/**
 * Hook to manage localStorage with TypeScript support
 *
 * Provides a React state that syncs with localStorage. Similar to useState
 * but persists values across page reloads.
 *
 * @param key - The localStorage key
 * @param initialValue - Default value if key doesn't exist in localStorage
 * @returns Tuple of [value, setValue] similar to useState
 *
 * @example
 * ```tsx
 * const [theme, setTheme] = useLocalStorage('theme', 'light');
 *
 * // Update theme
 * setTheme('dark'); // Also saves to localStorage
 * ```
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // State để lưu giá trị
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      logger.error(`Error reading localStorage key "${key}"`, error as Error, {
        key,
      });
      return initialValue;
    }
  });

  // Function để update cả state và localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Cho phép value là function giống useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      setStoredValue(valueToStore);

      // Lưu vào localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      logger.error(`Error setting localStorage key "${key}"`, error as Error, {
        key,
      });
    }
  };

  return [storedValue, setValue];
}
