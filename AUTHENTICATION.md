# Authentication System Overview

This document provides an overview of the authentication system implemented in the Photo Gallery application using Azure Active Directory (Microsoft Entra ID).

## Table of Contents

1. [Architecture](#architecture)
2. [Authentication Flow](#authentication-flow)
3. [Session Management](#session-management)
4. [Protected Routes](#protected-routes)
5. [API Authentication](#api-authentication)
6. [Developer Guide](#developer-guide)
7. [Security Features](#security-features)

---

## Architecture

The authentication system uses the following components:

- **Azure AD (Entra ID)**: Identity provider for user authentication
- **MSAL Node**: Microsoft Authentication Library for server-side auth
- **SvelteKit Hooks**: Server-side middleware for route protection
- **Session Storage**: In-memory session store (can be replaced with Redis/DB)
- **HTTP-only Cookies**: Secure session token storage

### Component Diagram

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │ ──────> │   SvelteKit  │ ──────> │  Azure AD   │
│             │ <────── │    Server    │ <────── │  (Entra ID) │
└─────────────┘         └──────────────┘         └─────────────┘
      │                        │
      │                        │
      ▼                        ▼
┌─────────────┐         ┌──────────────┐
│   Session   │         │    Azure     │
│   Cookie    │         │   Storage    │
└─────────────┘         └──────────────┘
```

---

## Authentication Flow

### 1. Login Flow (Authorization Code Flow)

```
User → /auth/login
  ↓
Click "Sign in with Microsoft"
  ↓
/auth/login/redirect
  ↓
Generate auth URL with MSAL
  ↓
Redirect to Azure AD login page
  ↓
User enters credentials
  ↓
Azure AD redirects to /auth/callback?code=...
  ↓
Exchange code for access token
  ↓
Create session with user info
  ↓
Set session cookie
  ↓
Redirect to / (home)
```

### 2. Session Validation Flow

```
User visits any route
  ↓
hooks.server.ts intercepts request
  ↓
Parse session cookie
  ↓
Validate session in session store
  ↓
Is session valid?
  ├─ YES → Attach user to locals → Continue to route
  └─ NO  → Redirect to /auth/login
```

### 3. Logout Flow

```
User clicks logout
  ↓
/auth/logout
  ↓
Delete session from store
  ↓
Clear session cookie
  ↓
Redirect to /auth/login
```

---

## Session Management

### Session Data Structure

```typescript
interface SessionData {
  userId: string;          // Azure AD user ID
  username: string;        // Display name
  email: string;          // User email
  accessToken: string;    // Azure AD access token
  expiresAt: number;      // Session expiration timestamp
}
```

### Session Storage

**Development**: In-memory Map (default)
```typescript
const sessions = new Map<string, SessionData>();
```

**Production**: Use Redis or Database
```typescript
// Example with Redis
import { createClient } from 'redis';
const redis = createClient();
await redis.set(`session:${sessionId}`, JSON.stringify(sessionData), {
  EX: SESSION_MAX_AGE
});
```

### Session Lifecycle

- **Creation**: When user successfully authenticates via Azure AD
- **Duration**: 7 days (configurable via `SESSION_MAX_AGE`)
- **Renewal**: Not automatic (user must re-authenticate after expiration)
- **Deletion**: On logout or expiration
- **Cleanup**: Expired sessions cleaned up every hour

### Session Cookie Attributes

```typescript
{
  httpOnly: true,      // Not accessible via JavaScript
  secure: true,        // HTTPS only (production)
  sameSite: 'lax',     // CSRF protection
  maxAge: 604800,      // 7 days in seconds
  path: '/',           // Available site-wide
}
```

---

## Protected Routes

### Route Protection via Hooks

All routes are protected by default except public auth routes.

**Public Routes** (No authentication required):
- `/auth/login`
- `/auth/callback`
- `/auth/logout`

**Protected Routes** (Authentication required):
- `/` (home page)
- All other routes

### Implementation

In `src/hooks.server.ts`:

```typescript
const PUBLIC_ROUTES = ['/auth/login', '/auth/callback', '/auth/logout'];

export const handle: Handle = async ({ event, resolve }) => {
  // Parse session and attach user to locals
  const sessionId = parseSessionCookie(event.request.headers.get('cookie'));
  event.locals.user = sessionId ? getSession(sessionId) : null;

  // Redirect to login if not authenticated
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    event.url.pathname.startsWith(route)
  );
  
  if (!event.locals.user && !isPublicRoute) {
    throw redirect(302, '/auth/login');
  }

  return resolve(event);
};
```

### Accessing User Data in Pages

In any `+page.svelte` or `+page.server.ts`:

```typescript
// +layout.server.ts
export const load: LayoutServerLoad = async ({ locals }) => {
  return {
    user: locals.user
  };
};

// +page.svelte
<script lang="ts">
  let { data } = $props();
  // data.user contains: { id, username, email }
</script>

{#if data.user}
  <p>Welcome, {data.user.username}!</p>
{/if}
```

---

## API Authentication

### Protected API Endpoints

All API endpoints check authentication in the request handler.

**Pattern**:
```typescript
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, request }) => {
  // Check authentication
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  // Use authenticated user data
  const userId = locals.user.id;
  const username = locals.user.username;

  // Process request...
  const data = await request.json();
  
  // Return response
  return json({ success: true });
};
```

### Examples

#### Photo Upload (POST /api/photos)
```typescript
export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  const userId = locals.user.id;
  const username = locals.user.username;
  
  const formData = await request.formData();
  const photo = await createPhoto(userId, username, ...);
  
  return json(photo, { status: 201 });
};
```

#### Comment Creation (POST /api/comments)
```typescript
export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  const { photoId, content } = await request.json();
  const comment = await addComment(
    photoId, 
    locals.user.id, 
    locals.user.username, 
    content
  );
  
  return json(comment, { status: 201 });
};
```

#### Authorization Check (DELETE /api/photos/[id])
```typescript
export const DELETE: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  const photo = await getPhotoById(params.id);
  
  // Check ownership
  if (photo.userId !== locals.user.id) {
    throw error(403, 'Forbidden');
  }

  await deletePhoto(params.id);
  return json({ success: true });
};
```

---

## Developer Guide

### Adding Authentication to a New Route

1. **Route is automatically protected** by `hooks.server.ts`
2. **Access user data** via `locals.user` in `+page.server.ts`:

```typescript
// src/routes/profile/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // User is guaranteed to exist (redirected otherwise)
  return {
    user: locals.user
  };
};
```

3. **Use user data in component**:

```svelte
<!-- src/routes/profile/+page.svelte -->
<script lang="ts">
  let { data } = $props();
</script>

<h1>Profile: {data.user.username}</h1>
<p>Email: {data.user.email}</p>
```

### Adding Authentication to a New API Endpoint

1. **Check authentication** at the start of the handler:

```typescript
// src/routes/api/my-endpoint/+server.ts
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, request }) => {
  // Always check authentication first
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  // Use authenticated user ID
  const userId = locals.user.id;
  
  // Your logic here...
  return json({ success: true });
};
```

2. **Check authorization** if needed:

```typescript
export const DELETE: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  const resource = await getResource(params.id);
  
  // Check if user owns the resource
  if (resource.ownerId !== locals.user.id) {
    throw error(403, 'Forbidden');
  }

  // Proceed with deletion...
};
```

### Making a Route Public

If you need a route that doesn't require authentication:

```typescript
// src/hooks.server.ts
const PUBLIC_ROUTES = [
  '/auth/login', 
  '/auth/callback', 
  '/auth/logout',
  '/public',        // Add your public route
  '/api/public',    // Add public API endpoint
];
```

### Testing Authentication

```typescript
// Test if user is authenticated
if (locals.user) {
  console.log('User is authenticated:', locals.user.username);
} else {
  console.log('User is not authenticated');
}

