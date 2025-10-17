/**
 * PKCE (Proof Key for Code Exchange) utilities for Azure AD Authorization Code Flow.
 *
 * Azure AD requires PKCE for certain cross-origin authorization code redemption scenarios
 * (AADSTS9002325). This module generates and stores code verifiers and corresponding
 * code challenges so they can be supplied when requesting the authorization URL and then
 * later redeemed when exchanging the authorization code for tokens.
 *
 * Usage pattern:
 *
 *   import { createPkcePair, getVerifier, deleteVerifier } from '$lib/server/auth/pkce';
 *
 *   // 1. Before redirecting to Azure AD:
 *   const { challenge } = createPkcePair(sessionId); // sessionId or another correlation key
 *   const authUrl = await msalClient.getAuthCodeUrl({
 *     scopes: SCOPES,
 *     redirectUri: REDIRECT_URI,
 *     codeChallenge: challenge,
 *     codeChallengeMethod: 'S256'
 *   });
 *
 *   // 2. On callback (token redemption):
 *   const verifier = getVerifier(sessionId);
 *   await msalClient.acquireTokenByCode({
 *     code,
 *     scopes: SCOPES,
 *     redirectUri: REDIRECT_URI,
 *     codeVerifier: verifier
 *   });
 *   deleteVerifier(sessionId);
 *
 * Security notes:
 * - The code verifier should never be exposed to the browser except indirectly via
 *   generation on a secure channel tied to a session identifier.
 * - This implementation uses an in-memory Map; for production deployments under
 *   load-balanced or serverless architectures, replace with Redis or another
 *   distributed store keyed by a secure session identifier.
 */

import { randomBytes, createHash } from 'crypto';

/**
 * Represents one PKCE entry.
 */
interface PkceEntry {
  verifier: string;
  challenge: string;
  /** Unix epoch millis when this entry expires */
  expiresAt: number;
}

/**
 * In-memory store for PKCE verifiers.
 * Key is a correlation value (e.g., sessionId, CSRF token, or a generated nonce).
 */
const pkceStore = new Map<string, PkceEntry>();

/**
 * Lifetime (in seconds) for a PKCE verifier before automatic cleanup
 * Azure AD authorization codes typically expire within minutes; we use a small window.
 */
const PKCE_ENTRY_TTL_SECONDS = 5 * 60; // 5 minutes

/**
 * Minimum and maximum allowed verifier lengths per RFC 7636.
 */
const PKCE_VERIFIER_MIN_LENGTH = 43;
const PKCE_VERIFIER_MAX_LENGTH = 128;

/**
 * Generate a cryptographically secure PKCE code verifier.
 * Length defaults near the upper bound for maximum entropy.
 */
export function generateCodeVerifier(length = 128): string {
  if (length < PKCE_VERIFIER_MIN_LENGTH || length > PKCE_VERIFIER_MAX_LENGTH) {
    throw new Error(
      `PKCE verifier length must be between ${PKCE_VERIFIER_MIN_LENGTH} and ${PKCE_VERIFIER_MAX_LENGTH}`
    );
  }

  // Generate random bytes then base64url encode and strip padding until desired length.
  // Overshoot and slice ensures we hit the exact requested length.
  const bytes = randomBytes(length * 2);
  let verifier = base64UrlEncode(bytes).replace(/[^a-zA-Z0-9._~-]/g, '');
  if (verifier.length < length) {
    // Regenerate if we trimmed too much (rare)
    return generateCodeVerifier(length);
  }
  return verifier.slice(0, length);
}

/**
 * Generate PKCE code challenge from a verifier (S256 method).
 */
export function generateCodeChallenge(verifier: string): string {
  const hash = createHash('sha256').update(verifier).digest();
  return base64UrlEncode(hash);
}

/**
 * Base64 URL encode (RFC 4648) without padding.
 */
function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

/**
 * Create and store a PKCE pair (verifier + challenge) for a given key.
 * If an entry already exists for the key, it is replaced.
 */
export function createPkcePair(key: string): { verifier: string; challenge: string } {
  if (!key) {
    throw new Error('PKCE key must be a non-empty string');
  }

  const verifier = generateCodeVerifier();
  const challenge = generateCodeChallenge(verifier);
  const expiresAt = Date.now() + PKCE_ENTRY_TTL_SECONDS * 1000;

  pkceStore.set(key, { verifier, challenge, expiresAt });
  return { verifier, challenge };
}

/**
 * Retrieve the stored verifier for a given key.
 * Returns null if not found or expired.
 */
export function getVerifier(key: string): string | null {
  const entry = pkceStore.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    pkceStore.delete(key);
    return null;
  }
  return entry.verifier;
}

/**
 * Retrieve the stored challenge for a given key (useful for diagnostics).
 * Returns null if not found or expired.
 */
export function getChallenge(key: string): string | null {
  const entry = pkceStore.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    pkceStore.delete(key);
    return null;
  }
  return entry.challenge;
}

/**
 * Delete a PKCE entry after successful token redemption.
 */
export function deletePkcePair(key: string): void {
  pkceStore.delete(key);
}

/**
 * Internal cleanup of expired entries. Called periodically.
 */
function cleanupExpired(): void {
  const now = Date.now();
  for (const [key, entry] of pkceStore.entries()) {
    if (entry.expiresAt < now) {
      pkceStore.delete(key);
    }
  }
}

/**
 * For diagnostics: returns count of active (non-expired) PKCE entries.
 */
export function pkceActiveCount(): number {
  cleanupExpired();
  return pkceStore.size;
}

// Schedule cleanup every minute.
setInterval(cleanupExpired, 60 * 1000).unref();

/**
 * Helper that ensures a PKCE pair exists for a key and returns the challenge.
 * If absent or expired, it creates a fresh pair.
 */
export function ensurePkceChallenge(key: string): { challenge: string } {
  const existing = getChallenge(key);
  if (existing) {
    return { challenge: existing };
  }
  const { challenge } = createPkcePair(key);
  return { challenge };
}

/**
 * Debug dump (do not use in production logging for secrets).
 * Shows keys and expiry only (NOT the verifier).
 */
export function debugPkceEntries(): Array<{ key: string; expiresInMs: number }> {
  const now = Date.now();
  return Array.from(pkceStore.entries()).map(([key, entry]) => ({
    key,
    expiresInMs: Math.max(0, entry.expiresAt - now)
  }));
}
