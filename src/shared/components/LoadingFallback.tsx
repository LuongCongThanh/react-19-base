import { useTranslation } from 'react-i18next';

interface LoadingFallbackProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingFallback = ({ message, fullScreen = true }: LoadingFallbackProps = {}) => {
  const { t } = useTranslation();

  return (
    <div
      className={fullScreen ? 'flex items-center justify-center min-h-screen' : 'flex items-center justify-center p-8'}
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading application"
    >
      <div className="text-center">
        <div
          className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"
          aria-hidden="true"
        ></div>
        <p className="mt-4 text-gray-600">{message || t('common.loading', 'Loading...')}</p>
      </div>
    </div>
  );
};
