import React, { Suspense } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { AuthProvider } from '@/contexts/AuthContext';
import { TenantProvider } from '@/contexts/TenantContext';
import { SecurityProvider } from '@/security';
import { DynamicRouter, RouterProviderComposer } from '@/router';

import { store } from '@/store';
import './i18n';

// ===== ROUTE CONFIGURATIONS =====

import { createRoute } from '@/router';
import type { RouteConfig } from '@/types/routing';

// Import page components
const LoginPage = React.lazy(() => import('@/pages/auth/Login'));
const RegisterPage = React.lazy(() => import('@/pages/auth/Register'));
const HomePage = React.lazy(() => import('@/pages/home'));
const DashboardPage = React.lazy(() => import('@/pages/dashboard'));
const AboutPage = React.lazy(() => import('@/pages/about'));

// Define routes
const routes: RouteConfig[] = [
  // Public routes
  createRoute({
    code: 'login',
    path: '/login',
    titleKey: 'navigation.login',
    component: () => import('@/pages/auth/Login'),
    layout: 'PublicLayout',
    security: { roles: ['guest'] },
    meta: { title: 'Login', requiresAuth: false, isPublic: true },
  }),
  createRoute({
    code: 'register',
    path: '/register',
    titleKey: 'navigation.register',
    component: () => import('@/pages/auth/Register'),
    layout: 'PublicLayout',
    security: { roles: ['guest'] },
    meta: { title: 'Register', requiresAuth: false, isPublic: true },
  }),
  createRoute({
    code: 'home',
    path: '/',
    titleKey: 'navigation.home',
    component: () => import('@/pages/home'),
    layout: 'PublicLayout',
    security: { roles: ['guest', 'user', 'admin'] },
    meta: { title: 'Home', requiresAuth: false, isPublic: true },
    exact: true,
  }),
  createRoute({
    code: 'about',
    path: '/about',
    titleKey: 'navigation.about',
    component: () => import('@/pages/about'),
    layout: 'PublicLayout',
    security: { roles: ['guest', 'user', 'admin'] },
    meta: { title: 'About', requiresAuth: false, isPublic: true },
  }),
  
  // Protected routes
  createRoute({
    code: 'dashboard',
    path: '/dashboard',
    titleKey: 'navigation.dashboard',
    component: () => import('@/pages/dashboard'),
    layout: 'UserLayout',
    security: { 
      roles: ['user', 'admin'],
      permissions: ['dashboard.read'],
      guards: ['auth', 'role']
    },
    meta: { title: 'Dashboard', requiresAuth: true },
  }),
  
  // Admin routes
  createRoute({
    code: 'admin-dashboard',
    path: '/admin',
    titleKey: 'navigation.admin',
    component: () => import('@/pages/dashboard'), // TODO: Create admin dashboard
    layout: 'AdminLayout',
    security: { 
      roles: ['admin'],
      permissions: ['admin.read'],
      guards: ['auth', 'role', 'permission']
    },
    meta: { title: 'Admin Dashboard', requiresAuth: true, isAdmin: true },
  }),
  
  // Fallback
  createRoute({
    code: 'notfound',
    path: '*',
    titleKey: 'navigation.notfound',
    component: () => import('@/layouts/NotFoundPage'),
    layout: 'PublicLayout',
    security: { roles: ['guest', 'user', 'admin'] },
    meta: { title: 'Not Found', requiresAuth: false },
  }),
];

// ===== MAIN APP COMPONENT =====

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <SecurityProvider>
          <AuthProvider>
            <TenantProvider>
              <RouterProviderComposer routes={routes}>
                <div className="flex flex-col min-h-screen">
                  <div className="flex flex-1">
                    <main className="flex-1">
                      <Suspense fallback={
                        <div className="flex h-screen w-full items-center justify-center">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading...</p>
                          </div>
                        </div>
                      }>
                        <DynamicRouter routes={routes} />
                      </Suspense>
                    </main>
                  </div>
                </div>
              </RouterProviderComposer>
            </TenantProvider>
          </AuthProvider>
        </SecurityProvider>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
