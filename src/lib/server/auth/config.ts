import 'dotenv/config';
import { ConfidentialClientApplication, type Configuration } from '@azure/msal-node';
import {
  AZURE_AD_CLIENT_ID,
  AZURE_AD_CLIENT_SECRET,
  AZURE_AD_TENANT_ID,
  AZURE_AD_REDIRECT_URI
} from '$env/static/private';

// Normalize and assign environment variables
const clientId = (AZURE_AD_CLIENT_ID || '').trim();
const clientSecret = (AZURE_AD_CLIENT_SECRET || '').trim();
const tenantId = (AZURE_AD_TENANT_ID || '').trim();
const redirectUri = (AZURE_AD_REDIRECT_URI || 'http://localhost:5173/auth/callback').trim();

// Validate configuration early
export function validateAuthConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!clientId) {
    errors.push('AZURE_AD_CLIENT_ID is not set');
  }
  if (!clientSecret) {
    errors.push('AZURE_AD_CLIENT_SECRET is not set');
  }
  if (!tenantId) {
    errors.push('AZURE_AD_TENANT_ID is not set');
  }
  if (!redirectUri) {
    errors.push('AZURE_AD_REDIRECT_URI is not set');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

const { valid, errors } = validateAuthConfig();

if (!valid) {
  console.error('[Auth] Azure AD configuration errors:', errors);
  // Throwing here prevents MSAL from constructing with empty secret and producing a less helpful error
  throw new Error('Azure AD configuration invalid. Missing: ' + errors.join(', '));
} else {
  console.log(
    `[Auth] Azure AD config loaded: clientId=${clientId}, tenantId=${tenantId}, redirectUri=${redirectUri}`
  );
}

// MSAL Configuration (only executed if validation passed)
const msalConfig: Configuration = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    clientSecret
  },
  system: {
    loggerOptions: {
      loggerCallback(loglevel, message, containsPii) {
        if (containsPii) return;
        // MSAL internal log messages
        console.log('[MSAL]', message);
      },
      piiLoggingEnabled: false,
      logLevel: 3 // Info
    }
  }
};

// Create MSAL client instance
export const msalClient = new ConfidentialClientApplication(msalConfig);

// Authentication scopes
export const SCOPES = ['User.Read'];

// Redirect URI export
export const REDIRECT_URI = redirectUri;
