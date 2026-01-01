/**
 * Accessibility tests for Button component
 */

import { beforeEach, describe, it, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@tests/test-utils';
import { testAriaLabel, testFocusable } from '@tests/utils/accessibility-helpers';

import { Button } from '../Button';

// Mock Spinner
jest.mock('@shared/components/Spinner', () => ({
  Spinner: () => <div data-testid="spinner">Loading...</div>,
}));

describe('Button Accessibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be keyboard accessible', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <Button onClick={handleClick}>First Button</Button>
        <Button>Second Button</Button>
      </>
    );

    const firstButton = screen.getByRole('button', { name: /first button/i });
    const secondButton = screen.getByRole('button', { name: /second button/i });

    // Test tab navigation
    firstButton.focus();
    expect(firstButton).toHaveFocus();

    await user.tab();
    expect(secondButton).toHaveFocus();
  });

  it('should be focusable', async () => {
    renderWithProviders(<Button>Focusable Button</Button>);

    const button = screen.getByRole('button', { name: /focusable button/i });
    await testFocusable(button);
  });

  it('should have proper ARIA attributes when disabled', () => {
    renderWithProviders(<Button disabled>Disabled Button</Button>);

    const button = screen.getByRole('button', { name: /disabled button/i });
    // Button should be disabled (HTML disabled attribute is sufficient)
    expect(button).toBeDisabled();
    // aria-disabled may or may not be present depending on implementation
  });

  it('should support aria-label', () => {
    renderWithProviders(<Button aria-label="Close dialog">×</Button>);

    const button = screen.getByRole('button', { name: /close dialog/i });
    testAriaLabel(button, 'Close dialog');
  });

  it('should support keyboard activation', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    renderWithProviders(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    button.focus();
    await user.keyboard('{Enter}');

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should support Space key activation', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    renderWithProviders(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    button.focus();
    await user.keyboard(' ');

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
