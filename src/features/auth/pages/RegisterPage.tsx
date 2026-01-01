import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { RegisterForm } from '@features/auth/components/RegisterForm';

export const RegisterPage = () => {
  const { t } = useTranslation('auth');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">{t('registerTitle')}</h2>
          <p className="mt-2 text-center text-sm text-gray-600">{t('registerSubtitle')}</p>
        </div>

        <div className="mt-8 bg-white py-8 px-6 shadow rounded-lg">
          <RegisterForm />

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">{t('hasAccount')} </span>
            <Link to="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              {t('loginLink')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
