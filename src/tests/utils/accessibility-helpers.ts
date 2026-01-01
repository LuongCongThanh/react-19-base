/**
 * Accessibility testing helpers
 * Utilities for testing ARIA attributes and keyboard navigation
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Check if element has required ARIA attributes
 * @param element - Element to check
 * @param requiredAttributes - Object with attribute names and expected values
 * @returns Object with check results
 *
 * @example
 * ```tsx
 * const button = screen.getByRole('button');
 * checkAriaAttributes(button, {
 *   'aria-label': 'Submit form',
 *   'aria-disabled': 'false',
 * });
 * ```
 */
export const checkAriaAttributes = (
  element: HTMLElement,
  requiredAttributes: Record<string, string | null>
): { passed: boolean; missing: string[]; incorrect: Array<{ attr: string; expected: string; actual: string }> } => {
  const missing: string[] = [];
  const incorrect: Array<{ attr: string; expected: string; actual: string }> = [];

  for (const [attr, expectedValue] of Object.entries(requiredAttributes)) {
    const actualValue = element.getAttribute(attr);

    if (actualValue === null && expectedValue !== null) {
      missing.push(attr);
    } else if (actualValue !== expectedValue) {
      incorrect.push({
        attr,
        expected: expectedValue || 'null',
        actual: actualValue || 'null',
      });
    }
  }

  return {
    passed: missing.length === 0 && incorrect.length === 0,
    missing,
    incorrect,
  };
};

/**
 * Test keyboard navigation through interactive elements
 * @param elements - Array of element queries (functions that return elements)
 * @returns Promise that resolves when navigation is complete
 *
 * @example
 * ```tsx
 * await testKeyboardNavigation([
 *   () => screen.getByRole('button', { name: 'First' }),
 *   () => screen.getByRole('button', { name: 'Second' }),
 * ]);
 * ```
 */
export const testKeyboardNavigation = async (elements: Array<() => HTMLElement>): Promise<void> => {
  const user = userEvent.setup();

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i]!();
    element.focus();

    if (i < elements.length - 1) {
      await user.keyboard('{Tab}');
      const nextElement = elements[i + 1]!();
      expect(nextElement).toHaveFocus();
    }
  }
};

/**
 * Test that element is focusable and can receive focus
 * @param element - Element to test
 * @returns Promise that resolves when focus test is complete
 */
export const testFocusable = async (element: HTMLElement): Promise<void> => {
  element.focus();
  expect(element).toHaveFocus();
};

/**
 * Test that element is not focusable (e.g., disabled button)
 * @param element - Element to test
 */
export const testNotFocusable = (element: HTMLElement): void => {
  const tabIndex = element.getAttribute('tabindex');
  expect(tabIndex).not.toBe('0');
  expect(element).toHaveAttribute('tabindex', '-1');
};

/**
 * Test keyboard shortcuts
 * @param element - Element to trigger shortcut on
 * @param key - Keyboard key combination (e.g., '{Control>}a{/Control}')
 * @returns Promise that resolves when key is pressed
 */
export const testKeyboardShortcut = async (element: HTMLElement, key: string): Promise<void> => {
  const user = userEvent.setup();
  element.focus();
  await user.keyboard(key);
};

/**
 * Test that element has proper role
 * @param element - Element to check
 * @param expectedRole - Expected ARIA role
 */
export const testAriaRole = (element: HTMLElement, expectedRole: string): void => {
  expect(element).toHaveAttribute('role', expectedRole);
};

/**
 * Test that element has proper label
 * @param element - Element to check
 * @param expectedLabel - Expected label text
 */
export const testAriaLabel = (element: HTMLElement, expectedLabel: string): void => {
  expect(element).toHaveAttribute('aria-label', expectedLabel);
};

/**
 * Test that form inputs are properly associated with labels
 * @param inputLabel - Label text
 * @param _inputType - Input type (default: 'textbox') - reserved for future use
 */
export const testLabelAssociation = (
  inputLabel: string,
  _inputType: 'textbox' | 'combobox' | 'spinbutton' = 'textbox'
): void => {
  const input = screen.getByLabelText(new RegExp(inputLabel, 'i'));
  expect(input).toBeInTheDocument();
  expect(input).toHaveAttribute('aria-labelledby');
};
