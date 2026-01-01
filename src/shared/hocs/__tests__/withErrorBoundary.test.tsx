import { afterEach, beforeEach, describe, it, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '@tests/test-utils';

import { ErrorBoundary, WithErrorBoundary } from '../withErrorBoundary';

const TestComponent = ({ shouldThrow }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Test Component</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render component when no error occurs', () => {
    renderWithProviders(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });

  it('should render default error UI when error occurs', () => {
    renderWithProviders(
      <ErrorBoundary>
        <TestComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/test error/i)).toBeInTheDocument();
  });

  it('should call onError callback when error occurs', () => {
    const onError = jest.fn();

    renderWithProviders(
      <ErrorBoundary onError={onError}>
        <TestComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
  });

  it('should render custom fallback when provided', () => {
    const CustomFallback = ({ error }: { error: Error; resetError: () => void }) => (
      <div data-testid="custom-fallback">Custom Error: {error.message}</div>
    );

    renderWithProviders(
      <ErrorBoundary fallback={CustomFallback}>
        <TestComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText(/custom error: test error/i)).toBeInTheDocument();
  });
});

describe('WithErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render component when no error occurs', () => {
    renderWithProviders(<WithErrorBoundary component={TestComponent} />);

    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });

  it('should render error state when error occurs', () => {
    renderWithProviders(<WithErrorBoundary component={TestComponent} shouldThrow={true} />);

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
});
