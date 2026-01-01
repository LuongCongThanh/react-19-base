/**
 * Central export for all MSW handlers
 * Handlers are organized by feature/module
 */

import { authHandlers } from './auth.handlers';
import { errorHandlers } from './error.handlers';
import { usersHandlers } from './users.handlers';

/**
 * All MSW handlers combined
 * Add new handlers here as you create them
 */
export const handlers = [...authHandlers, ...usersHandlers, ...errorHandlers];
