/**
 * Polyfill for structuredClone
 * Used in test environment where structuredClone may not be available
 *
 * This is a simplified implementation for testing purposes.
 * For production, use the native structuredClone if available.
 */

/**
 * Polyfill structuredClone for React 19 (if not available)
 */
export const polyfillStructuredClone = () => {
  if (!globalThis.structuredClone) {
    globalThis.structuredClone = <T>(obj: T, options?: StructuredSerializeOptions): T => {
      // Handle primitives and null
      if (obj === null || typeof obj !== 'object') {
        return obj;
      }

      // Handle Date
      if (obj instanceof Date) {
        return new Date(obj.valueOf()) as T;
      }

      // Handle RegExp
      if (obj instanceof RegExp) {
        return new RegExp(obj.source, obj.flags) as T;
      }

      // Handle Map
      if (obj instanceof Map) {
        const clonedMap = new Map();
        obj.forEach((value, key) => {
          clonedMap.set(globalThis.structuredClone(key, options), globalThis.structuredClone(value, options));
        });
        return clonedMap as T;
      }

      // Handle Set
      if (obj instanceof Set) {
        const clonedSet = new Set();
        obj.forEach((value) => {
          clonedSet.add(globalThis.structuredClone(value, options));
        });
        return clonedSet as T;
      }

      // Handle Array
      if (Array.isArray(obj)) {
        return obj.map((item) => globalThis.structuredClone(item, options)) as T;
      }

      // Handle Object
      const clonedObj = {} as T;
      for (const key in obj) {
        if (Object.hasOwn(obj, key)) {
          (clonedObj as Record<string, unknown>)[key] = globalThis.structuredClone(
            (obj as Record<string, unknown>)[key],
            options
          );
        }
      }
      return clonedObj;
    };
  }
};
