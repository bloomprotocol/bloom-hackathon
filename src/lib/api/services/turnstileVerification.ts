import { logger } from '@/lib/utils/logger';

// Turnstile verification endpoint
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

/**
 * Verifies a Cloudflare Turnstile token on the server side
 * @param token - The Turnstile token from the client
 * @param secretKey - Your Turnstile secret key (keep this secure!)
 * @param remoteIp - Optional IP address of the user
 * @returns Verification result
 */
export async function verifyTurnstileToken(
  token: string,
  secretKey: string,
  remoteIp?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!token) {
      return { success: false, error: 'No token provided' };
    }

    if (!secretKey) {
      logger.error('[Turnstile] Secret key not configured');
      return { success: false, error: 'Server configuration error' };
    }

    // Prepare the verification request
    const formData = new URLSearchParams({
      secret: secretKey,
      response: token,
      ...(remoteIp && { remoteip: remoteIp }),
    });

    // Send verification request to Cloudflare
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      logger.error('[Turnstile] Verification API error', { 
        status: response.status,
        statusText: response.statusText 
      });
      return { success: false, error: 'Verification service error' };
    }

    const data: TurnstileVerifyResponse = await response.json();

    if (data.success) {
      return { success: true };
    } else {
      logger.warn('[Turnstile] Token verification failed', { 
        errorCodes: data['error-codes'] 
      });
      
      // Map error codes to user-friendly messages
      const errorMessage = mapTurnstileError(data['error-codes']);
      return { success: false, error: errorMessage };
    }
  } catch (error) {
    logger.error('[Turnstile] Verification error', { error });
    return { success: false, error: 'Verification failed' };
  }
}

/**
 * Maps Turnstile error codes to user-friendly messages
 */
function mapTurnstileError(errorCodes?: string[]): string {
  if (!errorCodes || errorCodes.length === 0) {
    return 'Verification failed';
  }

  const errorMap: Record<string, string> = {
    'missing-input-secret': 'Server configuration error',
    'invalid-input-secret': 'Server configuration error',
    'missing-input-response': 'No verification token provided',
    'invalid-input-response': 'Invalid verification token',
    'bad-request': 'Invalid request',
    'timeout-or-duplicate': 'Verification expired or already used',
    'internal-error': 'Verification service error',
  };

  // Return the first recognized error
  for (const code of errorCodes) {
    if (errorMap[code]) {
      return errorMap[code];
    }
  }

  return 'Verification failed';
}

/**
 * Types for Express-style middleware
 */
interface TurnstileRequestBody {
  turnstile_token?: string;
  [key: string]: unknown;
}

interface TurnstileQuery {
  turnstile_token?: string;
  [key: string]: unknown;
}

interface TurnstileRequest {
  body?: TurnstileRequestBody;
  headers: { [key: string]: string | string[] | undefined };
  query?: TurnstileQuery;
  connection?: { remoteAddress?: string };
  socket?: { remoteAddress?: string };
}

interface TurnstileResponse {
  status: (code: number) => TurnstileResponse;
  json: (data: { success: boolean; error?: string }) => void;
}

type NextFunction = () => void;

/**
 * Express/Next.js middleware for Turnstile verification
 * Usage: app.use('/api/protected-route', turnstileMiddleware);
 */
export function turnstileMiddleware(secretKey: string) {
  return async (req: TurnstileRequest, res: TurnstileResponse, next: NextFunction) => {
    // Skip verification if Turnstile is not configured
    if (!secretKey) {
      logger.warn('[Turnstile] Middleware skipped - no secret key configured');
      return next();
    }

    // Extract token from request body or headers
    const tokenFromHeader = req.headers['x-turnstile-token'];
    const token = req.body?.turnstile_token || 
                  (typeof tokenFromHeader === 'string' ? tokenFromHeader : undefined) ||
                  req.query?.turnstile_token;

    if (!token) {
      logger.warn('[Turnstile] No token provided in request');
      return res.status(400).json({
        success: false,
        error: 'Verification required',
      });
    }

    // Get user IP (consider proxy headers)
    const xForwardedFor = req.headers['x-forwarded-for'];
    const remoteIp = (typeof xForwardedFor === 'string' ? xForwardedFor.split(',')[0] : undefined) || 
                     req.connection?.remoteAddress ||
                     req.socket?.remoteAddress;

    // Verify the token
    const result = await verifyTurnstileToken(token, secretKey, remoteIp);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Verification failed',
      });
    }

    // Token is valid, continue to the next middleware
    next();
  };
}

/**
 * Example usage in your API routes:
 * 
 * // In your environment variables:
 * // TURNSTILE_SECRET_KEY=your-secret-key-here
 * 
 * // In your API route:
 * import { verifyTurnstileToken } from '@/lib/api/middleware/turnstileVerification';
 * 
 * export async function POST(request: Request) {
 *   const body = await request.json();
 *   const { turnstile_token, email } = body;
 *   
 *   // Verify Turnstile token
 *   const turnstileResult = await verifyTurnstileToken(
 *     turnstile_token,
 *     process.env.TURNSTILE_SECRET_KEY!
 *   );
 *   
 *   if (!turnstileResult.success) {
 *     return Response.json(
 *       { success: false, error: turnstileResult.error },
 *       { status: 400 }
 *     );
 *   }
 *   
 *   // Continue with your logic...
 * }
 */ 