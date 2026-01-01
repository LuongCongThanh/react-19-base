import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { LoginForm } from '@features/auth/components/LoginForm';

export const LoginPage = () => {
  const { t } = useTranslation('auth');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">{t('loginTitle')}</h2>
          <p className="mt-2 text-center text-sm text-gray-600">{t('loginSubtitle')}</p>
        </div>

        <div className="mt-8 bg-white py-8 px-6 shadow rounded-lg">
          <LoginForm />

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">{t('noAccount')} </span>
            <Link to="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
              {t('registerLink')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
