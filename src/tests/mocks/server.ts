import { setupServer, type SetupServer } from 'msw/node';

import { handlers } from './handlers/index';

/**
 * MSW server for API mocking in tests
 * This server intercepts HTTP requests and returns mocked responses
 *
 * @example
 * // In your test file:
 * import { server } from '@tests/mocks/server';
 *
 * // Server is automatically started in setup-jest.ts
 * // You can reset handlers between tests:
 * afterEach(() => {
 *   server.resetHandlers();
 * });
 */
export const server: SetupServer = setupServer(...handlers);
