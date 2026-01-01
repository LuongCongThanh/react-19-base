import { beforeEach, describe, it, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '@tests/test-utils';

import { CardSkeleton } from '../CardSkeleton';

describe('CardSkeleton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render default count of 3 skeletons', () => {
    renderWithProviders(<CardSkeleton />);

    const skeletons = screen.getAllByLabelText('Loading cards');
    expect(skeletons).toHaveLength(1);
    const busyElements = screen.getAllByRole('generic', { busy: true });
    expect(busyElements.length).toBeGreaterThanOrEqual(3);
  });

  it('should render custom count of skeletons', () => {
    renderWithProviders(<CardSkeleton count={5} />);

    const busyElements = screen.getAllByRole('generic', { busy: true });
    expect(busyElements.length).toBeGreaterThanOrEqual(5);
  });

  it('should have correct ARIA attributes', () => {
    renderWithProviders(<CardSkeleton />);

    const container = screen.getByLabelText('Loading cards');
    expect(container).toHaveAttribute('aria-live', 'polite');
  });
});
