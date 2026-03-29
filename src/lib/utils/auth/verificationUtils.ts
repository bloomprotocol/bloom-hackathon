/**
 * Verification related utility functions
 */

export interface VerificationHandlers {
  onSuccess: () => void;
  onClose: () => void;
}

/**
 * Handles verification success with proper timing
 * @param handlers Object containing onSuccess and onClose callbacks
 * @returns Function to call when verification succeeds
 */
export function createVerificationSuccessHandler(handlers: VerificationHandlers) {
  return function handleVerificationSuccess() {
    // Show success state immediately
    // Then wait exactly 100ms before calling wallet connection
    setTimeout(() => {
      handlers.onSuccess();
      handlers.onClose();
    }, 100);
  };
}

/**
 * Validates the timing delay for verification success
 * @param delay The delay in milliseconds
 * @returns Whether the delay is valid for Privy initialization
 */
export function isValidVerificationDelay(delay: number): boolean {
  // The delay must be exactly 100ms for Privy to work properly
  return delay === 100;
}