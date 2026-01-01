import { beforeEach, describe, it, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';

import type { DashboardData } from '@features/dashboard/types/dashboard.types';
import { renderWithProviders } from '@tests/test-utils';

import { DashboardCard } from '../DashboardCard';

describe('DashboardCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render card with title and value', () => {
    const mockData: DashboardData = {
      id: '1' as any,
      title: 'Total Users',
      value: 1234,
      trend: 'up',
      trendValue: 12,
    };

    renderWithProviders(<DashboardCard data={mockData} />);

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument();
  });

  it('should render different data correctly', () => {
    const mockData: DashboardData = {
      id: '2' as any,
      title: 'Revenue',
      value: 50000,
      trend: 'down',
      trendValue: -5,
    };

    renderWithProviders(<DashboardCard data={mockData} />);

    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('50000')).toBeInTheDocument();
  });

  it('should render with numeric value', () => {
    const mockData: DashboardData = {
      id: '3' as any,
      title: 'Orders',
      value: 999,
      trend: 'up',
      trendValue: 3,
    };

    renderWithProviders(<DashboardCard data={mockData} />);

    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('999')).toBeInTheDocument();
  });
});
