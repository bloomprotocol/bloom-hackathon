/**
 * Sign Message Utilities
 *
 * Provides functions for building SIWE (Sign-In With Ethereum) and
 * SIWS (Sign-In With Solana) style authentication messages.
 *
 * These messages follow the standard format expected by the backend
 * for wallet signature verification.
 */

/**
 * Generate a cryptographically secure nonce for sign messages.
 * Uses Web Crypto API when available, falls back to Math.random for SSR.
 */
export function generateSecureNonce(): string {
  if (typeof window !== 'undefined' && window.crypto) {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback for SSR
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

/**
 * Get common metadata for sign messages.
 * Shared between SIWE and SIWS message builders.
 */
function getMessageMetadata() {
  return {
    domain: typeof window !== 'undefined' ? window.location.host : 'bloomprotocol.ai',
    uri: typeof window !== 'undefined' ? window.location.origin : 'https://bloomprotocol.ai',
    statement: 'Sign this message to authenticate with Bloom Protocol',
    version: '1',
    nonce: generateSecureNonce(),
    issuedAt: new Date().toISOString(),
  };
}

/**
 * Build SIWE-style (Sign-In With Ethereum) message for EVM wallets.
 *
 * @param address - The EVM wallet address (0x...)
 * @param chainId - The chain ID (default: '1' for Ethereum mainnet)
 * @param chainName - Human-readable chain name (default: 'Ethereum')
 * @returns Formatted SIWE message string
 */
export function buildSIWEMessage(
  address: string,
  chainId: string = '1',
  chainName: string = 'Ethereum'
): string {
  const { domain, uri, statement, version, nonce, issuedAt } = getMessageMetadata();

  return `${domain} wants you to sign in with your ${chainName} account:\n${address}\n\n${statement}\n\nURI: ${uri}\nVersion: ${version}\nChain ID: ${chainId}\nNonce: ${nonce}\nIssued At: ${issuedAt}`;
}

/**
 * Build SIWS-style (Sign-In With Solana) message for Solana wallets.
 *
 * @param publicKey - The Solana wallet public key (base58 encoded)
 * @returns Formatted SIWS message string
 */
export function buildSIWSMessage(publicKey: string): string {
  const { domain, uri, statement, version, nonce, issuedAt } = getMessageMetadata();
  const network = 'solana-mainnet';

  return `${domain} wants you to sign in with your Solana account:\n${publicKey}\n\n${statement}\n\nURI: ${uri}\nVersion: ${version}\nNetwork: ${network}\nNonce: ${nonce}\nIssued At: ${issuedAt}`;
}
