import React, { Suspense, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { filterRoutesByRole } from './router.helper';

import type { RouteRole } from '@/routes/pathConfig';
import type { RootState } from '@/store';

import LayoutWrapper from '@/components/layout/LayoutWrapper';

function getDefaultRoute(routes: any[], role: RouteRole): string {
  if (role === 'admin') {
    return routes.find((r) => r.roles?.includes('admin') && r.path !== '*')?.path || '/login';
  }
  if (role === 'user') {
    return routes.find((r) => r.roles?.includes('user') && r.path !== '*')?.path || '/login';
  }
  return routes.find((r) => r.roles?.includes('guest') && r.path !== '*')?.path || '/login';
}

function hasPermission(user: any, roles?: RouteRole[]): boolean {
  if (!roles) {
    return true;
  }
  if (!user) {
    return roles.includes('guest');
  }
  return roles.includes(user.role);
}

const AppRouters: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const role = user?.role || 'guest';
  const routes = useMemo(() => filterRoutesByRole(role as RouteRole), [role]);
  const defaultRoute = useMemo(() => getDefaultRoute(routes, role), [routes, role]);

  return (
    <BrowserRouter>
      <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Loading...</div>}>
        <Routes>
          {routes.map(({ code, path, Component, layout, roles }) => (
            <Route
              key={code}
              path={path}
              element={
                hasPermission(user, roles) ? (
                  <LayoutWrapper layout={layout}>
                    <Component />
                  </LayoutWrapper>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          ))}
          <Route path="/" element={<Navigate to={defaultRoute} replace />} />
          <Route path="*" element={<Navigate to="/not-found" />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouters;
