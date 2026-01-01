import { Link } from '@tanstack/react-router';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@shared/lib/cn.utils';

interface SidebarProps {
  className?: string;
}

export const Sidebar = memo(({ className }: SidebarProps) => {
  const { t } = useTranslation('common');

  return (
    <aside className={cn('w-64 bg-gray-900 text-white', className)}>
      <nav className="p-4" aria-label="Main navigation">
        <ul className="space-y-2">
          <li>
            <Link
              to="/dashboard"
              className="block rounded-md px-3 py-2 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              {t('dashboard')}
            </Link>
          </li>
          {/* Products route will be added later */}
          {/* <li>
            <Link
              to="/products"
              className="block rounded-md px-3 py-2 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Products
            </Link>
          </li> */}
        </ul>
      </nav>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';
