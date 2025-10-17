import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { msalClient, SCOPES, REDIRECT_URI } from '$lib/server/auth/config';
import { createSession } from '$lib/server/auth/session';
import { getVerifier, deletePkcePair } from '$lib/server/auth/pkce';

export const GET: RequestHandler = async ({ url, cookies }) => {
  try {
    // 1. Extract auth code
    const code = url.searchParams.get('code');
    if (!code) {
      const error =
        url.searchParams.get('error_description') || 'Authorization code not found';
      throw redirect(302, `/auth/login?error=${encodeURIComponent(error)}`);
    }

    // 2. Retrieve PKCE key from cookie
    const pkceKey = cookies.get('pkce_key');
    if (!pkceKey) {
      throw redirect(
        302,
        '/auth/login?error=' + encodeURIComponent('Missing PKCE key (cookie expired)')
      );
    }

    // 3. Load stored verifier
    const codeVerifier = getVerifier(pkceKey);
    if (!codeVerifier) {
      throw redirect(
        302,
        '/auth/login?error=' + encodeURIComponent('PKCE verifier not found or expired')
      );
    }

    // 4. Prepare token request with PKCE
    const tokenRequest = {
      code,
      scopes: SCOPES,
      redirectUri: REDIRECT_URI,
      codeVerifier
    };

    console.log('[Auth Callback] Redeeming auth code with PKCE (verifier redacted)');

    // 5. Acquire token
    const tokenResponse = await msalClient.acquireTokenByCode(tokenRequest);

    if (!tokenResponse || !tokenResponse.account) {
      throw redirect(
        302,
        '/auth/login?error=' + encodeURIComponent('Failed to acquire token')
      );
    }

    // 6. Clean up PKCE artifacts
    deletePkcePair(pkceKey);
    cookies.set('pkce_key', '', {
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 0
    });

    // 7. Create session
    const sessionId = createSession(
      tokenResponse.account,
      tokenResponse.accessToken
    );

    // 8. Set session cookie
    const isSecure = url.protocol === 'https:';
    cookies.set('session', sessionId, {
      path: '/',
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    // 9. Redirect to home
    throw redirect(302, '/');
  } catch (error) {
    console.error('[Auth Callback] Error during token exchange:', error);

    // Rethrow existing redirect objects
    if ((error as any)?.status === 302) {
      throw error;
    }

    throw redirect(
      302,
      '/auth/login?error=' + encodeURIComponent('Authentication failed')
    );
  }
};
