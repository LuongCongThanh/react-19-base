import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { AccessToken } from '@shared/types/common.types';

import type { AuthState, User } from '@features/auth/types/auth.types';

interface AuthStore extends AuthState {
  setAuth: (user: User, token: AccessToken) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),

      clearAuth: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
