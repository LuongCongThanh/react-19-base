import { useTranslation } from 'react-i18next';

import { CardSkeleton } from '@shared/components/CardSkeleton';
import { ErrorState } from '@shared/components/ErrorState';

import { DashboardCard } from '@features/dashboard/components/DashboardCard';
import { useDashboardData } from '@features/dashboard/hooks/useDashboardData';

export const DashboardPage = () => {
  const { t } = useTranslation('dashboard');
  const { data, isLoading, error, refetch } = useDashboardData();

  if (isLoading) {
    return (
      <section className="p-6" aria-label="Dashboard">
        <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
        <p className="text-gray-500 mb-4">{t('loading')}</p>
        <CardSkeleton count={3} />
      </section>
    );
  }

  if (error) {
    return <ErrorState message={error instanceof Error ? error.message : t('error')} onRetry={refetch} />;
  }

  return (
    <main className="p-6" aria-label="Dashboard">
      <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data?.map((item) => (
          <DashboardCard key={item.id} data={item} />
        ))}
      </div>
    </main>
  );
};
