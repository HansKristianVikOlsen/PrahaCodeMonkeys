import { ConfidentialClientApplication, type Configuration } from '@azure/msal-node';

// Environment variables for Azure AD
const AZURE_AD_CLIENT_ID = process.env.AZURE_AD_CLIENT_ID || '';
const AZURE_AD_CLIENT_SECRET = process.env.AZURE_AD_CLIENT_SECRET || '';
const AZURE_AD_TENANT_ID = process.env.AZURE_AD_TENANT_ID || '';
const AZURE_AD_REDIRECT_URI = process.env.AZURE_AD_REDIRECT_URI || 'http://localhost:5173/auth/callback';

// MSAL Configuration
const msalConfig: Configuration = {
  auth: {
    clientId: AZURE_AD_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${AZURE_AD_TENANT_ID}`,
    clientSecret: AZURE_AD_CLIENT_SECRET,
  },
  system: {
    loggerOptions: {
      loggerCallback(loglevel, message, containsPii) {
        if (containsPii) {
          return;
        }
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: 3, // Info
    },
  },
};

// Create MSAL client instance
export const msalClient = new ConfidentialClientApplication(msalConfig);

// Authentication scopes
export const SCOPES = ['user.read'];

// Redirect URI
export const REDIRECT_URI = AZURE_AD_REDIRECT_URI;

// Validate configuration
export function validateAuthConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!AZURE_AD_CLIENT_ID) {
    errors.push('AZURE_AD_CLIENT_ID is not set');
  }
  if (!AZURE_AD_CLIENT_SECRET) {
    errors.push('AZURE_AD_CLIENT_SECRET is not set');
  }
  if (!AZURE_AD_TENANT_ID) {
    errors.push('AZURE_AD_TENANT_ID is not set');
  }
  if (!AZURE_AD_REDIRECT_URI) {
    errors.push('AZURE_AD_REDIRECT_URI is not set');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
