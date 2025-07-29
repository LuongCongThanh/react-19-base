// src/routes/index.tsx
import { useRoutes } from 'react-router-dom';

import { privateRoutes } from './privateRoutes';
import { publicRoutes } from './publicRoutes';

export default function AppRoutes() {
  // Combine public and private routes as needed
  const routes = [...publicRoutes, ...privateRoutes];
  return useRoutes(routes);
}
