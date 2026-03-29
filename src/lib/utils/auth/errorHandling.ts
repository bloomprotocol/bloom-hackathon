/**
 * Error Handling Utilities
 *
 * Provides unified error detection for wallet connection flows.
 * Handles various error formats from different wallet providers.
 */

/**
 * Check if an error represents a user rejection/cancellation.
 *
 * Different wallets report user rejections in different ways:
 * - EIP-1193 standard: code 4001
 * - Phantom: "User rejected" / "User cancelled"
 * - OKX: "rejected" / "cancelled" / "User refused"
 * - MetaMask: code 4001 / "User rejected"
 * - WalletConnect: "User rejected" / code 4001
 *
 * @param error - The error object from wallet interaction
 * @returns true if the error indicates user cancelled the operation
 */
export function isUserRejectionError(error: unknown): boolean {
  if (!error) return false;

  const err = error as { code?: number | string; message?: string };
  const code = err.code;
  const message = err.message?.toLowerCase() || '';

  // Check error code first (EIP-1193 standard)
  if (code === 4001 || code === '4001') {
    return true;
  }

  // Check message patterns from various wallets
  return (
    message.includes('user rejected') ||
    message.includes('user cancelled') ||
    message.includes('user denied') ||
    message.includes('user refused') ||
    message.includes('rejected the request') ||
    message.includes('cancelled by user') ||
    message.includes('operation cancelled')
  );
}

/**
 * Get a user-friendly error message for wallet errors.
 *
 * @param error - The error object from wallet interaction
 * @param defaultMessage - Default message if error cannot be parsed
 * @returns User-friendly error message
 */
export function getWalletErrorMessage(
  error: unknown,
  defaultMessage: string = 'An error occurred'
): string {
  if (isUserRejectionError(error)) {
    return 'Operation cancelled by user';
  }

  const err = error as { message?: string };
  return err.message || defaultMessage;
}
