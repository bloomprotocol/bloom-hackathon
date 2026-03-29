import { useState, useCallback, useEffect } from 'react';
import type { AuthMethod } from '@/lib/types/auth';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import {
  buildSIWSMessage,
  isUserRejectionError,
  getAuthCookie,
  setAuthCookie,
  deleteAuthCookie,
  removeSessionItem,
  WALLET_STORAGE_KEYS,
} from '@/lib/utils/auth';
import { COOKIE_KEYS } from '@/lib/utils/storage/cookieService';

export const usePhantomApp = (): AuthMethod & {
  isReady: boolean;
  connect: () => void;
  signMessage: (message: string) => void;
  disconnect: () => void;
  publicKey: string | null;
  isConnecting: boolean;
  isSigning: boolean;
  lastSignature: string | null;
  lastMessage: string | null;
  error: string | null;
} => {
  const [isReady] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [lastSignature, setLastSignature] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionKeypair, setSessionKeypair] = useState<any>(null);

  // Initialize on mount - EXACTLY like wallet-phantom page
  useEffect(() => {

    // Check if we just disconnected
    const isDisconnecting = sessionStorage.getItem('phantom_disconnecting');
    if (isDisconnecting) {
      // Don't process any Phantom returns while disconnecting
      return;
    }

    // Generate or restore session keypair from cookies
    const stored = getAuthCookie(WALLET_STORAGE_KEYS.PHANTOM_SESSION_KEYPAIR);
    let currentKeypair;

    if (stored) {
      try {
        const parsed = JSON.parse(decodeURIComponent(stored));
        const keypair = nacl.box.keyPair.fromSecretKey(bs58.decode(parsed.secretKey));
        currentKeypair = { ...parsed, keypair };
        setSessionKeypair(currentKeypair);
      } catch (e) {
        currentKeypair = null;
      }
    }

    // Check if we're returning from Phantom BEFORE creating a new keypair!
    const urlParams = new URLSearchParams(window.location.search);
    const isPhantomReturn = urlParams.has('phantom_encryption_public_key');

    if (!currentKeypair && !isPhantomReturn) {
      // Only create new keypair if we're NOT returning from Phantom
      const keypair = nacl.box.keyPair();
      currentKeypair = {
        publicKey: bs58.encode(keypair.publicKey),
        secretKey: bs58.encode(keypair.secretKey),
        keypair: keypair
      };
      setAuthCookie(
        WALLET_STORAGE_KEYS.PHANTOM_SESSION_KEYPAIR,
        encodeURIComponent(JSON.stringify({
          publicKey: currentKeypair.publicKey,
          secretKey: currentKeypair.secretKey
        }))
      );
      setSessionKeypair(currentKeypair);
    } else if (!currentKeypair && isPhantomReturn) {
      // We're returning from Phantom but don't have a keypair - this is bad!
      setError('Session keypair lost - please try again');
      return;
    }

    // Check if we're returning from disconnect
    if (urlParams.get('phantom_disconnect') === 'true') {
      // Clear the URL params
      window.history.replaceState({}, document.title, window.location.pathname);

      // Clear all Phantom-related data (sessionStorage)
      removeSessionItem('phantom_connecting');
      removeSessionItem('phantom_dapp_public_key');
      removeSessionItem('phantom_signing');
      removeSessionItem('phantom_disconnecting');
      removeSessionItem(WALLET_STORAGE_KEYS.MOBILE_WALLET_CONNECTING);

      // Clear Phantom cookies
      deleteAuthCookie(WALLET_STORAGE_KEYS.PHANTOM_SESSION_KEYPAIR);
      deleteAuthCookie(WALLET_STORAGE_KEYS.PHANTOM_PUBLIC_KEY);
      deleteAuthCookie(WALLET_STORAGE_KEYS.PHANTOM_WALLET_PUBLIC_KEY);
      deleteAuthCookie(WALLET_STORAGE_KEYS.PHANTOM_SESSION_TOKEN);
      deleteAuthCookie(WALLET_STORAGE_KEYS.PHANTOM_SIGN_MESSAGE);

      // Clear Bloom Protocol auth cookies
      deleteAuthCookie(COOKIE_KEYS.AUTH_TOKEN);
      deleteAuthCookie(COOKIE_KEYS.WALLET_ADDRESS);
      deleteAuthCookie('user-id'); // Legacy key, 待移除
      deleteAuthCookie(COOKIE_KEYS.USER_ROLES_LEGACY);
      deleteAuthCookie(COOKIE_KEYS.TIA);

      // Reset state
      setPublicKey(null);
      setLastSignature(null);
      setError(null);
      setSessionKeypair(null);

      // Force reload to reset all states
      window.location.reload();

      return;
    }

    // Handle Phantom response (urlParams already declared above)
    const phantomEncryptionPublicKey = urlParams.get('phantom_encryption_public_key');
    const data = urlParams.get('data');
    const nonce = urlParams.get('nonce');
    const errorCode = urlParams.get('errorCode');
    const errorMessage = urlParams.get('errorMessage');

    // Check for sign message response (encrypted)
    const signNonce = urlParams.get('nonce');
    const signData = urlParams.get('data');

    if (signNonce && signData && !phantomEncryptionPublicKey) {

      try {
        const dappKeyPair = currentKeypair.keypair;
        let phantomPublicKeyStr = getAuthCookie(WALLET_STORAGE_KEYS.PHANTOM_PUBLIC_KEY) || sessionStorage.getItem('phantom_public_key');

        if (!phantomPublicKeyStr) {
          setError('Missing Phantom public key');
          return;
        }

        const phantomPublicKey = bs58.decode(phantomPublicKeyStr);
        const sharedSecret = nacl.box.before(phantomPublicKey, dappKeyPair.secretKey);
        const encryptedData = bs58.decode(signData);
        const nonceBytes = bs58.decode(signNonce);
        const decryptedData = nacl.box.open.after(encryptedData, nonceBytes, sharedSecret);

        if (decryptedData) {
          const decryptedString = new TextDecoder().decode(decryptedData);
          const response = JSON.parse(decryptedString);

          if (response.signature) {
            setLastSignature(response.signature);

            // Restore publicKey and lastMessage from cookie (cross-tab)
            const savedPublicKey = getAuthCookie(WALLET_STORAGE_KEYS.PHANTOM_WALLET_PUBLIC_KEY);
            const savedMessage = getAuthCookie(WALLET_STORAGE_KEYS.PHANTOM_SIGN_MESSAGE);
            if (savedPublicKey) {
              setPublicKey(savedPublicKey);
            }
            if (savedMessage) {
              setLastMessage(decodeURIComponent(savedMessage));
            }
          } else {
            setError('No signature in response');
          }
        } else {
          setError('Decryption failed');
        }
      } catch (err: any) {
        setError('Failed to decrypt signature');
      }

      setTimeout(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 100);

      return;
    }

    // Handle connect response
    if (phantomEncryptionPublicKey && data) {

      try {
        // Use the currentKeypair from THIS useEffect's scope!
        if (!currentKeypair || !currentKeypair.keypair) {
          setError('No session keypair available');
          return;
        }
        const dappKeyPair = currentKeypair.keypair;
        const phantomPublicKey = bs58.decode(phantomEncryptionPublicKey);
        const sharedSecret = nacl.box.before(phantomPublicKey, dappKeyPair.secretKey);
        const encryptedData = bs58.decode(data);

        let nonceBytes, ciphertext;
        if (nonce) {
          nonceBytes = bs58.decode(nonce);
          ciphertext = encryptedData;
        } else {
          nonceBytes = encryptedData.slice(0, 24);
          ciphertext = encryptedData.slice(24);
        }

        const decryptedData = nacl.box.open.after(ciphertext, nonceBytes, sharedSecret);

        if (decryptedData) {
          const decryptedString = new TextDecoder().decode(decryptedData);
          const parsedData = JSON.parse(decryptedString);
          const walletPublicKey = parsedData.public_key || parsedData.publicKey;
          const sessionToken = parsedData.session;

          if (walletPublicKey) {
            setPublicKey(walletPublicKey);
            setError(null);

            // Persist wallet public key for signMessage return (use cookie for cross-tab)
            setAuthCookie(WALLET_STORAGE_KEYS.PHANTOM_WALLET_PUBLIC_KEY, walletPublicKey);

            if (sessionToken) {
              // Use cookie for cross-tab access
              setAuthCookie(WALLET_STORAGE_KEYS.PHANTOM_SESSION_TOKEN, sessionToken);
            }

            setAuthCookie(WALLET_STORAGE_KEYS.PHANTOM_PUBLIC_KEY, phantomEncryptionPublicKey);
          } else {
            setError('No wallet address in response');
          }
        } else {
          setError('Decryption failed');
        }
      } catch (err) {
        setError('Connection failed');
      }

      setTimeout(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 100);
    } else if (errorCode || errorMessage) {
      // Check if user rejected/cancelled using shared utility
      const isUserRejection = isUserRejectionError({ code: errorCode, message: errorMessage });

      if (isUserRejection) {
        setError('Operation cancelled by user');
      } else {
        setError(`Phantom error: ${errorMessage || errorCode || 'Unknown error'}`);
      }

      setTimeout(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 100);
    }
  }, []);

  const connect = useCallback(() => {
    setIsConnecting(true);
    setError(null);
    setLastSignature(null);
    setPublicKey(null);

    // Get keypair from cookie if not in state yet
    let keypairToUse = sessionKeypair;
    if (!keypairToUse) {
      const stored = getAuthCookie(WALLET_STORAGE_KEYS.PHANTOM_SESSION_KEYPAIR);
      if (stored) {
        try {
          const parsed = JSON.parse(decodeURIComponent(stored));
          keypairToUse = parsed;
        } catch (e) {
          // ignore
        }
      }
    }

    if (!keypairToUse) {
      // Generate new one if really needed
      const keypair = nacl.box.keyPair();
      keypairToUse = {
        publicKey: bs58.encode(keypair.publicKey),
        secretKey: bs58.encode(keypair.secretKey)
      };

      // Save it
      setAuthCookie(
        WALLET_STORAGE_KEYS.PHANTOM_SESSION_KEYPAIR,
        encodeURIComponent(JSON.stringify(keypairToUse))
      );
    }

    const currentUrl = window.location.href.split('?')[0];
    const dappUrl = encodeURIComponent(currentUrl);
    const cluster = 'mainnet-beta';
    const redirect = encodeURIComponent(currentUrl);
    const dappPublicKey = keypairToUse.publicKey;

    const connectUrl = `https://phantom.app/ul/v1/connect?app_url=${dappUrl}&dapp_encryption_public_key=${dappPublicKey}&cluster=${cluster}&redirect_link=${redirect}`;

    window.location.href = connectUrl;
  }, [sessionKeypair]);

  const signMessage = useCallback((message: string) => {
    // Use cookie for cross-tab access
    const sessionToken = getAuthCookie(WALLET_STORAGE_KEYS.PHANTOM_SESSION_TOKEN);
    if (!sessionToken) {
      setError('Please connect wallet first');
      return;
    }

    setIsSigning(true);

    try {
      // Get address from state or cookie (for new tab scenario)
      const address = publicKey || getAuthCookie(WALLET_STORAGE_KEYS.PHANTOM_WALLET_PUBLIC_KEY) || '';

      // Use shared SIWS message builder
      const formattedMessage = buildSIWSMessage(address);

      // Save message for later use (use cookie for cross-tab)
      setLastMessage(formattedMessage);
      setAuthCookie(WALLET_STORAGE_KEYS.PHANTOM_SIGN_MESSAGE, encodeURIComponent(formattedMessage));

      const currentUrl = window.location.href.split('?')[0];
      const redirect = encodeURIComponent(currentUrl);
      const dappKeyPair = sessionKeypair.keypair;
      const dappPublicKey = sessionKeypair.publicKey;

      const messageBytes = new TextEncoder().encode(formattedMessage);
      const messageBase58 = bs58.encode(messageBytes);

      const payload = {
        message: messageBase58,
        session: sessionToken,
        display: 'utf8'
      };

      const encryptionNonce = nacl.randomBytes(24);
      const nonceBase58 = bs58.encode(encryptionNonce);

      // Use cookie for cross-tab access
      const phantomPublicKeyStr = getAuthCookie(WALLET_STORAGE_KEYS.PHANTOM_PUBLIC_KEY);
      if (!phantomPublicKeyStr) {
        setError('Please reconnect wallet');
        setIsSigning(false);
        return;
      }

      const phantomPublicKey = bs58.decode(phantomPublicKeyStr);
      const sharedSecret = nacl.box.before(phantomPublicKey, dappKeyPair.secretKey);
      const payloadBytes = Buffer.from(JSON.stringify(payload));
      const encryptedPayload = nacl.box.after(payloadBytes, encryptionNonce, sharedSecret);
      const encryptedPayloadBase58 = bs58.encode(encryptedPayload);

      const signUrl = `https://phantom.app/ul/v1/signMessage?dapp_encryption_public_key=${dappPublicKey}&nonce=${nonceBase58}&redirect_link=${redirect}&payload=${encryptedPayloadBase58}`;

      window.location.href = signUrl;
    } catch (err: any) {
      setError('Failed to prepare sign message');
      setIsSigning(false);
    }
  }, [publicKey, sessionKeypair]);

  const disconnect = useCallback(() => {
    // Use cookie for cross-tab access
    const sessionToken = getAuthCookie(WALLET_STORAGE_KEYS.PHANTOM_SESSION_TOKEN);
    if (!sessionToken) {
      return;
    }

    if (!sessionKeypair) {
      return;
    }

    // Add phantom_disconnect parameter to redirect URL
    const currentUrl = window.location.href.split('?')[0];
    const redirectUrl = `${currentUrl}?phantom_disconnect=true`;
    const redirect = encodeURIComponent(redirectUrl);
    const dappPublicKey = sessionKeypair.publicKey;

    // 創建 payload
    const payload = { session: sessionToken };
    const disconnectNonce = nacl.randomBytes(24);
    const nonceBase58 = bs58.encode(disconnectNonce);

    // 加密 payload - use cookie for cross-tab access
    const phantomPublicKeyStr = getAuthCookie(WALLET_STORAGE_KEYS.PHANTOM_PUBLIC_KEY);
    if (!phantomPublicKeyStr) {
      return;
    }

    const phantomPublicKey = bs58.decode(phantomPublicKeyStr);
    const sharedSecret = nacl.box.before(phantomPublicKey, sessionKeypair.keypair.secretKey);
    const payloadBytes = Buffer.from(JSON.stringify(payload));
    const encryptedPayload = nacl.box.after(payloadBytes, disconnectNonce, sharedSecret);
    const encryptedPayloadBase58 = bs58.encode(encryptedPayload);

    window.location.href = `https://phantom.app/ul/v1/disconnect?dapp_encryption_public_key=${dappPublicKey}&nonce=${nonceBase58}&redirect_link=${redirect}&payload=${encryptedPayloadBase58}`;
  }, [sessionKeypair]);

  // Get credentials for auth (AuthMethod interface)
  const getCredentials = useCallback(async (): Promise<{
    walletAddress: string;
    email?: string;
    signature?: string;
    message?: string;
  }> => {
    if (!publicKey) {
      throw new Error('No wallet connected. Please connect first.');
    }

    return {
      walletAddress: publicKey,
      signature: lastSignature || undefined,
      message: lastMessage || undefined,
    };
  }, [publicKey, lastSignature, lastMessage]);

  // Cleanup method (AuthMethod interface)
  const cleanup = useCallback(async () => {
    // If we have an active Phantom session, just redirect to disconnect
    if (publicKey && getAuthCookie(WALLET_STORAGE_KEYS.PHANTOM_SESSION_TOKEN)) {
      disconnect();
      // Cleanup will happen when we return with phantom_disconnect=true
      return;
    }

    // If no active Phantom session, clear local data immediately
    removeSessionItem('phantom_connecting');
    removeSessionItem('phantom_dapp_public_key');
    removeSessionItem('phantom_signing');
    removeSessionItem('phantom_disconnecting');
    removeSessionItem(WALLET_STORAGE_KEYS.MOBILE_WALLET_CONNECTING);

    // Clear cookies (all Phantom-related)
    deleteAuthCookie(WALLET_STORAGE_KEYS.PHANTOM_SESSION_KEYPAIR);
    deleteAuthCookie(WALLET_STORAGE_KEYS.PHANTOM_PUBLIC_KEY);
    deleteAuthCookie(WALLET_STORAGE_KEYS.PHANTOM_WALLET_PUBLIC_KEY);
    deleteAuthCookie(WALLET_STORAGE_KEYS.PHANTOM_SESSION_TOKEN);
    deleteAuthCookie(WALLET_STORAGE_KEYS.PHANTOM_SIGN_MESSAGE);

    // Reset state
    setPublicKey(null);
    setLastSignature(null);
    setError(null);
    setSessionKeypair(null);
  }, [publicKey, disconnect]);

  return {
    isReady,
    getCredentials,
    cleanup,
    connect,
    signMessage,
    disconnect,
    publicKey,
    isConnecting,
    isSigning,
    lastSignature,
    lastMessage,
    error
  };
};
