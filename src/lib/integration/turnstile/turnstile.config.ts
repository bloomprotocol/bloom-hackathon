// Cloudflare Turnstile Configuration
export const TURNSTILE_CONFIG = {
  // Site key will be public and used in the frontend
  siteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '',
  
  // Widget appearance options
  appearance: {
    theme: 'dark' as const, // 'light' | 'dark' | 'auto'
    size: 'normal' as const, // 'normal' | 'compact'
  },
  
  // Retry configuration
  retry: {
    maxAttempts: 3,
    retryDelay: 1000, // milliseconds
  },
  
  // Error messages
  errorMessages: {
    verification_failed: 'Verification failed. Please try again.',
    network_error: 'Network error. Please check your connection.',
    expired: 'Verification expired. Please try again.',
    invalid_sitekey: 'Invalid site configuration. Please contact support.',
  },
};

// Helper to check if Turnstile is properly configured
export const isTurnstileConfigured = (): boolean => {
  return Boolean(TURNSTILE_CONFIG.siteKey);
}; 