// Test user ID
console.log('User ID:', locals.user?.id);

// Test in browser console
fetch('/api/photos', {
  credentials: 'include' // Include cookies
}).then(r => r.json()).then(console.log);
```

---

## Security Features

### 1. HTTPS-Only in Production

Session cookies are marked `secure: true` in production, ensuring they're only sent over HTTPS.

```typescript
const isSecure = url.protocol === 'https:';
cookies.set('session', sessionId, {
  secure: isSecure,
  // ...
});
```

### 2. HTTP-Only Cookies

Session cookies cannot be accessed via JavaScript, preventing XSS attacks.

```typescript
cookies.set('session', sessionId, {
  httpOnly: true,
  // ...
});
```

### 3. CSRF Protection

`sameSite: 'lax'` protects against cross-site request forgery.

```typescript
cookies.set('session', sessionId, {
  sameSite: 'lax',
  // ...
});
```

### 4. Server-Side Session Storage

Sessions are stored server-side, not in JWT tokens. This allows immediate revocation.

### 5. Session Expiration

Sessions automatically expire after 7 days and are cleaned up hourly.

```typescript
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

setInterval(cleanupExpiredSessions, 60 * 60 * 1000); // Every hour
```

### 6. Authorization Code Flow

Uses OAuth 2.0 Authorization Code Flow with PKCE (recommended for web apps).

### 7. No Credentials in Client Code

All authentication logic runs server-side. Client secrets never exposed to browser.

---

## Configuration

### Environment Variables

```env
# Required for authentication
AZURE_AD_CLIENT_ID=your-client-id
AZURE_AD_CLIENT_SECRET=your-client-secret
AZURE_AD_TENANT_ID=your-tenant-id
AZURE_AD_REDIRECT_URI=http://localhost:5173/auth/callback
```

### Session Configuration

```typescript
// src/lib/server/auth/session.ts
const SESSION_COOKIE_NAME = 'session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Adjust as needed:
// - 1 day: 60 * 60 * 24
// - 30 days: 60 * 60 * 24 * 30
// - Forever: 60 * 60 * 24 * 365 * 10
```

### MSAL Configuration

```typescript
// src/lib/server/auth/config.ts
export const SCOPES = ['user.read'];

