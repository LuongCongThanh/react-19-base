import { QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';

import { LoadingFallback } from '@shared/components/LoadingFallback';
import { ErrorBoundary } from '@shared/hocs/withErrorBoundary';
import { handleAppError } from '@shared/lib/error-handler';

import { queryClient } from './app.query-client';

const AppProvidersContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
    </QueryClientProvider>
  );
};

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorBoundary onError={handleAppError}>
      <AppProvidersContent>{children}</AppProvidersContent>
    </ErrorBoundary>
  );
};
