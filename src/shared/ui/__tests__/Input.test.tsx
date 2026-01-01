import { beforeEach, describe, it, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@tests/test-utils';

import { Input } from '../Input';

describe('Input', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render input element', () => {
    renderWithProviders(<Input />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should accept and display value', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Input defaultValue="test value" />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('test value');

    await user.clear(input);
    await user.type(input, 'new value');

    expect(input.value).toBe('new value');
  });

  it('should handle different input types', () => {
    const { rerender } = renderWithProviders(<Input type="email" />);
    const emailInput = screen.getByRole('textbox');
    expect(emailInput).toHaveAttribute('type', 'email');

    rerender(<Input type="password" />);
    // Password inputs are not accessible as textbox, use querySelector
    const passwordInput = document.querySelector('input[type="password"]');
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('type', 'password');

    rerender(<Input type="number" />);
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    renderWithProviders(<Input disabled />);

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('should accept placeholder', () => {
    renderWithProviders(<Input placeholder="Enter your name" />);

    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
  });

  it('should call onChange when value changes', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();

    renderWithProviders(<Input onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'test');

    expect(handleChange).toHaveBeenCalled();
  });
});
