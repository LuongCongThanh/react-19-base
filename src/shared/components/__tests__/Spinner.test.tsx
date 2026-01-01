import { beforeEach, describe, it, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '@tests/test-utils';

import { Spinner } from '../Spinner';

describe('Spinner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render spinner', () => {
    renderWithProviders(<Spinner />);

    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toBeInTheDocument();
  });

  it('should have correct ARIA attributes', () => {
    renderWithProviders(<Spinner />);

    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render different sizes', () => {
    const { rerender } = renderWithProviders(<Spinner size="sm" />);
    expect(screen.getByLabelText('Loading')).toHaveClass('h-4', 'w-4');

    rerender(<Spinner size="md" />);
    expect(screen.getByLabelText('Loading')).toHaveClass('h-8', 'w-8');

    rerender(<Spinner size="lg" />);
    expect(screen.getByLabelText('Loading')).toHaveClass('h-12', 'w-12');
  });

  it('should render different variants', () => {
    const { rerender } = renderWithProviders(<Spinner variant="default" />);
    expect(screen.getByLabelText('Loading')).toHaveClass('border-gray-300');

    rerender(<Spinner variant="primary" />);
    expect(screen.getByLabelText('Loading')).toHaveClass('border-blue-200');

    rerender(<Spinner variant="white" />);
    expect(screen.getByLabelText('Loading')).toHaveClass('border-white/30');
  });
});
