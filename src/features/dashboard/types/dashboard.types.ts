import type { EntityId } from '@shared/types/common.types';

/**
 * Dashboard Types
 */

export interface DashboardData {
  id: EntityId;
  title: string;
  value: number;
  description?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
}
