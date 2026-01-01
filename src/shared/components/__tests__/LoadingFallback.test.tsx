import { beforeEach, describe, it, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '@tests/test-utils';

import { LoadingFallback } from '../LoadingFallback';

describe('LoadingFallback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading fallback with default message', () => {
    renderWithProviders(<LoadingFallback />);

    expect(screen.getByLabelText('Loading application')).toBeInTheDocument();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should render custom message', () => {
    renderWithProviders(<LoadingFallback message="Please wait..." />);

    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });

  it('should have correct ARIA attributes', () => {
    renderWithProviders(<LoadingFallback />);

    const container = screen.getByLabelText('Loading application');
    expect(container).toHaveAttribute('aria-live', 'polite');
    expect(container).toHaveAttribute('aria-busy', 'true');
  });

  it('should render full screen by default', () => {
    renderWithProviders(<LoadingFallback />);

    const container = screen.getByLabelText('Loading application');
    expect(container).toHaveClass('min-h-screen');
  });

  it('should render without full screen when fullScreen is false', () => {
    renderWithProviders(<LoadingFallback fullScreen={false} />);

    const container = screen.getByLabelText('Loading application');
    expect(container).not.toHaveClass('min-h-screen');
    expect(container).toHaveClass('p-8');
  });
});
