

import { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';

import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import AppRoutes from '@/routes';
import './App.css';
import './i18n';


function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-4">
            <Suspense fallback={<div>Loading...</div>}>
              <AppRoutes />
            </Suspense>
          </main>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App
