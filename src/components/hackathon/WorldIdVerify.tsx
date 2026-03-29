'use client';

import { useState, useCallback, useEffect } from 'react';
import { IDKitRequestWidget, orbLegacy, type RpContext, type IDKitResult } from '@worldcoin/idkit';

/**
 * World ID Verification via IDKit + AgentKit
 *
 * Real verification flow:
 * 1. Request RP signature from our backend (server-side signing)
 * 2. Open IDKitRequestWidget → user scans QR with World App
 * 3. Proof returned → forwarded to World's verify API
 * 4. On success → anonymousId (nullifier) stored, onVerified callback fired
 *
 * Docs: https://docs.world.org/agents/agent-kit/integrate
 */

const APP_ID = (process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID || 'app_staging_0') as `app_${string}`;
const RP_ID = process.env.NEXT_PUBLIC_WORLDCOIN_RP_ID || '';
const ACTION = 'verify-sanctuary';

interface WorldIdVerifyProps {
  onVerified?: (anonymousId: string) => void;
  /** Bloom user ID — links World ID nullifier to user's agent(s) in DB */
  userId?: string;
  /** Auto-start verification when mounted (used by iframe postMessage bridge) */
  autoStart?: boolean;
}

export default function WorldIdVerify({ onVerified, userId, autoStart }: WorldIdVerifyProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'verifying' | 'verified' | 'error'>('idle');
  const [open, setOpen] = useState(false);
  const [rpContext, setRpContext] = useState<RpContext | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-start when triggered by iframe postMessage
  const autoStarted = useState(false);
  useEffect(() => {
    if (autoStart && status === 'idle' && !autoStarted[0]) {
      autoStarted[1](true);
      handleVerifyClick();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  // Step 1: Request RP signature from our backend
  const handleVerifyClick = useCallback(async () => {
    setStatus('loading');
    setErrorMsg(null);

    try {
      const res = await fetch('/api/world-id/rp-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: ACTION }),
      });

      if (!res.ok) {
        throw new Error('Failed to get RP signature');
      }

      const data = await res.json();
      setRpContext({
        rp_id: data.rp_id,
        nonce: data.nonce,
        created_at: data.created_at,
        expires_at: data.expires_at,
        signature: data.sig,
      });
      setStatus('verifying');
      setOpen(true);
    } catch {
      setStatus('error');
      setErrorMsg('Could not start verification. Try again.');
    }
  }, []);

  // Step 2: IDKit calls this with the proof — verify on our backend
  const handleVerify = useCallback(async (result: unknown) => {
    try {
      const res = await fetch('/api/world-id/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rp_id: RP_ID || rpContext?.rp_id, proof: result }),
      });

      if (!res.ok) {
        throw new Error('Proof verification failed');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Verification failed. Please try again.');
      throw new Error('verify_failed');
    }
  }, [rpContext]);

  // Step 3: Called after handleVerify succeeds — link World ID to user's agent(s)
  const handleSuccess = useCallback((result: IDKitResult) => {
    const responses = result?.responses as Array<{ nullifier?: string }> | undefined;
    const nullifier = responses?.[0]?.nullifier;
    if (!nullifier) {
      console.warn('[WorldIdVerify] No nullifier in IDKit response — treating as error');
      setStatus('error');
      setErrorMsg('Verification incomplete. Please try again.');
      setOpen(false);
      return;
    }

    // Link World ID nullifier to user in BE
    // This creates the DB record so agent API calls can verify via isVerified()
    if (userId) {
      fetch('/api/playbook/world-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worldIdHash: nullifier,
          userId,
        }),
      }).catch((err) => {
        console.warn('[WorldIdVerify] Failed to link World ID to user:', err.message);
      });
    }

    setStatus('verified');
    setOpen(false);
    onVerified?.(nullifier);
  }, [onVerified, userId]);

  const handleError = useCallback(() => {
    setStatus('error');
    setErrorMsg('Verification cancelled or failed.');
    setOpen(false);
  }, []);

  if (status === 'verified') {
    return (
      <div className="flex items-center gap-2">
        <span
          className="text-[11px] px-2 py-1 rounded-full bg-green-50 text-green-600 font-medium"
          style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
        >
          ✓ HUMAN VERIFIED
        </span>
        <span
          className="text-[11px] text-gray-400"
          style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
        >
          Trust weight: 1.0
        </span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleVerifyClick}
        disabled={status === 'loading' || status === 'verifying'}
        className="text-[11px] px-3 py-1.5 rounded-full font-medium transition-colors"
        style={{
          fontFamily: 'var(--font-jetbrains-mono), monospace',
          background:
            status === 'loading' || status === 'verifying'
              ? 'rgba(0,0,0,0.04)'
              : 'rgba(124,58,237,0.08)',
          color: status === 'loading' || status === 'verifying' ? '#999' : '#7c3aed',
          border: '1px solid rgba(124,58,237,0.15)',
          cursor: status === 'loading' || status === 'verifying' ? 'wait' : 'pointer',
        }}
      >
        {status === 'loading'
          ? 'Preparing...'
          : status === 'verifying'
            ? 'Verifying...'
            : status === 'error'
              ? 'Retry verification'
              : 'Verify with World App'}
      </button>

      {errorMsg && (
        <span
          className="text-[10px] text-red-500 ml-2"
          style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
        >
          {errorMsg}
        </span>
      )}

      {/* IDKit Widget — opens World App QR scanner */}
      {rpContext && (
        <IDKitRequestWidget
          open={open}
          onOpenChange={setOpen}
          app_id={APP_ID}
          action={ACTION}
          rp_context={rpContext}
          allow_legacy_proofs={true}
          preset={orbLegacy({})}
          handleVerify={handleVerify}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      )}
    </>
  );
}
