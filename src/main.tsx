import { configureStore } from '@reduxjs/toolkit';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { registerSW } from 'virtual:pwa-register';

import App from './App';
import './i18n';
import './index.css';
import rootReducer from './store';

const store = configureStore({ reducer: rootReducer });

registerSW({
  onNeedRefresh() {
    // Hiển thị thông báo cho user, ví dụ: window.location.reload();
  },
  onOfflineReady() {
    // Thông báo app đã sẵn sàng offline
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);
