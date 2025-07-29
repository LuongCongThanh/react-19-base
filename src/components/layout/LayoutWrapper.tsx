import React from 'react';

import AppLayout from '@/components/layout/AppLayout/AppLayout';
import PublicLayout from '@/components/layout/PublicLayout/PublicLayout';

interface LayoutWrapperProps {
  layout?: 'AppLayout' | 'PublicLayout' | 'None';
  children: React.ReactNode;
}

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ layout, children }) => {
  return (
    <div className="min-h-screen transition-all duration-500">
      {layout === 'None' && <div className="animate-fade-in">{children}</div>}
      {layout === 'PublicLayout' && (
        <div className="animate-fade-in">
          <PublicLayout>{children}</PublicLayout>
        </div>
      )}
      {layout === 'AppLayout' && (
        <div className="animate-fade-in">
          <AppLayout>{children}</AppLayout>
        </div>
      )}
      {!layout && (
        <div className="animate-fade-in">
          <PublicLayout>{children}</PublicLayout>
        </div>
      )}
    </div>
  );
};

export default LayoutWrapper;
