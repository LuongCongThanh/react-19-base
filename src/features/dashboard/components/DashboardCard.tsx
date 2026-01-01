import { memo } from 'react';

import type { DashboardData } from '@features/dashboard/types/dashboard.types';

interface DashboardCardProps {
  data: DashboardData;
}

export const DashboardCard = memo(({ data }: DashboardCardProps) => {
  return (
    <div className="rounded bg-white shadow p-4 flex flex-col items-center">
      <div className="text-lg font-semibold">{data.title}</div>
      <div className="text-2xl font-bold mt-2">{data.value}</div>
    </div>
  );
});

DashboardCard.displayName = 'DashboardCard';
