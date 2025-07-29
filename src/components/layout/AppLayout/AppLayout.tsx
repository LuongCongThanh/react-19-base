import React from 'react';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="app-layout min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-100">{children}</div>
);

export default AppLayout;
