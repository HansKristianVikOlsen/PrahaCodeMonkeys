import { serialize, parse } from 'cookie';
import type { AccountInfo } from '@azure/msal-node';

const SESSION_COOKIE_NAME = 'session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface SessionData {
  userId: string;
  username: string;
  email: string;
  accessToken: string;
  expiresAt: number;
}

// In-memory session store (for development)
// In production, use Redis, database, or encrypted cookies
const sessions = new Map<string, SessionData>();

/**
 * Create a new session for a user
 */
export function createSession(accountInfo: AccountInfo, accessToken: string): string {
  const sessionId = generateSessionId();
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;

  const sessionData: SessionData = {
    userId: accountInfo.localAccountId,
    username: accountInfo.name || accountInfo.username || 'Unknown',
    email: accountInfo.username || '',
    accessToken,
    expiresAt,
  };

  sessions.set(sessionId, sessionData);
  return sessionId;
}

/**
 * Get session data by session ID
 */
export function getSession(sessionId: string): SessionData | null {
  const session = sessions.get(sessionId);

  if (!session) {
    return null;
  }

  // Check if session has expired
  if (session.expiresAt < Date.now()) {
    sessions.delete(sessionId);
    return null;
  }

  return session;
}

/**
 * Delete a session
 */
export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId);
}

/**
 * Generate a random session ID
 */
function generateSessionId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Date.now().toString(36)
  );
}

/**
 * Create a session cookie
 */
export function createSessionCookie(sessionId: string, secure = false): string {
  return serialize(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

/**
 * Create a cookie to delete the session
 */
export function deleteSessionCookie(secure = false): string {
  return serialize(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

/**
 * Parse session ID from cookie header
 */
export function parseSessionCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) {
    return null;
  }

  const cookies = parse(cookieHeader);
  return cookies[SESSION_COOKIE_NAME] || null;
}

/**
 * Clean up expired sessions (call periodically)
 */
export function cleanupExpiredSessions(): void {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (session.expiresAt < now) {
      sessions.delete(sessionId);
    }
  }
}

// Clean up expired sessions every hour
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);
