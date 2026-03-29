"use client";

import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useAuthGuard } from "@/lib/hooks";
import { apiGet, apiPatch, apiPost } from "@/lib/api/apiConfig";
import { profileService } from "@/lib/api/services/profileService";
import { logger } from "@/lib/utils/logger";
import {
  PROFILE_CONSTANTS,
  type ApiResponse,
  type X402ProfileData,
  type X402WalletData,
  type ExternalLink,
  type NetworkType,
  type LoginWalletType,
} from "../../types";

export interface X402ContextType {
  userId: string | null;
  savedAddress: string;
  setSavedAddress: (address: string) => void;
  bscAddress: string;
  setBscAddress: (address: string) => void;
  baseAddress: string;
  setBaseAddress: (address: string) => void;
  solanaAddress: string;
  setSolanaAddress: (address: string) => void;
  paymentLink: string;
  setPaymentLink: (link: string) => void;
  activeNetwork: NetworkType;
  setActiveNetwork: (network: NetworkType) => void;
  loginWalletType: LoginWalletType;
  displayName: string;
  setDisplayName: (name: string) => void;
  bio: string;
  setBio: (bio: string) => void;
  externalLinks: ExternalLink[];
  setExternalLinks: (links: ExternalLink[]) => void;
  profileError: string;
  setProfileError: (error: string) => void;
  isProfileSubmitting: boolean;
  setIsProfileSubmitting: (submitting: boolean) => void;
  isProfileSaved: boolean;
  handleSaveProfile: () => Promise<void>;
}

const X402Context = createContext<X402ContextType | null>(null);

