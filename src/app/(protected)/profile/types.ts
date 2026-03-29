/**
 * Profile Page Types
 * Centralized type definitions for profile pages
 */

// ============================================
// Constants
// ============================================

export const PROFILE_CONSTANTS = {
  /** Feedback display duration in ms */
  FEEDBACK_DURATION: 1500,
  /** Animation duration for copy shake effect in ms */
  COPY_ANIMATION_DURATION: 600,
  /** Desktop breakpoint in px */
  DESKTOP_BREAKPOINT: 1280,
  /** Max file size for avatar upload (2MB) */
  MAX_AVATAR_FILE_SIZE: 2 * 1024 * 1024,
  /** Allowed image types for avatar */
  ALLOWED_AVATAR_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as readonly string[],
  /** X402 base URL */
  X402_BASE_URL: 'https://x402.bloomprotocol.ai',
} as const;

// ============================================
// API Response Types
// ============================================

/** Generic API response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/** X402 Profile data */
export interface X402ProfileData {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  externalLinks?: ExternalLink[];
  isPublicProfileEnabled?: boolean;
}

/** External link type */
export interface ExternalLink {
  type: string;
  url: string;
}

/** X402 wallet data */
export interface X402WalletData {
  network: 'BSC' | 'Solana' | 'Base';
  walletAddress: string;
}

/** X402 wallets response */
export interface X402WalletsResponse {
  data: X402WalletData[];
}

/** File upload response */
export interface FileUploadResponse {
  url: string;
}

// ============================================
// Component Types
// ============================================

/** Wallet info for display */
export interface WalletInfo {
  type: 'Solana' | 'BSC' | 'Base';
  address: string;
  fullAddress: string;
  label: 'Primary Wallet' | 'X402 Wallet';
}

/** Network type */
export type NetworkType = 'BSC' | 'Solana' | 'Base';

/** Login wallet type */
export type LoginWalletType = 'EVM' | 'Solana' | null;
