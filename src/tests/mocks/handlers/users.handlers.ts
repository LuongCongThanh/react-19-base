import { http, HttpResponse } from 'msw';

/**
 * MSW request handlers for user endpoints
 *
 * @see https://mswjs.io/docs/api/http
 */
export const usersHandlers = [
  /**
   * GET /api/users
   * Returns a list of mock users
   */
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: '1', name: 'User 1', email: 'user1@example.com' },
      { id: '2', name: 'User 2', email: 'user2@example.com' },
    ]);
  }),

  /**
   * GET /api/users/:id
   * Returns a single user by ID
   */
  http.get('/api/users/:id', ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      id,
      name: `User ${id}`,
      email: `user${id}@example.com`,
    });
  }),

  /**
   * POST /api/users
   * Creates a new user
   */
  http.post('/api/users', async ({ request }) => {
    try {
      const body = await request.json();
      return HttpResponse.json(
        {
          id: '3',
          ...(body as Record<string, unknown>),
        },
        { status: 201 }
      );
    } catch (_error) {
      return HttpResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }
  }),

  /**
   * PUT /api/users/:id
   * Updates a user
   */
  http.put('/api/users/:id', async ({ request, params }) => {
    try {
      const body = await request.json();
      return HttpResponse.json({
        id: params.id,
        ...(body as Record<string, unknown>),
      });
    } catch (_error) {
      return HttpResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }
  }),

  /**
   * DELETE /api/users/:id
   * Deletes a user
   */
  http.delete('/api/users/:id', () => {
    return HttpResponse.json({ message: 'User deleted' }, { status: 200 });
  }),
];
