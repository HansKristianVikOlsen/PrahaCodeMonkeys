import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { msalClient, SCOPES, REDIRECT_URI, validateAuthConfig } from '$lib/server/auth/config';
import { createPkcePair } from '$lib/server/auth/pkce';
import { randomBytes } from 'crypto';

export const GET: RequestHandler = async ({ cookies }) => {
  // Validate configuration before attempting auth URL generation
  const { valid, errors } = validateAuthConfig();
  if (!valid) {
    console.error('[Auth Redirect] Invalid Azure AD configuration:', errors);
    const msg = encodeURIComponent(
      'Invalid Azure AD configuration: ' + errors.join('; ')
    );
    throw redirect(302, `/auth/login?error=${msg}`);
  }

  // Generate a correlation key for PKCE and store challenge
  const pkceKey = randomBytes(16).toString('hex');
  const { challenge } = createPkcePair(pkceKey);

  // Persist pkceKey in an HTTP-only cookie (short-lived)
  cookies.set('pkce_key', pkceKey, {
    path: '/',
    httpOnly: true,
    secure: false, // set true in production (HTTPS)
    sameSite: 'lax',
    maxAge: 300 // 5 minutes
  });

  // Log parameters about to be used
  const authCodeUrlParameters = {
    scopes: SCOPES,
    redirectUri: REDIRECT_URI,
    codeChallenge: challenge,
    codeChallengeMethod: 'S256'
  };
  console.log('[Auth Redirect] Requesting auth code URL with params:', {
    ...authCodeUrlParameters,
    codeChallenge: '[redacted]'
  });

  let authUrl: string;
  try {
    authUrl = await msalClient.getAuthCodeUrl(authCodeUrlParameters);
    console.log('[Auth Redirect] Received auth URL:', authUrl);
  } catch (error) {
    let errMessage = 'Failed to initiate login';
    if (error instanceof Error) {
      errMessage = `Login initiation failed: ${error.message}`;
    }
    console.error('[Auth Redirect] Error generating auth URL:', error);
    throw redirect(302, `/auth/login?error=${encodeURIComponent(errMessage)}`);
  }

  // Perform redirect (outside try/catch so we don't swallow our own redirect)
  throw redirect(302, authUrl);
};
