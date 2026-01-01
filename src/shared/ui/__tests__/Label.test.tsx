import { beforeEach, describe, it, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '@tests/test-utils';

import { Label } from '../Label';

describe('Label', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render label with text', () => {
    renderWithProviders(<Label>Email Address</Label>);

    expect(screen.getByText('Email Address')).toBeInTheDocument();
  });

  it('should associate label with input using htmlFor', () => {
    renderWithProviders(
      <>
        <Label htmlFor="email">Email</Label>
        <input id="email" type="email" />
      </>
    );

    const label = screen.getByText('Email');
    const input = screen.getByLabelText('Email');

    expect(label).toHaveAttribute('for', 'email');
    expect(input).toBeInTheDocument();
  });

  it('should accept className prop', () => {
    renderWithProviders(<Label className="custom-class">Custom Label</Label>);

    const label = screen.getByText('Custom Label');
    expect(label).toHaveClass('custom-class');
  });
});
