import { beforeEach, describe, it, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@tests/test-utils';

import { ErrorState } from '../ErrorState';

describe('ErrorState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render error state with default message', () => {
    renderWithProviders(<ErrorState />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    // Check for default error message (translated or direct)
    // The component uses t('error.title', 'An error occurred') and t('error.generic', 'Something went wrong...')
    const errorTexts = screen.queryAllByText(/error/i);
    expect(errorTexts.length).toBeGreaterThan(0);
  });

  it('should render custom message', () => {
    renderWithProviders(<ErrorState message="Custom error message" />);

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('should render custom title', () => {
    renderWithProviders(<ErrorState title="Custom Title" />);

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('should render retry button when onRetry is provided', async () => {
    const handleRetry = jest.fn();
    const user = userEvent.setup();

    renderWithProviders(<ErrorState onRetry={handleRetry} />);

    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();

    await user.click(retryButton);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('should not render retry button when onRetry is not provided', () => {
    renderWithProviders(<ErrorState />);

    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
  });

  it('should display error message from Error object', () => {
    const error = new Error('Error from exception');
    renderWithProviders(<ErrorState error={error} />);

    expect(screen.getByText('Error from exception')).toBeInTheDocument();
  });
});
