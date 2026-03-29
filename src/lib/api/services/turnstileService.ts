import { apiPost } from '../apiConfig';
import { logger } from '@/lib/utils/logger';

/**
 * Verify Turnstile token with backend
 * @param token - The Turnstile token from Cloudflare widget
 * @returns Verification result
 */
export async function verifyTurnstileToken(token: string): Promise<{
  success: boolean;
  verified: boolean;
  error?: string;
}> {
  try {
    // Dev mode: Skip backend verification for localhost
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      logger.debug('[TurnstileService] Dev mode: Skipping backend verification');
      return {
        success: true,
        verified: true,
      };
    }

    logger.debug('[TurnstileService] Verifying token with backend');

    const response = await apiPost<{
      success: boolean;
      data: {
        verified: boolean;
        error?: string;
      };
    }>('/turnstile/verify', {
      token,
    });

    if (response.success && response.data) {
      logger.debug('[TurnstileService] Verification response', { 
        verified: response.data.verified 
      });
      
      return {
        success: true,
        verified: response.data.verified,
        error: response.data.error,
      };
    }

    logger.warn('[TurnstileService] Verification failed', { response });
    return {
      success: false,
      verified: false,
      error: 'Verification failed',
    };
  } catch (error: any) {
    logger.error('[TurnstileService] Error verifying token', { error });
    return {
      success: false,
      verified: false,
      error: error.message || 'Network error',
    };
  }
}

export default {
  verifyToken: verifyTurnstileToken,
};