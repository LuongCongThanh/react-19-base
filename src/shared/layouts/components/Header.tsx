import { memo } from 'react';
import { useTranslation } from 'react-i18next';

export const Header = memo(() => {
  const { t } = useTranslation('common');

  return (
    <header className="border-b bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('dashboard')}</h1>
        <div className="flex items-center gap-4">{/* User menu, notifications, etc. */}</div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';
