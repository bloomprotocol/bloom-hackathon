// Mock for @aptos-connect/wallet-adapter-plugin
// This prevents the "MODULE_NOT_FOUND" error from OKX UI
// when we're only using Solana functionality

module.exports = {
  // Minimal mock to satisfy the dynamic import
  AptosWalletAdapterPlugin: class AptosWalletAdapterPlugin {
    constructor() {
      console.warn('Aptos adapter mock loaded - not using Aptos functionality');
    }
  }
};