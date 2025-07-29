import { Suspense } from 'react';

import AppRoutes from '@/routes';
import './App.css';
import './i18n';

const App: React.FC = () => (
  <div className="flex flex-col min-h-screen">
    <div className="flex flex-1">
      <main className="flex-1">
        <Suspense fallback={<div>Loading...</div>}>
          <AppRoutes />
        </Suspense>
      </main>
    </div>
  </div>
);

export default App;