// Add more scopes if needed:
// export const SCOPES = ['user.read', 'mail.read', 'calendars.read'];
```

---

## Troubleshooting

### Issue: "Unauthorized" errors on API calls

**Check**:
1. Session cookie is being sent: Check browser DevTools > Network > Cookies
2. Session is valid: Check server logs for session validation
3. Session hasn't expired: Check session expiration timestamp

**Solution**: Re-authenticate by logging out and back in.

### Issue: Infinite redirect loop

**Cause**: Route protection logic error or session not being set.

**Check**:
1. Public routes are correctly defined in `hooks.server.ts`
2. Session cookie is being set after authentication
3. Session validation logic is correct

### Issue: Session not persisting

**Cause**: Cookie not being saved or browser blocking cookies.

**Check**:
1. Browser allows cookies for localhost
2. `sameSite` and `secure` attributes are correct
3. Cookie domain matches request domain

---

## Best Practices

### ✅ DO

- Always check `locals.user` before accessing user data
- Use `locals.user.id` for user identification, never trust client input
- Validate all inputs even after authentication
- Log authentication events for audit trails
- Rotate client secrets regularly
- Use HTTPS in production
- Implement rate limiting on auth endpoints

### ❌ DON'T

- Don't store sensitive data in session cookies
- Don't trust user IDs from request bodies
- Don't expose session IDs or tokens to client
- Don't hardcode credentials
- Don't skip authorization checks
- Don't use HTTP in production

---

## Upgrading from Demo Authentication

If you're migrating from the old demo user switcher:

### Removed Components

- ❌ `UserSwitcher.svelte` (replaced with `UserMenu.svelte`)
- ❌ Cookie-based user switching
- ❌ `$lib/stores/user.ts` (if only used for demo)

### Updated Code

**Before** (Demo):
```typescript
const userId = cookies.get('userId') || '1';
const username = cookies.get('username') || 'alice';
```

**After** (Azure AD):
```typescript
if (!locals.user) {
  throw error(401, 'Unauthorized');
}
const userId = locals.user.id;
const username = locals.user.username;
```

### Migration Steps

1. Set up Azure AD app registration
2. Configure environment variables
3. Remove demo user switching components
4. Update all API endpoints to use `locals.user`
5. Test authentication flow
6. Deploy with production credentials

---

## Additional Resources

- [Azure AD Setup Guide](./AZURE_AD_SETUP.md)
- [MSAL Node Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-node)
- [SvelteKit Hooks Documentation](https://kit.svelte.dev/docs/hooks)
- [OAuth 2.0 Authorization Code Flow](https://oauth.net/2/grant-types/authorization-code/)

---

**Last Updated**: 2025-01-17  
**Version**: 1.0.0