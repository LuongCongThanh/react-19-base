import { AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@shared/lib/cn.utils';
import { Button } from '@shared/ui/Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: unknown;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState = ({ title, message, error, onRetry, className }: ErrorStateProps) => {
  const { t } = useTranslation();

  const errorMessage =
    message ||
    (error instanceof Error ? error.message : t('error.generic', 'Something went wrong. Please try again later.'));

  const errorTitle = title || t('error.title', 'An error occurred');

  return (
    <div
      className={cn('flex flex-col items-center justify-center p-8 text-center min-h-100', className)}
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-xl font-bold text-gray-900 mb-2">{errorTitle}</h3>
      <p className="text-gray-600 mb-6 max-w-md">{errorMessage}</p>
      {onRetry && (
        <Button onClick={onRetry} className="inline-flex items-center">
          <RefreshCw className="mr-2 h-4 w-4" />
          {t('error.retry', 'Retry')}
        </Button>
      )}
    </div>
  );
};
