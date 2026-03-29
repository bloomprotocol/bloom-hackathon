/**
 * Wallet connection flow utilities
 */

export interface WalletConnectionHandlers {
  showInitiating: () => void;
  connectWallet: () => void;
  handleClose: () => void;
}

/**
 * Creates a handler for the wallet connection flow after verification
 * This ensures the proper sequence and timing for Privy integration
 * 
 * Flow: showInitiating → wait 100ms → connectWallet → handleClose
 * 
 * @param handlers Object containing the required callbacks
 * @returns Function to initiate the connection flow
 */
export function createWalletConnectionFlow(handlers: WalletConnectionHandlers) {
  return function initiateConnection() {
    // 1. Show "Initiating..." message immediately
    handlers.showInitiating();
    
    // 2. Wait exactly 100ms for Privy to be ready
    // 3. Then connect wallet and close modal
    setTimeout(() => {
      handlers.connectWallet();
      handlers.handleClose();
    }, 100);
  };
}

/**
 * Validates the connection flow sequence
 * @param sequence Array of action names in order
 * @returns Whether the sequence is valid
 */
export function isValidConnectionSequence(sequence: string[]): boolean {
  const expectedSequence = ['showInitiating', 'connectWallet', 'handleClose'];
  
  if (sequence.length !== expectedSequence.length) {
    return false;
  }
  
  return sequence.every((action, index) => action === expectedSequence[index]);
}

/**
 * Calculates if the timing between actions is correct
 * @param timestamps Object with action timestamps
 * @returns Whether the timing is valid
 */
export function isValidConnectionTiming(timestamps: {
  showInitiating: number;
  connectWallet: number;
  handleClose: number;
}): boolean {
  // connectWallet should happen 100ms after showInitiating
  const delay = timestamps.connectWallet - timestamps.showInitiating;
  if (delay < 100 || delay > 105) { // Allow 5ms tolerance for timer precision
    return false;
  }
  
  // handleClose should happen immediately after connectWallet (within 10ms)
  const closeDelay = timestamps.handleClose - timestamps.connectWallet;
  return closeDelay >= 0 && closeDelay <= 10;
}