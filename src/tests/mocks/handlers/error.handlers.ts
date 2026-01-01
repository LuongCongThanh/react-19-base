import { http, HttpResponse } from 'msw';

/**
 * MSW request handlers for error scenarios
 * Useful for testing error handling in components
 *
 * @see https://mswjs.io/docs/api/http
 */
export const errorHandlers = [
  /**
   * GET /api/error/500
   * Simulates a 500 server error
   */
  http.get('/api/error/500', () => {
    return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
  }),

  /**
   * GET /api/error/404
   * Simulates a 404 not found error
   */
  http.get('/api/error/404', () => {
    return HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),

  /**
   * GET /api/error/network
   * Simulates a network error
   */
  http.get('/api/error/network', () => {
    return HttpResponse.error();
  }),

  /**
   * GET /api/error/timeout
   * Simulates a request timeout
   */
  http.get('/api/error/timeout', async () => {
    await new Promise((resolve) => setTimeout(resolve, 10000));
    return HttpResponse.json({ message: 'Timeout' }, { status: 408 });
  }),
];
