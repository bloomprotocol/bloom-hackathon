/**
 * PKCE (Proof Key for Code Exchange) Helper Functions
 *
 * Used for OAuth 2.0 authorization code flow with PKCE
 * to prevent authorization code interception attacks.
 */

/**
 * Base64 URL encoding (RFC 4648)
 * Converts buffer to base64 and makes it URL-safe
 *
 * @param buffer - Uint8Array to encode
 * @returns Base64 URL-encoded string
 */
function base64UrlEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generate random code verifier for PKCE
 *
 * Creates a cryptographically random string that will be used
 * to generate the code challenge. This must be kept secret
 * and sent to the server during token exchange.
 *
 * @returns Base64 URL-encoded random string (43-128 characters)
 */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32); // 32 bytes = 256 bits
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

/**
 * Generate code challenge from verifier using SHA-256
 *
 * Creates a SHA-256 hash of the code verifier and encodes it
 * to base64 URL format. This is sent to the authorization server
 * during the initial OAuth request.
 *
 * @param verifier - Code verifier string
 * @returns Promise<Base64 URL-encoded SHA-256 hash>
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(hash));
}

/**
 * Generate random string for state parameter (CSRF protection)
 *
 * Creates a cryptographically random string to prevent
 * cross-site request forgery attacks during OAuth flow.
 *
 * @param length - Length of random string (default: 32)
 * @returns Random alphanumeric string
 */
export function generateRandomString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => chars[byte % chars.length]).join('');
}
