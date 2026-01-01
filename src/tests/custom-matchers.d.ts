export {};

declare global {
  namespace jest {
    interface Matchers<R> {
      /**
       * Check if a number is within a specified range [floor, ceiling]
       * @param floor - The minimum value (inclusive)
       * @param ceiling - The maximum value (inclusive)
       * @example
       * expect(15).toBeWithinRange(10, 20); // passes
       * expect(25).toBeWithinRange(10, 20); // fails
       */
      toBeWithinRange(floor: number, ceiling: number): R;

      /**
       * Check if a mock function was called with matching arguments
       * Supports partial object matching and primitive values
       * @param expected - The expected argument (object for partial match, or exact value)
       * @example
       * expect(mockFn).toHaveBeenCalledWithMatch({ name: 'John' });
       * expect(mockFn).toHaveBeenCalledWithMatch('test');
       */
      toHaveBeenCalledWithMatch(expected: unknown): R;

      /**
       * Check if a mock function was called a specific number of times with matching arguments
       * @param times - The expected number of calls
       * @param expected - The expected argument
       * @example
       * expect(mockFn).toHaveBeenCalledTimesWith(2, { name: 'John' });
       */
      toHaveBeenCalledTimesWith(times: number, expected: unknown): R;

      /**
       * Check if text content matches a pattern (string or regex)
       * @param pattern - The pattern to match (string or RegExp)
       * @example
       * expect(element).toHaveTextContentMatch(/hello/i);
       * expect(element).toHaveTextContentMatch('Hello');
       */
      toHaveTextContentMatch(pattern: string | RegExp): R;

      // jest-dom matchers
      toBeInTheDocument(): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeEmpty(): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveClass(className: string): R;
      toHaveStyle(css: string | Record<string, any>): R;
      toBeChecked(): R;
      toBePartiallyChecked(): R;
      toHaveFormValues(values: Record<string, any>): R;
      toHaveValue(value?: string | string[] | number): R;
      toBeRequired(): R;
      toBeInvalid(): R;
      toBeValid(): R;
      toHaveDisplayValue(value: string | string[]): R;
      toHaveErrorMessage(message: string): R;
    }
  }
}
