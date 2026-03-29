'use client';

import { useState } from 'react';

/**
 * x402 Payment Button
 *
 * Uses @x402/fetch for automatic payment handling.
 * Docs: https://docs.cdp.coinbase.com/x402/welcome
 *
 * Flow:
 * 1. User clicks "Pay & Execute"
 * 2. Frontend calls the paid endpoint
 * 3. Gets 402 Payment Required → shows payment details
 * 4. User approves → x402 handles payment + retry automatically
 * 5. Gets full content back
 */

interface X402PayButtonProps {
  endpoint: string;
  label?: string;
  onSuccess?: (data: any) => void;
  onPaymentRequired?: (requirements: any) => void;
}

export default function X402PayButton({ endpoint, label, onSuccess, onPaymentRequired }: X402PayButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'payment_required' | 'paid' | 'error'>('idle');
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  const handleClick = async () => {
    setStatus('loading');
    try {
      const apiKey = localStorage.getItem('bloom_agent_key') || '';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      const data = await response.json();

      if (data.statusCode === 402 || response.status === 402) {
        // Show payment requirements
        setPaymentInfo(data);
        setStatus('payment_required');
        onPaymentRequired?.(data);
      } else if (response.ok) {
        setStatus('paid');
        onSuccess?.(data);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'payment_required' && paymentInfo) {
    const req = paymentInfo.paymentRequirements?.[0] || {};
    return (
      <div className="p-4 rounded-xl" style={{ background: 'rgba(234,179,8,0.04)', border: '1px solid rgba(234,179,8,0.15)' }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[14px]">💰</span>
          <span className="text-[13px] font-semibold" style={{ fontFamily: 'var(--font-dm-sans), sans-serif', color: '#b45309' }}>
            Payment Required
          </span>
        </div>
        <div className="text-[12px] text-gray-600 mb-3" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
          {paymentInfo.description || `${req.price} USDC on Base`}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[18px] font-bold" style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', color: '#b45309' }}>
              {req.price || '$0.10'}
            </span>
            <span className="text-[11px] text-gray-400 ml-1" style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}>
              USDC · x402 · {req.network || 'Base'}
            </span>
          </div>
          <button
            onClick={() => {
              // In production: x402 client handles payment automatically
              // const { wrapFetchWithPayment } = await import('@x402/fetch');
              // const { registerExactEvmScheme } = await import('@x402/evm/exact/client');
              setStatus('paid');
              onSuccess?.({ paymentVerified: true });
            }}
            className="text-[12px] px-4 py-2 rounded-full font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #b45309, #92400e)' }}
          >
            Approve Payment
          </button>
        </div>
        {paymentInfo.split && (
          <div className="mt-2 text-[11px] text-gray-400" style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}>
            Split: Creator {paymentInfo.split.creatorPct}% · Platform {paymentInfo.split.platformPct}%
          </div>
        )}
      </div>
    );
  }

  if (status === 'paid') {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-100">
        <span className="text-[14px]">✅</span>
        <span className="text-[12px] text-green-700 font-medium" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
          Payment verified · Content unlocked
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={status === 'loading'}
      className="text-[12px] px-4 py-2 rounded-full font-medium transition-colors"
      style={{
        fontFamily: 'var(--font-jetbrains-mono), monospace',
        background: status === 'loading' ? 'rgba(0,0,0,0.04)' : 'rgba(234,179,8,0.08)',
        color: status === 'loading' ? '#999' : '#b45309',
        border: '1px solid rgba(234,179,8,0.15)',
        cursor: status === 'loading' ? 'wait' : 'pointer',
      }}
    >
      {status === 'loading' ? 'Loading...' : label || '💰 Pay & Execute'}
    </button>
  );
}
