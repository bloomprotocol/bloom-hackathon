/**
 * Storage Utilities
 *
 * Provides helpers for session storage and cookie management
 * used by wallet connection hooks.
 *
 * Note: Phantom uses cookies instead of sessionStorage because
 * deep links may open in a new tab, and cookies enable cross-tab
 * state sharing.
 */

// ============================================
// Session Storage Helpers
// ============================================

/**
 * Get an item from sessionStorage.
 * Safe to call during SSR (returns null).
 */
export function getSessionItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(key);
}

/**
 * Set an item in sessionStorage.
 * Safe to call during SSR (no-op).
 */
export function setSessionItem(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(key, value);
}

/**
 * Remove an item from sessionStorage.
 * Safe to call during SSR (no-op).
 */
export function removeSessionItem(key: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(key);
}

// ============================================
// Cookie Helpers (for Phantom cross-tab support)
// ============================================

/**
 * Get a cookie value by name.
 * Used by Phantom for cross-tab state sharing.
 */
export function getAuthCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

/**
 * Set a cookie with optional max-age.
 * Used by Phantom for cross-tab state sharing.
 *
 * @param name - Cookie name
 * @param value - Cookie value
 * @param maxAge - Max age in seconds (default: 3600 = 1 hour)
 */
export function setAuthCookie(name: string, value: string, maxAge: number = 3600): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}`;
}

/**
 * Delete a cookie by name.
 */
export function deleteAuthCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0`;
}

// ============================================
// Wallet-specific Storage Keys
// ============================================

/**
 * Storage keys used by wallet hooks.
 * Centralized here to avoid magic strings.
 */
export const WALLET_STORAGE_KEYS = {
  // Phantom (cookies)
  PHANTOM_SESSION_KEYPAIR: 'phantom_session_keypair',
  PHANTOM_PUBLIC_KEY: 'phantom_public_key',
  PHANTOM_WALLET_PUBLIC_KEY: 'phantom_wallet_public_key',
  PHANTOM_SESSION_TOKEN: 'phantom_session_token',
  PHANTOM_SIGN_MESSAGE: 'phantom_sign_message',

  // OKX (sessionStorage)
  OKX_WALLET_PUBLIC_KEY: 'okx_wallet_public_key',
  OKX_SIGN_MESSAGE: 'okx_sign_message',
  OKX_SELECTED_NETWORK: 'okx_selected_network',

  // MetaMask (sessionStorage)
  METAMASK_ADDRESS: 'metamask_address',
  METAMASK_SIGNATURE: 'metamask_signature',
  METAMASK_MESSAGE: 'metamask_message',

  // WalletConnect (sessionStorage)
  WC_SELECTED_NETWORK: 'wc_selected_network',
  WC_WALLET_ADDRESS: 'wc_wallet_address',
  WC_SIGNATURE: 'wc_signature',
  WC_MESSAGE: 'wc_message',

  // Common
  MOBILE_WALLET_CONNECTING: 'mobile_wallet_connecting',
  SELECTED_NETWORK: 'selected_network',
} as const;
