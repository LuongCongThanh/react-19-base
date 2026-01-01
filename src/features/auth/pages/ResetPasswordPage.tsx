import { Navigate, useSearch } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { ResetPasswordForm } from '@features/auth/components/ResetPasswordForm';

export const ResetPasswordPage = () => {
  const { t } = useTranslation('auth');
  const searchParams = useSearch({ strict: false });
  const token = (searchParams as { token?: string })?.token || '';

  if (!token) {
    return <Navigate to="/auth/forgot-password" />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">{t('resetPassword')}</h2>
          <p className="mt-2 text-center text-sm text-gray-600">{t('resetPasswordDescription')}</p>
        </div>
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
};
