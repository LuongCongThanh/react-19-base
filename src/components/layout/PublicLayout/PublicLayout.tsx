import React from 'react';

import PublicFooter from '@/components/layout/PublicLayout/PublicFooter';
import PublicHeader from '@/components/layout/PublicLayout/PublicHeader';

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="public-layout min-h-screen flex flex-col bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100">
    <PublicHeader />
    {children}
    <PublicFooter />
  </div>
);

export default PublicLayout;
