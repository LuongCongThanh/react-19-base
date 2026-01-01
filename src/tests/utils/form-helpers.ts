/**
 * Form testing helpers
 * Utilities for testing form interactions
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Fill form inputs with provided values
 * @param fields - Object with field labels/names as keys and values as values
 * @returns Promise that resolves when all fields are filled
 *
 * @example
 * ```tsx
 * await fillForm({
 *   'Email': 'test@example.com',
 *   'Password': 'password123',
 * });
 * ```
 */
export const fillForm = async (fields: Record<string, string>): Promise<void> => {
  const user = userEvent.setup();

  for (const [label, value] of Object.entries(fields)) {
    const input = screen.getByLabelText(label, { exact: false });
    await user.clear(input);
    await user.type(input, value);
  }
};

/**
 * Submit form by clicking submit button
 * @param buttonText - Text of the submit button (default: 'submit')
 * @returns Promise that resolves when button is clicked
 *
 * @example
 * ```tsx
 * await submitForm('Login');
 * ```
 */
export const submitForm = async (buttonText: string | RegExp = /submit/i): Promise<void> => {
  const user = userEvent.setup();
  const submitButton = screen.getByRole('button', { name: buttonText });
  await user.click(submitButton);
};

/**
 * Fill and submit form in one call
 * @param fields - Form fields to fill
 * @param buttonText - Submit button text
 * @returns Promise that resolves when form is submitted
 *
 * @example
 * ```tsx
 * await fillAndSubmitForm({
 *   'Email': 'test@example.com',
 *   'Password': 'password123',
 * }, 'Login');
 * ```
 */
export const fillAndSubmitForm = async (
  fields: Record<string, string>,
  buttonText: string | RegExp = /submit/i
): Promise<void> => {
  await fillForm(fields);
  await submitForm(buttonText);
};

/**
 * Wait for form validation errors to appear
 * @param errorMessages - Array of error messages to wait for
 * @returns Promise that resolves when all errors are visible
 *
 * @example
 * ```tsx
 * await waitForFormValidation(['Email is required', 'Password is required']);
 * ```
 */
export const waitForFormValidation = async (errorMessages: string[]): Promise<void> => {
  await waitFor(() => {
    for (const message of errorMessages) {
      expect(screen.getByText(new RegExp(message, 'i'))).toBeInTheDocument();
    }
  });
};

/**
 * Clear all form inputs
 * @returns Promise that resolves when all inputs are cleared
 */
export const clearForm = async (): Promise<void> => {
  const user = userEvent.setup();
  const inputs = screen
    .getAllByRole('textbox', { hidden: true })
    .concat(screen.getAllByRole('spinbutton', { hidden: true }));

  for (const input of inputs) {
    await user.clear(input);
  }
};
