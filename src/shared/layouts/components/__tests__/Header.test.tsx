import { beforeEach, describe, it, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '@tests/test-utils';

import { Header } from '../Header';

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render header component', () => {
    renderWithProviders(<Header />);

    // Header should be present (exact content depends on implementation)
    expect(screen.getByRole('banner') || screen.getByRole('generic')).toBeInTheDocument();
  });
});
