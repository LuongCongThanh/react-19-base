import { beforeEach, describe, it, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '@tests/test-utils';

import { Skeleton } from '../Skeleton';

describe('Skeleton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render skeleton element', () => {
    renderWithProviders(<Skeleton />);

    const skeleton = screen.getByRole('generic', { busy: true });
    expect(skeleton).toBeInTheDocument();
  });

  it('should have correct ARIA attributes', () => {
    renderWithProviders(<Skeleton />);

    const skeleton = screen.getByRole('generic', { busy: true });
    expect(skeleton).toHaveAttribute('aria-live', 'polite');
    expect(skeleton).toHaveAttribute('aria-busy', 'true');
  });

  it('should accept className prop', () => {
    renderWithProviders(<Skeleton className="h-4 w-[250px]" />);

    const skeleton = screen.getByRole('generic', { busy: true });
    expect(skeleton).toHaveClass('h-4', 'w-[250px]');
  });

  it('should render with custom dimensions', () => {
    renderWithProviders(<Skeleton className="h-12 w-12 rounded-full" />);

    const skeleton = screen.getByRole('generic', { busy: true });
    expect(skeleton).toHaveClass('h-12', 'w-12', 'rounded-full');
  });
});
