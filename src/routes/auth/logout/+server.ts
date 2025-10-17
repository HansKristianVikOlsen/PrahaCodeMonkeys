import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deleteSession, parseSessionCookie } from '$lib/server/auth/session';

export const GET: RequestHandler = async ({ request, cookies }) => {
  try {
    // Get the session ID from the cookie
    const sessionId = parseSessionCookie(request.headers.get('cookie'));

    // Delete the session if it exists
    if (sessionId) {
      deleteSession(sessionId);
    }

    // Clear the session cookie
    cookies.delete('session', {
      path: '/',
    });

    // Redirect to login page
    throw redirect(302, '/auth/login');
  } catch (error) {
    // If it's already a redirect, rethrow it
    if (error instanceof Response && error.status === 302) {
      throw error;
    }

    console.error('Logout error:', error);
    throw redirect(302, '/auth/login');
  }
};

export const POST: RequestHandler = async ({ request, cookies }) => {
  // Support POST method for logout as well
  return GET({ request, cookies } as any);
};
