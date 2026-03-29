/**
 * Auth Utilities
 *
 * Shared utilities for wallet authentication flows.
 * Used by desktop and mobile wallet hooks.
 */

// Sign message builders
export {
  generateSecureNonce,
  buildSIWEMessage,
  buildSIWSMessage,
} from './signMessage';

// Error handling
export {
  isUserRejectionError,
  getWalletErrorMessage,
} from './errorHandling';

// Storage helpers
export {
  getSessionItem,
  setSessionItem,
  removeSessionItem,
  getAuthCookie,
  setAuthCookie,
  deleteAuthCookie,
  WALLET_STORAGE_KEYS,
} from './storage';

// JWT utilities
export {
  parseJwtPayload,
  getTokenExpiry,
  getTokenRemainingMinutes,
  isTokenExpired,
} from './jwt-utils';
