import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { msalClient, SCOPES, REDIRECT_URI } from '$lib/server/auth/config';

export const GET: RequestHandler = async () => {
  try {
    // Generate the authorization URL
    const authCodeUrlParameters = {
      scopes: SCOPES,
      redirectUri: REDIRECT_URI,
    };

    const authUrl = await msalClient.getAuthCodeUrl(authCodeUrlParameters);

    // Redirect to Azure AD login page
    throw redirect(302, authUrl);
  } catch (error) {
    console.error('Failed to generate auth URL:', error);
    throw redirect(302, '/auth/login?error=Failed+to+initiate+login');
  }
};
