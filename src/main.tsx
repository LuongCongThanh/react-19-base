import { RouterProvider } from '@tanstack/react-router';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { AppProviders } from '@app/app.providers';
import { router } from '@app/app.router';

import { setRouter } from '@shared/lib/navigation';
import { initializeSentry } from '@shared/lib/sentry.config';

import './locales/i18n.config';
import './styles/tailwind.css';

// Initialize Sentry for error tracking (if enabled)
initializeSentry();

// Set router instance for navigation utility (used in axios interceptors)
setRouter(router);

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found. Make sure there is a <div id="root"></div> in your HTML.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </React.StrictMode>
);
