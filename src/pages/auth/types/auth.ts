// src/pages/auth/types/auth.ts
export type RouteRole = 'admin' | 'user' | 'guest';

export interface User {
  id?: string;
  username?: string;
  email?: string;
  role?: RouteRole;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface Auth {
  token: string;
  expires: string;
}
