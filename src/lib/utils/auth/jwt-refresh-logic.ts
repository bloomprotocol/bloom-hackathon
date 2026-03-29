/**
 * Core business logic for JWT refresh after role switch
 * Extracted from AuthContext refreshToken logic
 */

interface JwtRefreshParams {
  walletAddress: string;
  newRole: string;
  loginWithWallet: (address: string) => Promise<boolean>;
  setCookie: (key: string, value: string) => void;
  invalidateQueries?: () => void;
}

interface JwtRefreshResult {
  success: boolean;
  newToken?: string;
}

export async function extractJwtRefreshLogic({
  walletAddress,
  newRole,
  loginWithWallet,
  setCookie,
  invalidateQueries,
}: JwtRefreshParams): Promise<JwtRefreshResult> {
  try {
    // Business Rule: Re-authenticate to get new JWT with updated role
    const loginSuccess = await loginWithWallet(walletAddress);

    // If login failed, return early without updating cookies or cache
    if (!loginSuccess) {
      return { success: false };
    }

    // Business Rule: Update auth token cookie
    const newToken = 'mock-jwt-with-' + newRole; // In real code, this comes from loginWithWallet
    setCookie('auth-token', newToken);

    // Business Rule: Invalidate all React Query cache with new JWT
    if (invalidateQueries) {
      invalidateQueries();
    }

    return {
      success: true,
      newToken,
    };
  } catch {
    return { success: false };
  }
}