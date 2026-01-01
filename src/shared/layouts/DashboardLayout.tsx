import { Outlet } from '@tanstack/react-router';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';

export const DashboardLayout = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main id="main-content" className="flex-1 overflow-y-auto p-6" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
