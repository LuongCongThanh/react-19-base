import { Navigate } from '@tanstack/react-router';
import type { ComponentType } from 'react';

import { useAuthStore } from '@features/auth/stores/auth.store';

/**
 * HOC để bảo vệ route cần authentication
 * @param Component - Component cần được bảo vệ
 * @returns Component được wrap với auth guard
 */
export function withAuth<P extends object>(Component: ComponentType<P>): ComponentType<P> {
  return function AuthenticatedComponent(props: P) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    if (!isAuthenticated) {
      return <Navigate to="/auth/login" />;
    }

    return <Component {...props} />;
  };
}
