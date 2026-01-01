import { delay, http, HttpResponse } from 'msw';

/**
 * MSW request handlers for authentication endpoints
 *
 * @see https://mswjs.io/docs/api/http
 */
export const authHandlers = [
  /**
   * POST /auth/login
   * Mock login endpoint
   *
   * Valid credentials:
   * - email: test@test.com
   * - password: password123
   */
  http.post('/auth/login', async ({ request }) => {
    await delay(300); // Simulate network delay

    try {
      const body = await request.json();

      if (body && typeof body === 'object' && 'email' in body && 'password' in body) {
        // Validate input
        if (!body.email || !body.password) {
          return HttpResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        // Mock successful login
        if (body.email === 'test@test.com' && body.password === 'password123') {
          return HttpResponse.json({
            token: 'token123',
            refreshToken: 'refresh-token-123',
            user: { id: '1', email: 'test@test.com', name: 'Test' },
          });
        }

        return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      return HttpResponse.json({ error: 'Invalid request body' }, { status: 400 });
    } catch (_error) {
      return HttpResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
  }),

  /**
   * POST /auth/register
   * Mock register endpoint
   */
  http.post('/auth/register', async ({ request }) => {
    await delay(300);

    try {
      const body = await request.json();

      if (body && typeof body === 'object' && 'email' in body && 'password' in body) {
        // Validate input
        if (!body.email || !body.password) {
          return HttpResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        // Mock email already exists
        if (body.email === 'existing@example.com') {
          return HttpResponse.json({ error: 'Email already exists' }, { status: 409 });
        }

        return HttpResponse.json(
          {
            token: 'token123',
            refreshToken: 'refresh-token-123',
            user: {
              id: '1',
              email: body.email as string,
              name: 'name' in body ? (body.name as string) : 'User',
            },
          },
          { status: 201 }
        );
      }

      return HttpResponse.json({ error: 'Invalid request body' }, { status: 400 });
    } catch (_error) {
      return HttpResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
  }),

  /**
   * POST /auth/forgot-password
   * Mock forgot password endpoint
   */
  http.post('/auth/forgot-password', async ({ request }) => {
    await delay(300);

    try {
      const body = await request.json();

      if (body && typeof body === 'object' && 'email' in body) {
        if (!body.email) {
          return HttpResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Mock email not found
        if (body.email === 'notfound@example.com') {
          return HttpResponse.json({ error: 'Email not found' }, { status: 404 });
        }

        return HttpResponse.json({ success: true, message: 'Password reset email sent' }, { status: 200 });
      }

      return HttpResponse.json({ error: 'Email is required' }, { status: 400 });
    } catch (_error) {
      return HttpResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
  }),

  /**
   * POST /auth/reset-password
   * Mock reset password endpoint
   */
  http.post('/auth/reset-password', async ({ request }) => {
    await delay(300);

    try {
      const body = await request.json();

      if (body && typeof body === 'object' && 'token' in body && 'password' in body && 'confirmPassword' in body) {
        if (!body.token || !body.password || !body.confirmPassword) {
          return HttpResponse.json({ error: 'Token, password, and confirmPassword are required' }, { status: 400 });
        }

        if (body.password !== body.confirmPassword) {
          return HttpResponse.json({ error: 'Passwords do not match' }, { status: 400 });
        }

        // Mock invalid token
        if (body.token === 'invalid-token') {
          return HttpResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
        }

        return HttpResponse.json({ success: true, message: 'Password reset successfully' }, { status: 200 });
      }

      return HttpResponse.json({ error: 'Token and password are required' }, { status: 400 });
    } catch (_error) {
      return HttpResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
  }),

  /**
   * POST /auth/change-password
   * Mock change password endpoint
   */
  http.post('/auth/change-password', async ({ request }) => {
    await delay(300);

    try {
      const body = await request.json();

      if (
        body &&
        typeof body === 'object' &&
        'currentPassword' in body &&
        'newPassword' in body &&
        'confirmPassword' in body
      ) {
        if (!body.currentPassword || !body.newPassword || !body.confirmPassword) {
          return HttpResponse.json({ error: 'All password fields are required' }, { status: 400 });
        }

        // Mock incorrect current password
        if (body.currentPassword === 'wrong-password') {
          return HttpResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
        }

        if (body.newPassword !== body.confirmPassword) {
          return HttpResponse.json({ error: 'New passwords do not match' }, { status: 400 });
        }

        return HttpResponse.json({ success: true, message: 'Password changed successfully' }, { status: 200 });
      }

      return HttpResponse.json({ error: 'All password fields are required' }, { status: 400 });
    } catch (_error) {
      return HttpResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
  }),

  /**
   * GET /auth/me
   * Mock get current user endpoint
   */
  http.get('/auth/me', async ({ request }) => {
    await delay(200);

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return HttpResponse.json({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      avatar: 'https://ui-avatars.com/api/?name=Test+User&background=random',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }),

  /**
   * POST /auth/refresh
   * Mock refresh token endpoint
   */
  http.post('/auth/refresh', async ({ request }) => {
    await delay(200);

    try {
      const body = await request.json();
      const { refreshToken } = body as { refreshToken: string };

      if (!refreshToken) {
        return HttpResponse.json({ error: 'Refresh token is required' }, { status: 400 });
      }

      // Mock expired refresh token
      if (refreshToken === 'expired-refresh-token') {
        return HttpResponse.json({ error: 'Refresh token expired' }, { status: 401 });
      }

      return HttpResponse.json({
        token: 'new-access-token-' + Date.now(),
        refreshToken: 'new-refresh-token-' + Date.now(),
      });
    } catch (_error) {
      return HttpResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
  }),

  /**
   * POST /auth/logout
   * Mock logout endpoint
   */
  http.post('/auth/logout', async () => {
    await delay(200);
    return HttpResponse.json({ success: true });
  }),
];
