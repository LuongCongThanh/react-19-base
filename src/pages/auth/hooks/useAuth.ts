// src/pages/auth/hooks/useAuth.ts
import { useDispatch, useSelector } from 'react-redux';

import { logout } from '../slices/authSlice';

import type { RootState } from 'src/store';

export default function useAuth() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();

  const isAuthenticated = !!user?.id;
  const doLogout = () => dispatch(logout());

  return { user, isAuthenticated, logout: doLogout };
}
