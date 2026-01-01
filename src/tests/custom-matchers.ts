/**
 * Custom Jest matchers for better test assertions
 */

// MatcherResult type from expect
type MatcherResult = {
  pass: boolean;
  message: () => string;
};

/**
 * Check if a number is within a specified range
 * @example
 * expect(15).toBeWithinRange(10, 20); // passes
 * expect(25).toBeWithinRange(10, 20); // fails
 */
export const toBeWithinRange = (received: number, floor: number, ceiling: number): MatcherResult => {
  const pass = received >= floor && received <= ceiling;
  return {
    pass,
    message: () => {
      const not = pass ? 'not ' : '';
      return (
        `Expected ${received} ${not}to be within range [${floor}, ${ceiling}]\n` +
        `Received: ${received}\n` +
        `Expected: ${floor} <= value <= ${ceiling}`
      );
    },
  };
};

/**
 * Check if a mock function was called with matching arguments
 * Supports partial object matching and nested objects
 * @example
 * expect(mockFn).toHaveBeenCalledWithMatch({ name: 'John' });
 * expect(mockFn).toHaveBeenCalledWithMatch('test');
 */
export const toHaveBeenCalledWithMatch = (received: jest.Mock, expected: unknown): MatcherResult => {
  const calls = received.mock.calls;

  const isMatching = (arg: unknown, expectedValue: unknown): boolean => {
    // Handle primitive values
    if (expectedValue === null || expectedValue === undefined) {
      return arg === expectedValue;
    }

    // Handle object matching (partial match with nested support)
    if (typeof expectedValue === 'object' && !Array.isArray(expectedValue)) {
      if (typeof arg !== 'object' || arg === null || Array.isArray(arg)) {
        return false;
      }

      // Check if all keys in expected exist and match in arg (recursive)
      return Object.keys(expectedValue).every((key) => {
        const expectedProp = (expectedValue as Record<string, unknown>)[key];
        const argProp = (arg as Record<string, unknown>)[key];
        return isMatching(argProp, expectedProp);
      });
    }

    // Handle array matching (exact match)
    if (Array.isArray(expectedValue)) {
      if (!Array.isArray(arg)) {
        return false;
      }
      if (expectedValue.length !== arg.length) {
        return false;
      }
      return expectedValue.every((item, index) => isMatching(arg[index], item));
    }

    // Handle primitive comparison
    return arg === expectedValue;
  };

  const pass = calls.some((call) => {
    return call.some((arg: unknown) => isMatching(arg, expected));
  });

  return {
    pass,
    message: () => {
      const not = pass ? 'not ' : '';
      return `Expected mock function ${not}to have been called with matching argument\nExpected: ${JSON.stringify(expected, null, 2)}`;
    },
  };
};

/**
 * Check if a mock function was called a specific number of times with matching arguments
 * @example
 * expect(mockFn).toHaveBeenCalledTimesWith(2, { name: 'John' });
 */
export const toHaveBeenCalledTimesWith = (received: jest.Mock, times: number, expected: unknown): MatcherResult => {
  const calls = received.mock.calls;
  let matchCount = 0;

  const isMatching = (arg: unknown, expectedValue: unknown): boolean => {
    if (expectedValue === null || expectedValue === undefined) {
      return arg === expectedValue;
    }

    if (typeof expectedValue === 'object' && !Array.isArray(expectedValue)) {
      if (typeof arg !== 'object' || arg === null || Array.isArray(arg)) {
        return false;
      }
      return Object.keys(expectedValue).every((key) => {
        const expectedProp = (expectedValue as Record<string, unknown>)[key];
        const argProp = (arg as Record<string, unknown>)[key];
        return isMatching(argProp, expectedProp);
      });
    }

    if (Array.isArray(expectedValue)) {
      if (!Array.isArray(arg)) {
        return false;
      }
      if (expectedValue.length !== arg.length) {
        return false;
      }
      return expectedValue.every((item, index) => isMatching(arg[index], item));
    }

    return arg === expectedValue;
  };

  calls.forEach((call) => {
    if (call.some((arg: unknown) => isMatching(arg, expected))) {
      matchCount++;
    }
  });

  const pass = matchCount === times;

  return {
    pass,
    message: () => {
      const not = pass ? 'not ' : '';
      return `Expected mock function ${not}to have been called ${times} time(s) with matching argument\nExpected: ${times} call(s)\nReceived: ${matchCount} call(s)\nArgument: ${JSON.stringify(expected, null, 2)}`;
    },
  };
};

/**
 * Check if text content matches a pattern (string or regex)
 * @example
 * expect(element).toHaveTextContentMatch(/hello/i);
 * expect(element).toHaveTextContentMatch('Hello');
 */
export const toHaveTextContentMatch = (received: HTMLElement, pattern: string | RegExp): MatcherResult => {
  const textContent = received.textContent || '';
  const pass = typeof pattern === 'string' ? textContent.includes(pattern) : pattern.test(textContent);

  return {
    pass,
    message: () => {
      const not = pass ? 'not ' : '';
      const patternStr = typeof pattern === 'string' ? pattern : pattern.toString();
      return `Expected element ${not}to have text content matching ${patternStr}\nReceived: ${textContent}`;
    },
  };
};

/**
 * Register all custom matchers with Jest
 */
export const registerCustomMatchers = () => {
  expect.extend({
    toBeWithinRange,
    toHaveBeenCalledWithMatch,
    toHaveBeenCalledTimesWith,
    toHaveTextContentMatch,
  });
};
