/**
 * Cấu hình tập trung cho tất cả các route
 * - Định nghĩa path, component, role, layout, ...
 * - Được sử dụng bởi router chính để render động
 */
import React from 'react';

export type RouteRole = 'admin' | 'user' | 'guest';

export type AppRouteItem = {
  code: string;
  path: string;
  Component: React.LazyExoticComponent<React.ComponentType<any>>;
  titleKey: string;
  roles?: RouteRole[];
  exact?: boolean;
  layout?: 'AppLayout' | 'PublicLayout' | 'None';
};

// Lazy import các page
const LoginPage = React.lazy(() => import('../pages/auth/Login'));
const RegisterPage = React.lazy(() => import('../pages/auth/Register'));
const HomePage = React.lazy(() => import('../pages/home'));
const DashboardPage = React.lazy(() => import('../pages/dashboard'));
const NotFoundPage = React.lazy(() => import('../components/layout/NotFoundPage'));

export const ROUTES: AppRouteItem[] = [
  // Public routes
  {
    code: 'login',
    path: '/login',
    Component: LoginPage,
    titleKey: 'navigation.login',
    roles: ['guest'],
    layout: 'PublicLayout',
  },
  {
    code: 'register',
    path: '/register',
    Component: RegisterPage,
    titleKey: 'navigation.register',
    roles: ['guest'],
    layout: 'PublicLayout',
  },
  {
    code: 'home',
    path: '/',
    Component: HomePage,
    titleKey: 'navigation.home',
    roles: ['guest', 'user'],
    layout: 'PublicLayout',
    exact: true,
  },
  {
    code: 'dashboard',
    path: '/dashboard',
    Component: DashboardPage,
    titleKey: 'navigation.dashboard',
    roles: ['admin'],
    layout: 'AppLayout',
  },
  // Fallback
  {
    code: 'notfound',
    path: '*',
    Component: NotFoundPage,
    titleKey: 'navigation.notfound',
    layout: 'None',
  },
];
