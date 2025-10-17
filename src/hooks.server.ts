import { redirect, type Handle } from '@sveltejs/kit';
import { parseSessionCookie, getSession } from '$lib/server/auth/session';

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/auth/login', '/auth/callback', '/auth/logout'];

export const handle: Handle = async ({ event, resolve }) => {
  // Parse session cookie
  const sessionId = parseSessionCookie(event.request.headers.get('cookie'));

  // Initialize locals
  event.locals.user = null;
  event.locals.sessionId = sessionId;

  // Get session data if session exists
  if (sessionId) {
    const session = getSession(sessionId);
    if (session) {
      event.locals.user = {
        id: session.userId,
        username: session.username,
        email: session.email,
      };
    }
  }

  // Check if route requires authentication
  const isPublicRoute = PUBLIC_ROUTES.some((route) => event.url.pathname.startsWith(route));

  // Redirect to login if not authenticated and not on a public route
  if (!event.locals.user && !isPublicRoute) {
    throw redirect(302, '/auth/login');
  }

  // Redirect to home if authenticated and trying to access login page
  if (event.locals.user && event.url.pathname === '/auth/login') {
    throw redirect(302, '/');
  }

  const response = await resolve(event);
  return response;
};
