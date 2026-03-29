import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';

// TODO: Import actual ABI after compiling contract
// import BloomIdentityCardABI from '@/contracts/BloomIdentityCard.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_IDENTITY_CARD_ADDRESS as `0x${string}`;

// Placeholder ABI - replace with actual ABI from compiled contract
const IDENTITY_CARD_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "identityType", "type": "string" },
      { "internalType": "string", "name": "customTagline", "type": "string" },
      { "internalType": "string", "name": "customDescription", "type": "string" },
      { "internalType": "string[]", "name": "mainCategories", "type": "string[]" },
      { "internalType": "string[]", "name": "subCategories", "type": "string[]" }
    ],
    "name": "mint",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "internalType": "string", "name": "identityType", "type": "string" },
      { "internalType": "string", "name": "customTagline", "type": "string" },
      { "internalType": "string", "name": "customDescription", "type": "string" },
      { "internalType": "string[]", "name": "mainCategories", "type": "string[]" },
      { "internalType": "string[]", "name": "subCategories", "type": "string[]" }
    ],
    "name": "updateIdentity",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getValidPersonalityTypes",
    "outputs": [{ "internalType": "string[]", "name": "", "type": "string[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
    "name": "getTokenIdByAddress",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
    "name": "hasMinted",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "getIdentityData",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "identityType", "type": "string" },
          { "internalType": "string", "name": "customTagline", "type": "string" },
          { "internalType": "string", "name": "customDescription", "type": "string" },
          { "internalType": "string[]", "name": "mainCategories", "type": "string[]" },
          { "internalType": "string[]", "name": "subCategories", "type": "string[]" },
          { "internalType": "uint256", "name": "mintedAt", "type": "uint256" }
        ],
        "internalType": "struct BloomIdentityCard.IdentityData",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "personalityType", "type": "string" }],
    "name": "isValidPersonalityType",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "tokenURI",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export interface IdentityCardData {
  identityType: string;
  customTagline: string;
  customDescription: string;
  mainCategories: string[];
  subCategories: string[];
  mintedAt: bigint;
}

export function useIdentityCard() {
  const { user } = useAuth();
  const userAddress = user?.walletAddress as `0x${string}` | undefined;

  // Read: Get valid personality types
  const { data: validTypes } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: IDENTITY_CARD_ABI,
    functionName: 'getValidPersonalityTypes',
    query: {
      enabled: !!CONTRACT_ADDRESS,
    }
  });

  // Read: Check if user has minted
  const { data: hasMinted } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: IDENTITY_CARD_ABI,
    functionName: 'hasMinted',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!CONTRACT_ADDRESS && !!userAddress,
    }
  });

  // Read: Get user's token ID
  const { data: tokenId } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: IDENTITY_CARD_ABI,
    functionName: 'getTokenIdByAddress',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!CONTRACT_ADDRESS && !!userAddress && !!hasMinted,
    }
  });

  // Read: Get identity data
  const { data: identityData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: IDENTITY_CARD_ABI,
    functionName: 'getIdentityData',
    args: tokenId ? [tokenId] : undefined,
    query: {
      enabled: !!CONTRACT_ADDRESS && !!tokenId && tokenId > BigInt(0),
    }
  }) as { data: IdentityCardData | undefined };

  // Write: Mint and Update
  const {
    writeContract: writeContractFn,
    data: writeData,
    isPending: isWritePending,
    error: writeError
  } = useWriteContract();

  const { isLoading: isWaitingForTx } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  // Helper: Validate personality type
  const validatePersonalityType = (personalityType: string): boolean => {
    if (!validTypes) return false;
    return (validTypes as string[]).includes(personalityType);
  };

  // Helper: Mint with validation
  const mintCard = async (
    identityType: string,
    customTagline: string,
    customDescription: string,
    mainCategories: string[],
    subCategories: string[] = []
  ) => {
    if (!validatePersonalityType(identityType)) {
      throw new Error(`Invalid personality type: ${identityType}. Must be one of: ${validTypes?.join(', ')}`);
    }

    if (hasMinted) {
      throw new Error('You have already minted an identity card');
    }

    writeContractFn({
      address: CONTRACT_ADDRESS,
      abi: IDENTITY_CARD_ABI,
      functionName: 'mint',
      args: [
        identityType,
        customTagline,
        customDescription,
        mainCategories,
        subCategories
      ]
    });
  };

  // Helper: Update with validation
  const updateCard = async (
    identityType: string,
    customTagline: string,
    customDescription: string,
    mainCategories: string[],
    subCategories: string[] = []
  ) => {
    if (!validatePersonalityType(identityType)) {
      throw new Error(`Invalid personality type: ${identityType}`);
    }

    if (!tokenId || tokenId === BigInt(0)) {
      throw new Error('No identity card found');
    }

    writeContractFn({
      address: CONTRACT_ADDRESS,
      abi: IDENTITY_CARD_ABI,
      functionName: 'updateIdentity',
      args: [
        tokenId,
        identityType,
        customTagline,
        customDescription,
        mainCategories,
        subCategories
      ]
    });
  };

  return {
    // Contract info
    contractAddress: CONTRACT_ADDRESS,

    // Read data
    validTypes: validTypes as string[] | undefined,
    hasMinted: hasMinted as boolean | undefined,
    tokenId: tokenId as bigint | undefined,
    identityData,

    // Write functions
    mintCard,
    updateCard,

    // Loading states
    isMinting: isWritePending || isWaitingForTx,
    isUpdating: isWritePending || isWaitingForTx,

    // Errors
    mintError: writeError,
    updateError: writeError,

    // Transaction data
    mintTxHash: writeData,
    updateTxHash: writeData,

    // Utilities
    validatePersonalityType,
  };
}

// Helper: Format identity data for display
export function formatIdentityData(data: IdentityCardData | undefined) {
  if (!data) return null;

  return {
    ...data,
    mintedAt: new Date(Number(data.mintedAt) * 1000),
    mintedAtFormatted: new Date(Number(data.mintedAt) * 1000).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    }),
  };
}
