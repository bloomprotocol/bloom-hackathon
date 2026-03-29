export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  BUILDER = 'BUILDER',
}

export interface AuthUser {
  sub: string;  // Changed from uid: number to sub: string
  walletAddress: string;
  role: UserRole;
  name?: string;  // Added name field
  hasPreflightAccess?: boolean;  // Added hasPreflightAccess field
  // email removed from JWT payload
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

// ============================================
// Network Types
// ============================================

export type NetworkType = 'solana' | 'evm';

// ============================================
// Auth Method Interface
// ============================================

/**
 * Common interface for all authentication methods.
 * Implemented by wallet hooks and Privy auth.
 */
export interface AuthMethod {
  getCredentials(): Promise<{
    walletAddress: string;
    email?: string;
    signature?: string;
    message?: string;
    privyAccessToken?: string; // Only used by Privy auth
  }>;
  cleanup?(): Promise<void>;
}

// ============================================
// Wallet Hook State Types
// ============================================

/**
 * Base state interface for wallet connection hooks.
 * Desktop hooks are stateless (only return functions).
 * Mobile hooks track connection state for async flows.
 */
export interface WalletHookState {
  isReady: boolean;
  publicKey: string | null;
  lastSignature: string | null;
  lastMessage: string | null;
  isConnecting: boolean;
  isSigning: boolean;
  error: string | null;
}

/**
 * OKX wallet hook state with network selection.
 */
export interface OKXWalletHookState extends WalletHookState {
  connectedNetwork: NetworkType | null;
}

/**
 * WalletConnect hook state with network selection.
 */
export interface WalletConnectHookState extends WalletHookState {
  selectedNetwork: NetworkType | null;
}

/**
 * Phantom wallet hook state (uses base state).
 */
export type PhantomHookState = WalletHookState;

/**
 * MetaMask wallet hook state (uses base state).
 */
export type MetaMaskHookState = WalletHookState;