export const X402Provider = ({ children }: { children: React.ReactNode }) => {
  const { userId } = useAuthGuard();

  const [savedAddress, setSavedAddress] = useState('');
  const [bscAddress, setBscAddress] = useState('');
  const [baseAddress, setBaseAddress] = useState('');
  const [solanaAddress, setSolanaAddress] = useState('');
  const [paymentLink, setPaymentLink] = useState('');
  const [activeNetwork, setActiveNetwork] = useState<NetworkType>('Base');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [externalLinks, setExternalLinks] = useState<ExternalLink[]>([]);
  const [profileError, setProfileError] = useState('');
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  const [isProfileSaved, setIsProfileSaved] = useState(false);
  const [loginWalletType, setLoginWalletType] = useState<LoginWalletType>(null);

  // Fetch user data on mount
  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        // First get initial data to check for existing Solana address
        const initialData = await profileService.getInitialData();
        const userWalletAddress = initialData.userInfo.walletAddress;

        // Check if addresses need to be auto-initialized
        let hasExistingSolana = false;
        let hasExistingBsc = false;
        let hasExistingBase = false;

        // Fetch all wallet addresses
        try {
          const allWalletsResponse = await apiGet(`/x402/user/${userId}/wallets`) as ApiResponse<X402WalletData[]>;

          if (allWalletsResponse?.data) {
            allWalletsResponse.data.forEach((wallet) => {
              if (wallet.network === 'BSC') {
                hasExistingBsc = true;
                setBscAddress(wallet.walletAddress);
                if (activeNetwork === 'BSC') {
                  setSavedAddress(wallet.walletAddress);
                }
              } else if (wallet.network === 'Base') {
                hasExistingBase = true;
                setBaseAddress(wallet.walletAddress);
                if (activeNetwork === 'Base') {
                  setSavedAddress(wallet.walletAddress);
                }
              } else if (wallet.network === 'Solana') {
                hasExistingSolana = true;
                setSolanaAddress(wallet.walletAddress);
                if (activeNetwork === 'Solana') {
                  setSavedAddress(wallet.walletAddress);
                }
              }
            });
          }
        } catch (walletsError) {
          const error = walletsError as { response?: { status: number }; status?: number };
          // If it's 404, that means no wallets are set yet, which is fine
          if (error.response?.status !== 404 && error.status !== 404) {
            logger.error('Unexpected error fetching wallets', { error: walletsError });
          }
        }

        // Detect wallet address type
        const isSolanaAddress = userWalletAddress && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(userWalletAddress);
        const isEvmAddress = userWalletAddress && /^0x[a-fA-F0-9]{40}$/.test(userWalletAddress);

        // Set login wallet type
        if (isEvmAddress) {
          setLoginWalletType('EVM');
        } else if (isSolanaAddress) {
          setLoginWalletType('Solana');
        }

        // Auto-initialize Solana address if:
        // 1. No existing Solana address in x402_links
        // 2. User has a valid Solana address in MySQL
        if (!hasExistingSolana && isSolanaAddress) {
          try {
            const result = await apiPost('/users/wallet-address', {
              network: 'Solana',
              walletAddress: userWalletAddress,
            }) as ApiResponse<X402WalletData>;

            if (result?.success) {
              setSolanaAddress(userWalletAddress);
              if (activeNetwork === 'Solana') {
                setSavedAddress(userWalletAddress);
              }
            } else {
              logger.error('Failed to auto-initialize Solana address', { error: result });
            }
          } catch (postError) {
            logger.error('Error posting Solana address', { error: postError });
          }
        }

        // Auto-initialize BSC address if:
        // 1. No existing BSC address in x402_links
        // 2. User has a valid EVM address in MySQL
        if (!hasExistingBsc && isEvmAddress) {
          try {
            const result = await apiPost('/users/wallet-address', {
              network: 'BSC',
              walletAddress: userWalletAddress,
            }) as ApiResponse<X402WalletData>;

            if (result?.success) {
              setBscAddress(userWalletAddress);
              if (activeNetwork === 'BSC') {
                setSavedAddress(userWalletAddress);
              }
            } else {
              logger.error('Failed to auto-initialize BSC address', { error: result });
            }
          } catch (postError) {
            logger.error('Error posting BSC address', { error: postError });
          }
        }

        // Auto-initialize Base address if:
        // 1. No existing Base address in x402_links
        // 2. User has a valid EVM address in MySQL
        if (!hasExistingBase && isEvmAddress) {
          try {
            const result = await apiPost('/users/wallet-address', {
              network: 'Base',
              walletAddress: userWalletAddress,
            }) as ApiResponse<X402WalletData>;

            if (result?.success) {
              setBaseAddress(userWalletAddress);
              if (activeNetwork === 'Base') {
                setSavedAddress(userWalletAddress);
              }
            } else {
              logger.error('Failed to auto-initialize Base address', { error: result });
            }
          } catch (postError) {
            logger.error('Error posting Base address', { error: postError });
          }
        }

        // Fetch current network address
        const response = await apiGet(`/x402/user/${userId}/wallet?network=${activeNetwork}`) as ApiResponse<X402WalletData>;
        if (response?.data?.walletAddress) {
          setSavedAddress(response.data.walletAddress);
          if (activeNetwork === 'BSC') {
            setBscAddress(response.data.walletAddress);
          } else if (activeNetwork === 'Base') {
            setBaseAddress(response.data.walletAddress);
          } else {
            setSolanaAddress(response.data.walletAddress);
          }

          // Update payment link for active network
          const networkPath = activeNetwork.toLowerCase();
          setPaymentLink(`${PROFILE_CONSTANTS.X402_BASE_URL}/${networkPath}/${userId}`);

          try {
            const profileResponse = await apiGet('/users/x402-profile') as ApiResponse<X402ProfileData>;
            if (profileResponse?.success && profileResponse?.data) {
              setDisplayName(profileResponse.data.displayName || '');
              setBio(profileResponse.data.bio || '');
              setExternalLinks(profileResponse.data.externalLinks || []);
            }
          } catch {
            // Profile not configured yet, ignore
          }
        }
      } catch (error) {
        const err = error as { response?: { status: number }; status?: number };
        if (err.response?.status !== 404 && err.status !== 404) {
          logger.error('Error checking user address', { error });
        }
      }
    };

    fetchData();
  }, [userId, activeNetwork]);

  const handleSaveProfile = async () => {
    setIsProfileSubmitting(true);
    setProfileError('');

    try {
      const result = await apiPatch('/users/x402-profile', {
        displayName: displayName.trim() || undefined,
        bio: bio.trim() || undefined,
        externalLinks: externalLinks.length > 0 ? externalLinks : undefined,
      }) as ApiResponse<X402ProfileData>;

      if (!result.success) {
        setProfileError(result.error || 'Failed to save profile. Please try again.');
        setIsProfileSubmitting(false);
        return;
      }

      // Success: show "Saved" feedback
      setIsProfileSubmitting(false);
      setIsProfileSaved(true);
      setTimeout(() => {
        setIsProfileSaved(false);
      }, PROFILE_CONSTANTS.FEEDBACK_DURATION);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      logger.error('Error saving profile', { error });
      setProfileError(err.response?.data?.message || 'Failed to save profile');
      setIsProfileSubmitting(false);
    }
  };

  const value = useMemo(() => ({
    userId,
    savedAddress,
    setSavedAddress,
    bscAddress,
    setBscAddress,
    baseAddress,
    setBaseAddress,
    solanaAddress,
    setSolanaAddress,
    paymentLink,
    setPaymentLink,
    activeNetwork,
    setActiveNetwork,
    loginWalletType,
    displayName,
    setDisplayName,
    bio,
    setBio,
    externalLinks,
    setExternalLinks,
    profileError,
    setProfileError,
    isProfileSubmitting,
    setIsProfileSubmitting,
    isProfileSaved,
    handleSaveProfile,
  }), [
    userId,
    savedAddress,
    bscAddress,
    baseAddress,
    solanaAddress,
    paymentLink,
    activeNetwork,
    loginWalletType,
    displayName,
    bio,
    externalLinks,
    profileError,
    isProfileSubmitting,
    isProfileSaved,
  ]);

  return (
    <X402Context.Provider value={value}>
      {children}
    </X402Context.Provider>
  );
};

export const useX402 = () => {
  const context = useContext(X402Context);
  if (!context) {
    throw new Error("useX402 must be used within X402Provider");
  }
  return context;
};
