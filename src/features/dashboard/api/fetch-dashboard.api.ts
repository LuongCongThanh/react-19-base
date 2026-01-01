// API giả lập lấy dữ liệu dashboard

import { createEntityId } from '@shared/types/common.types';

import type { DashboardData } from '@features/dashboard/types/dashboard.types';

export async function fetchDashboardData(): Promise<DashboardData[]> {
  // Giả lập API call
  const data = [
    { id: '1', title: 'Users', value: 1200 },
    { id: '2', title: 'Revenue', value: 35000 },
    { id: '3', title: 'Orders', value: 230 },
  ];

  // Convert plain string IDs to branded types
  return data.map((item) => ({
    ...item,
    id: createEntityId(item.id),
  }));
}
