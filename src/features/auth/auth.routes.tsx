import { lazy } from 'react';

// Lazy load auth pages for code splitting
export const LoginPage = lazy(() =>
  import('@features/auth/pages/LoginPage').then((module) => ({
    default: module.LoginPage,
  }))
);

export const RegisterPage = lazy(() =>
  import('@features/auth/pages/RegisterPage').then((module) => ({
    default: module.RegisterPage,
  }))
);

export const ForgotPasswordPage = lazy(() =>
  import('@features/auth/pages/ForgotPasswordPage').then((module) => ({
    default: module.ForgotPasswordPage,
  }))
);

export const ResetPasswordPage = lazy(() =>
  import('@features/auth/pages/ResetPasswordPage').then((module) => ({
    default: module.ResetPasswordPage,
  }))
);
