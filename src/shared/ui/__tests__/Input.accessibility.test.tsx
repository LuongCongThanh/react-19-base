/**
 * Accessibility tests for Input component
 */

import { beforeEach, describe, it, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@tests/test-utils';
import { testAriaLabel, testFocusable } from '@tests/utils/accessibility-helpers';

import { Input } from '../Input';
import { Label } from '../Label';

describe('Input Accessibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be associated with label', () => {
    renderWithProviders(
      <>
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" type="email" />
      </>
    );

    // Check that input is accessible via label
    const input = screen.getByLabelText('Email Address');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('id', 'email');
  });

  it('should be focusable', async () => {
    renderWithProviders(<Input />);

    const input = screen.getByRole('textbox');
    await testFocusable(input);
  });

  it('should support aria-label', () => {
    renderWithProviders(<Input aria-label="Search query" />);

    const input = screen.getByRole('textbox');
    testAriaLabel(input, 'Search query');
  });

  it('should support aria-describedby for error messages', () => {
    renderWithProviders(
      <>
        <Input aria-describedby="email-error" aria-invalid="true" />
        <div id="email-error">Email is required</div>
      </>
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby', 'email-error');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('should be keyboard accessible', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Input defaultValue="test" />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    input.focus();
    await user.keyboard('{End}');
    await user.type(input, ' value');

    expect(input.value).toBe('test value');
  });
});
