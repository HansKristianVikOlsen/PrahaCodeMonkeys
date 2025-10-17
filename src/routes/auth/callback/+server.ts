import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { msalClient, SCOPES, REDIRECT_URI } from '$lib/server/auth/config';
import { createSession, createSessionCookie } from '$lib/server/auth/session';

export const GET: RequestHandler = async ({ url, cookies }) => {
  try {
    // Get the authorization code from the callback
    const code = url.searchParams.get('code');

    if (!code) {
      const error = url.searchParams.get('error_description') || 'Authorization code not found';
      throw redirect(302, `/auth/login?error=${encodeURIComponent(error)}`);
    }

    // Exchange the authorization code for tokens
    const tokenRequest = {
      code,
      scopes: SCOPES,
      redirectUri: REDIRECT_URI,
    };

    const tokenResponse = await msalClient.acquireTokenByCode(tokenRequest);

    if (!tokenResponse || !tokenResponse.account) {
      throw redirect(302, '/auth/login?error=Failed+to+acquire+token');
    }

    // Create a session
    const sessionId = createSession(tokenResponse.account, tokenResponse.accessToken);

    // Set session cookie
    const isSecure = url.protocol === 'https:';
    cookies.set('session', sessionId, {
      path: '/',
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Redirect to home page
    throw redirect(302, '/');
  } catch (error) {
    console.error('Authentication callback error:', error);

    // If it's already a redirect, rethrow it
    if (error instanceof Response && error.status === 302) {
      throw error;
    }

    throw redirect(302, '/auth/login?error=Authentication+failed');
  }
};
