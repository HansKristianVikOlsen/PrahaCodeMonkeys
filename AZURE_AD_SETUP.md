# Azure AD (Entra ID) Authentication Setup Guide

This guide walks you through setting up Azure Active Directory (now called Microsoft Entra ID) authentication for the Photo Gallery application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Azure AD App Registration](#azure-ad-app-registration)
3. [Environment Configuration](#environment-configuration)
4. [Testing Authentication](#testing-authentication)
5. [Production Deployment](#production-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

- An Azure account with an active subscription
- Access to Azure Active Directory (Entra ID)
- Permissions to register applications in Azure AD
- Node.js (v20.19, v22.12, or v24+) installed
- The project dependencies installed (`pnpm install`)

---

## Azure AD App Registration

### Step 1: Create a New App Registration

1. **Navigate to Azure Portal**
   - Go to [Azure Portal](https://portal.azure.com)
   - Sign in with your Azure credentials

2. **Access App Registrations**
   - In the left sidebar, click **"Azure Active Directory"** (or **"Microsoft Entra ID"**)
   - Click **"App registrations"** in the left menu
   - Click **"+ New registration"** at the top

3. **Configure the Registration**
   - **Name**: Enter a name for your app (e.g., "Photo Gallery App")
   - **Supported account types**: Choose one of:
     - **Accounts in this organizational directory only** (Single tenant) - Recommended for internal apps
     - **Accounts in any organizational directory** (Multi-tenant) - For apps used by multiple organizations
     - **Accounts in any organizational directory and personal Microsoft accounts** - For public apps
   - Click **"Register"**

### Step 2: Configure Redirect URIs

1. After registration, you'll be taken to the app's **Overview** page
2. Click **"Authentication"** in the left menu
3. Under **"Platform configurations"**, click **"+ Add a platform"**
4. Select **"Web"**
5. Add your redirect URIs:
   - **Development**: `http://localhost:5173/auth/callback`
   - **Production**: `https://your-domain.com/auth/callback`
6. Under **"Implicit grant and hybrid flows"**, leave both options unchecked (we're using authorization code flow)
7. Click **"Configure"** and then **"Save"**

### Step 3: Note Your App Credentials

1. Go to the app's **Overview** page
2. Copy and save the following values:
   - **Application (client) ID**: This is your `AZURE_AD_CLIENT_ID`
   - **Directory (tenant) ID**: This is your `AZURE_AD_TENANT_ID`

### Step 4: Create a Client Secret

1. Click **"Certificates & secrets"** in the left menu
2. Under **"Client secrets"**, click **"+ New client secret"**
3. Add a description (e.g., "Photo Gallery Secret")
4. Choose an expiration period:
   - **6 months** (recommended for development)
   - **12 months**
   - **24 months**
   - **Custom** (max 24 months)
5. Click **"Add"**
6. **IMPORTANT**: Copy the **Value** immediately - it will only be shown once!
   - This is your `AZURE_AD_CLIENT_SECRET`
   - Store it securely (password manager, Azure Key Vault, etc.)

### Step 5: Configure API Permissions

1. Click **"API permissions"** in the left menu
2. By default, **"User.Read"** permission should already be added
3. If not, click **"+ Add a permission"**:
   - Select **"Microsoft Graph"**
   - Select **"Delegated permissions"**
   - Search for and select **"User.Read"**
   - Click **"Add permissions"**
4. If your organization requires admin consent:
   - Click **"Grant admin consent for [Your Organization]"**
   - Confirm the action

---

## Environment Configuration

### Step 1: Create Environment File

1. In the project root, create a `.env` file:
   ```bash
   cp .env.example.auth .env
   ```

2. If you already have a `.env` file with Azure Storage settings, just add the new variables

### Step 2: Add Azure AD Configuration

Add the following to your `.env` file:

```env
# Azure AD Authentication
AZURE_AD_CLIENT_ID=your-application-client-id
AZURE_AD_CLIENT_SECRET=your-client-secret-value
AZURE_AD_TENANT_ID=your-directory-tenant-id
AZURE_AD_REDIRECT_URI=http://localhost:5173/auth/callback
```

Replace the placeholder values with your actual credentials from the Azure Portal.

### Step 3: Verify Azure Storage Configuration

Ensure your Azure Storage credentials are also in the `.env` file:

```env
# Azure Blob Storage
AZURE_PHOTO_STORAGE_URL=https://your-account.blob.core.windows.net/photo?sp=...&sig=...
AZURE_COMMENT_STORAGE_URL=https://your-account.blob.core.windows.net/comment?sp=...&sig=...
```

### Step 4: Security Best Practices

- ✅ **Never commit `.env` to version control** (it's in `.gitignore`)
- ✅ **Use different credentials for dev/staging/production**
- ✅ **Rotate client secrets regularly** (set expiration dates)
- ✅ **Use Azure Key Vault in production** for secret management
- ✅ **Restrict redirect URIs** to only your actual domains
- ✅ **Use least privilege principle** for API permissions

---

## Testing Authentication

### Step 1: Start the Development Server

```bash
pnpm dev
```

The application will start at `http://localhost:5173`

### Step 2: Test Login Flow

1. **Access the Application**
   - Open your browser and go to `http://localhost:5173`
   - You should be automatically redirected to `/auth/login`

2. **Sign In**
   - Click the **"Sign in with Microsoft"** button
   - You'll be redirected to Microsoft's login page
   - Enter your Microsoft/Azure AD credentials
   - Grant permissions if prompted

3. **Verify Authentication**
   - After successful login, you'll be redirected back to the app
   - You should see the photo gallery with your name in the top-right corner
   - Click your name to see the user menu with logout option

4. **Test Protected Actions**
   - Try uploading a photo
   - Add comments
   - Edit/delete your own photos

5. **Test Logout**
   - Click your name in the top-right
   - Click **"Sign out"**
   - You should be redirected to the login page
   - Try accessing the app again - you should need to log in

### Step 3: Verify Session Management

1. **Test Session Persistence**
   - Log in successfully
   - Close the browser tab
   - Reopen `http://localhost:5173`
   - You should still be logged in (session persists for 7 days)

2. **Test Invalid Session**
   - Log in successfully
   - Manually clear your browser cookies
   - Refresh the page
   - You should be redirected to login

### Common Test Scenarios

✅ **Successful Login**: User can log in with valid Azure AD credentials  
✅ **Failed Login**: Invalid credentials show appropriate error  
✅ **Session Persistence**: User stays logged in across page refreshes  
✅ **Logout**: User can log out and session is cleared  
✅ **Unauthorized Access**: Unauthenticated users can't access protected routes  
✅ **Protected APIs**: API endpoints require authentication  

---

## Production Deployment

### Step 1: Update Redirect URI

1. Go to Azure Portal > App Registrations > Your App > Authentication
2. Add your production redirect URI:
   ```
   https://your-production-domain.com/auth/callback
   ```
3. Click **"Save"**

### Step 2: Configure Production Environment

Update your production `.env` file:

```env
AZURE_AD_REDIRECT_URI=https://your-production-domain.com/auth/callback
```

### Step 3: Use Secure Secret Management

For production, use secure secret management:

#### Option 1: Azure Key Vault
```typescript
// Example: Load secrets from Azure Key Vault
import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";

const vaultUrl = "https://your-vault-name.vault.azure.net";
const credential = new DefaultAzureCredential();
const client = new SecretClient(vaultUrl, credential);

const clientSecret = await client.getSecret("azure-ad-client-secret");
```

#### Option 2: Environment Variables (Platform-Specific)
- **Vercel**: Use Environment Variables in project settings
- **Azure App Service**: Use Application Settings
- **AWS**: Use Systems Manager Parameter Store or Secrets Manager
- **Heroku**: Use Config Vars

### Step 4: Enable HTTPS

Ensure your production app runs over HTTPS:
- Session cookies are set with `secure: true` in production
- Azure AD requires HTTPS for redirect URIs in production

### Step 5: Update CORS and Security Headers

In production, configure:
- Content Security Policy (CSP)
- CORS policies
- Rate limiting
- Request validation

---

## Troubleshooting

### Issue: "AZURE_AD_CLIENT_ID is not set"

**Cause**: Environment variables not loaded

**Solution**:
1. Ensure `.env` file exists in project root
2. Verify environment variables are set correctly
3. Restart the development server
4. Check for typos in variable names

### Issue: "Redirect URI mismatch"

**Error in browser**: `AADSTS50011: The redirect URI specified in the request does not match the redirect URIs configured for the application`

**Solution**:
1. Go to Azure Portal > App Registrations > Your App > Authentication
2. Verify redirect URIs exactly match (including protocol and port)
3. Development: `http://localhost:5173/auth/callback`
4. Make sure there are no trailing slashes
5. Click "Save" after making changes
6. Wait a few minutes for changes to propagate

### Issue: "Invalid client secret"

**Error in logs**: `AADSTS7000215: Invalid client secret is provided`

**Solution**:
1. Check if client secret has expired
2. Verify you copied the secret **value**, not the secret ID
3. Create a new client secret if needed
4. Update `.env` with the new secret
5. Restart the server

### Issue: "User not redirected after login"

**Cause**: Callback endpoint error or session not created

**Solution**:
1. Check browser console for errors
2. Check server logs for authentication errors
3. Verify callback route exists: `/src/routes/auth/callback/+server.ts`
4. Test callback URL directly: `http://localhost:5173/auth/callback?code=test`

### Issue: Session expires too quickly

**Solution**: Update session timeout in `src/lib/server/auth/session.ts`:
```typescript
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days (default)
// Increase to 30 days:
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;
```

### Issue: "Cannot GET /auth/callback"

**Cause**: Route not found or SvelteKit routing issue

**Solution**:
1. Verify file exists: `src/routes/auth/callback/+server.ts`
2. Restart development server
3. Clear `.svelte-kit` cache: `rm -rf .svelte-kit && pnpm dev`

### Issue: CORS errors in production

**Cause**: Redirect URI or API calls crossing origins

**Solution**:
1. Ensure redirect URI matches your production domain exactly
2. Configure CORS headers if using separate API domain
3. Verify cookies are set with correct `sameSite` and `secure` attributes

### Debugging Tips

1. **Enable Detailed Logging**
   ```typescript
   // In src/lib/server/auth/config.ts
   logLevel: 0, // Verbose (0), Info (3), Warning (2), Error (1)
   ```

2. **Check Browser Network Tab**
   - Look for failed requests to `/auth/*` endpoints
   - Check response headers and status codes
   - Verify cookies are being set

3. **Inspect Session Cookie**
   - Open browser DevTools > Application > Cookies
   - Look for `session` cookie
   - Verify it has correct attributes (httpOnly, secure, sameSite)

4. **Test Azure AD Configuration**
   - Go to Azure Portal > App Registrations > Your App > Authentication
   - Click "Test" to verify configuration
   - Check token endpoint and authorization endpoint

---

## Additional Resources

- [Microsoft Identity Platform Documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [MSAL Node Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-node)
- [Azure AD Authentication Flows](https://docs.microsoft.com/en-us/azure/active-directory/develop/authentication-flows-app-scenarios)
- [SvelteKit Authentication Patterns](https://kit.svelte.dev/docs/hooks#server-hooks-handle)

---

## Security Considerations

### Client Secret Management

- ❌ **NEVER** commit secrets to version control
- ❌ **NEVER** expose secrets in client-side code
- ✅ Store secrets in environment variables
- ✅ Use secret rotation policies
- ✅ Use Azure Key Vault for production
- ✅ Set expiration dates on client secrets

### Session Security

- ✅ Sessions are stored server-side (in-memory by default)
- ✅ Session cookies are `httpOnly` (not accessible via JavaScript)
- ✅ Session cookies use `sameSite: 'lax'` protection
- ✅ Session cookies are `secure` in production (HTTPS only)
- ✅ Sessions expire after 7 days of inactivity
- 💡 Consider using Redis or database for session storage in production

### API Security

- ✅ All API endpoints check authentication via hooks
- ✅ User ID from session, not user input
- ✅ Authorization checks for delete/update operations
- ✅ Input validation on all endpoints
- 💡 Consider adding rate limiting
- 💡 Consider adding request signing/verification

---

## Next Steps

After setting up authentication:

1. **Customize User Experience**
   - Add user profile page
   - Implement user preferences
   - Add user-specific features

2. **Enhance Security**
   - Implement rate limiting
   - Add audit logging
   - Set up monitoring and alerts

3. **Production Readiness**
   - Use Redis/Database for sessions
   - Implement proper secret management
   - Set up CI/CD with secure environment variables
   - Configure production logging

4. **Optional Features**
   - Multi-factor authentication (MFA)
   - Conditional access policies
   - Role-based access control (RBAC)
   - External identity providers (Google, Facebook, etc.)

---

**Need Help?** Check the [Troubleshooting](#troubleshooting) section or review the Azure AD documentation.