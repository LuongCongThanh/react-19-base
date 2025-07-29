// src/hooks/useAuth.ts
import { useSelector } from 'react-redux';

import type { RootState } from '../store';

export function useAuth() {
  // Example: get auth state from Redux
  return useSelector((state: RootState) => state.auth);
}
