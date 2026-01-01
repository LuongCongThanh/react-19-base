import { beforeEach, describe, it, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '@tests/test-utils';

import { Footer } from '../Footer';

describe('Footer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render footer component', () => {
    renderWithProviders(<Footer />);

    // Footer should be present (exact content depends on implementation)
    expect(screen.getByRole('contentinfo') || screen.getByRole('generic')).toBeInTheDocument();
  });
});
