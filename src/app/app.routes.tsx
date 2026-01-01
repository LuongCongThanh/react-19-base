import { createRoute, Navigate } from '@tanstack/react-router';

import { ForgotPasswordPage, LoginPage, RegisterPage, ResetPasswordPage } from '@features/auth/auth.routes';
import { dashboardRoutes } from '@features/dashboard/dashboard.routes';

import { rootRoute } from './app.router';

// Auth routes
export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/login',
  component: LoginPage,
});

export const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/register',
  component: RegisterPage,
});

export const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/forgot-password',
  component: ForgotPasswordPage,
});

export const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/reset-password',
  component: ResetPasswordPage,
});

// Index route - redirect to login for now
export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <Navigate to="/auth/login" />,
});

// All routes
export const appRoutes = [
  indexRoute,
  loginRoute,
  registerRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  ...dashboardRoutes,
];
