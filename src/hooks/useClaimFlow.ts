'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { UseCase } from '@/constants/v4-use-case-definitions';
import { useClaimUseCase } from './useClaimUseCase';
import { useAuth } from '@/lib/context/AuthContext';

export type ClaimStep = 'detail' | 'form' | 'claiming' | 'success' | 'error';

const CLAIM_INTENT_KEY = 'bloom_claim_intent';

interface ClaimIntent {
  useCaseId: string;
  projectDescription: string;
  xHandle: string;
}

function saveClaimIntent(intent: ClaimIntent) {
  try {
    sessionStorage.setItem(CLAIM_INTENT_KEY, JSON.stringify(intent));
  } catch {
    // sessionStorage unavailable
  }
}

function loadClaimIntent(): ClaimIntent | null {
  try {
    const raw = sessionStorage.getItem(CLAIM_INTENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Validate shape to handle corrupted/stale storage
    if (
      typeof parsed === 'object' && parsed !== null &&
      typeof parsed.useCaseId === 'string' &&
      typeof parsed.projectDescription === 'string' &&
      typeof parsed.xHandle === 'string'
    ) {
      return parsed as ClaimIntent;
    }
    return null;
  } catch {
    return null;
  }
}

function clearClaimIntent() {
  try {
    sessionStorage.removeItem(CLAIM_INTENT_KEY);
  } catch {
    // sessionStorage unavailable
  }
}

export function useClaimFlow(useCase: UseCase) {
  const { user, isAuthenticated, connectWithEmail } = useAuth();
  const claimMutation = useClaimUseCase();
  const [step, setStep] = useState<ClaimStep>('detail');
  const [projectDescription, setProjectDescription] = useState('');
  const [xHandle, setXHandle] = useState('');
  const [claimMethod, setClaimMethod] = useState<'email' | 'wallet'>('email');
  const [errorMsg, setErrorMsg] = useState('');

  const MAX_PROJECT_LENGTH = 2000;
  const isProjectValid = projectDescription.trim().length >= 50
    && projectDescription.length <= MAX_PROJECT_LENGTH;

  const submitClaim = useCallback(
    async (method: 'email' | 'wallet', desc: string, handle: string) => {
      if (claimMutation.isPending) return; // Prevent double-submit
      setStep('claiming');
      try {
        await claimMutation.mutateAsync({
          useCaseId: useCase.id,
          data: {
            method,
            walletAddress: method === 'wallet' ? user?.walletAddress : undefined,
            email: method === 'email' ? (user?.email ?? undefined) : undefined,
            projectDescription: desc,
            xHandle: handle || undefined,
          },
        });
        setStep('success');
      } catch {
        setErrorMsg('Could not record your claim right now. Please try again later.');
        setStep('error');
      }
    },
    [claimMutation, useCase.id, user?.walletAddress, user?.email],
  );

  // Ref to track latest submitClaim for use in effect
  const submitClaimRef = useRef(submitClaim);
  submitClaimRef.current = submitClaim;

  // Resume claim intent after email auth (Thirdweb modal, no redirect)
  useEffect(() => {
    if (!isAuthenticated) return;
    const intent = loadClaimIntent();
    if (!intent || intent.useCaseId !== useCase.id) return;

    // Restore form state and auto-submit
    setProjectDescription(intent.projectDescription);
    setXHandle(intent.xHandle);
    setClaimMethod('email');
    clearClaimIntent();

    // Auto-proceed with claim
    submitClaimRef.current('email', intent.projectDescription, intent.xHandle);
  }, [isAuthenticated, useCase.id]);

  const handleEmailClaim = useCallback(() => {
    if (!isProjectValid) return;

    if (!isAuthenticated) {
      // Save intent before auth modal opens
      saveClaimIntent({
        useCaseId: useCase.id,
        projectDescription,
        xHandle,
      });
      connectWithEmail();
      return;
    }

    submitClaim('email', projectDescription, xHandle);
  }, [isProjectValid, isAuthenticated, useCase.id, projectDescription, xHandle, connectWithEmail, submitClaim]);

  const handleWalletClaim = useCallback(async () => {
    if (!isProjectValid) return;

    if (!isAuthenticated || !user?.walletAddress) {
      setErrorMsg('Please connect your wallet first.');
      setStep('error');
      return;
    }

    submitClaim('wallet', projectDescription, xHandle);
  }, [isProjectValid, isAuthenticated, user?.walletAddress, projectDescription, xHandle, submitClaim]);

  const reset = useCallback(() => {
    setStep('detail');
    setErrorMsg('');
  }, []);

  const remaining = Math.max(useCase.tribe.claimTarget - useCase.claimCount - 1, 0);
  const willOpen = remaining <= 0;

  const shareText = `I just claimed a spot in the "${useCase.tribe.name}" tribe on @Bloom__protocol! ${remaining} more to open the tribe. Join us:`;
  const shareUrl = `https://bloomprotocol.ai/claim/${useCase.id}`;

  return {
    step,
    setStep,
    projectDescription,
    setProjectDescription,
    xHandle,
    setXHandle,
    claimMethod,
    setClaimMethod,
    isProjectValid,
    errorMsg,
    handleEmailClaim,
    handleWalletClaim,
    reset,
    remaining,
    willOpen,
    shareText,
    shareUrl,
    isAuthenticated,
  };
}
