import { beforeEach, describe, it, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '@tests/test-utils';

import { PageSkeleton } from '../PageSkeleton';

describe('PageSkeleton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render page skeleton with title by default', () => {
    renderWithProviders(<PageSkeleton />);

    const container = screen.getByLabelText('Loading page');
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute('aria-busy', 'true');
  });

  it('should render children when provided', () => {
    renderWithProviders(
      <PageSkeleton>
        <div data-testid="child-content">Child content</div>
      </PageSkeleton>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('should not render title when showTitle is false', () => {
    renderWithProviders(<PageSkeleton showTitle={false} />);

    const container = screen.getByLabelText('Loading page');
    expect(container).toBeInTheDocument();
  });
});
