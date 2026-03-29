// Mock for @solana/wallet-adapter-react
// This is needed because Jest has trouble with ESM modules in this package

module.exports = {
  useWallet: jest.fn(() => ({
    publicKey: null,
    connected: false,
    connecting: false,
    disconnecting: false,
    wallet: null,
    wallets: [],
    select: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    sendTransaction: jest.fn(),
    signTransaction: jest.fn(),
    signAllTransactions: jest.fn(),
    signMessage: jest.fn(),
  })),
  useConnection: jest.fn(() => ({
    connection: null,
  })),
  ConnectionProvider: ({ children }) => children,
  WalletProvider: ({ children }) => children,
};
