'use client';

import { useState, useMemo } from 'react';
import { useBuilderDashboard } from '../contexts/builder-dashboard-context';
import { useEscrowWithdraw } from '@/hooks/useEscrowWithdraw';
import type { PayoutMethod } from '../constants';

// Crypto donation platforms with deep links
const DONATION_PLATFORMS = [
  {
    id: 'giveth',
    name: 'Giveth',
    desc: 'Public goods on Ethereum',
    url: 'https://giveth.io/donate',
  },
  {
    id: 'thegivingblock',
    name: 'The Giving Block',
    desc: '2,000+ nonprofits',
    url: 'https://thegivingblock.com/donate',
  },
  {
    id: 'endaoment',
    name: 'Endaoment',
    desc: 'On-chain to nonprofits',
    url: 'https://endaoment.org/orgs',
  },
] as const;

type ViewState = 'overview' | 'withdraw' | 'donate';

export default function FundsCard() {
  const { claimedSkills } = useBuilderDashboard();
  const { withdrawFromEscrow, isWithdrawing } = useEscrowWithdraw();
  const [view, setView] = useState<ViewState>('overview');
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);

  // Only approved claims with escrowed funds
  const approvedSkills = useMemo(
    () => claimedSkills.filter(s => s.claimStatus === 'approved' && s.escrowUsdc > 0),
    [claimedSkills]
  );

  const totalEscrow = useMemo(
    () => approvedSkills.reduce((sum, s) => sum + s.escrowUsdc, 0),
    [approvedSkills]
  );

  // Nothing to show if no approved claims
  if (approvedSkills.length === 0) return null;

  const selectedSkillData = approvedSkills.find(s => s.slug === selectedSkill);

  const handleWithdraw = async () => {
    if (!selectedSkill || !selectedSkillData) return;

    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const txHash = await withdrawFromEscrow(selectedSkill, selectedSkillData.escrowUsdc);

      setSubmitResult({
        success: true,
        message: `Withdrawal successful! Tx: ${txHash.slice(0, 10)}...`,
      });

      setTimeout(() => {
        setView('overview');
        setSelectedSkill(null);
        setSubmitResult(null);
      }, 3000);
    } catch (err: any) {
      if (err?.code === 4001 || err?.code === 'ACTION_REJECTED') {
        setSubmitResult(null);
        return;
      }
      setSubmitResult({
        success: false,
        message: err?.message?.includes('No EVM wallet')
          ? 'Please install Coinbase Wallet or MetaMask.'
          : 'Withdrawal failed. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDonate = async (method: PayoutMethod, platform?: string) => {
    if (!selectedSkill) return;

    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const { builderService } = await import('@/lib/api/services/builderService');
      await builderService.requestPayout({
        skillSlug: selectedSkill,
        method,
        walletAddress: '',
        amount: selectedSkillData?.escrowUsdc || 0,
        donationPlatform: platform,
      });

      setSubmitResult({
        success: true,
        message: 'Donation initiated. Thank you for giving back!',
      });

      setTimeout(() => {
        setView('overview');
        setSelectedSkill(null);
        setSubmitResult(null);
      }, 3000);
    } catch {
      setSubmitResult({
        success: false,
        message: 'Request failed. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="rounded-[20px] p-6"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(245,240,255,0.35) 100%)',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 4px 24px rgba(100,80,150,0.08), inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(150,130,200,0.06)',
        backdropFilter: 'blur(24px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.2)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-[15px] font-semibold text-[#1a1228]"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          ESCROWED FUNDS
        </h3>
        {view !== 'overview' && (
          <button
            onClick={() => { setView('overview'); setSelectedSkill(null); setSubmitResult(null); }}
            className="text-[12px] font-medium text-[#696f8c] hover:text-[#393f49] transition-colors"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            &larr; Back
          </button>
        )}
      </div>

      {/* Overview */}
      {view === 'overview' && (
        <>
          {/* Total */}
          <div className="text-center mb-4">
            <p
              className="text-[28px] font-bold text-[#1a1228]"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              ${totalEscrow.toFixed(2)}
            </p>
            <p
              className="text-[12px] text-[#9ca3af]"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              USDC available from {approvedSkills.length} approved skill{approvedSkills.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Per-skill breakdown */}
          <div className="space-y-2 mb-4">
            {approvedSkills.map(skill => (
              <div
                key={skill.slug}
                className="flex items-center justify-between p-3 bg-white/40 rounded-xl"
              >
                <div className="min-w-0">
                  <p
                    className="text-[13px] font-medium text-[#393f49] truncate"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    {skill.name || skill.slug}
                  </p>
                  <p
                    className="text-[11px] text-[#9ca3af]"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    {skill.backerCount} backer{skill.backerCount !== 1 ? 's' : ''}
                  </p>
                </div>
                <span
                  className="text-[14px] font-semibold text-[#1a1228] shrink-0 ml-2"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  ${skill.escrowUsdc.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setView('withdraw')}
              className="flex-1 py-2.5 rounded-xl font-['Outfit'] font-semibold text-[13px] text-white bg-[#8478e0] hover:bg-[#6c5ecc] transition-colors"
            >
              Withdraw
            </button>
            <button
              onClick={() => setView('donate')}
              className="flex-1 py-2.5 rounded-xl font-['Outfit'] font-semibold text-[13px] text-[#8478e0] bg-white/60 hover:bg-white/80 transition-colors"
              style={{ border: '1px solid rgba(132,120,224,0.3)' }}
            >
              Donate
            </button>
          </div>
        </>
      )}

      {/* Withdraw Flow — direct contract call from connected wallet */}
      {view === 'withdraw' && (
        <div className="space-y-3">
          <p
            className="text-[13px] text-[#696f8c] mb-1"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Withdraw USDC directly to your connected wallet on Base.
          </p>
          <p
            className="text-[11px] text-[#b0b5c0] mb-2"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Solana-backed funds will be sent upon claim approval. Base-backed funds can be withdrawn directly below.
          </p>

          {/* Skill selector */}
          <div>
            <label className="block text-[12px] font-medium text-[#696f8c] mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Select Skill
            </label>
            <select
              value={selectedSkill || ''}
              onChange={e => setSelectedSkill(e.target.value || null)}
              className="w-full px-3 py-2 text-[13px] border border-white/60 bg-white/50 rounded-xl focus:outline-none focus:border-[#8478e0] text-[#393f49]"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              <option value="">Choose a skill...</option>
              {approvedSkills.map(s => (
                <option key={s.slug} value={s.slug}>
                  {s.name || s.slug} — ${s.escrowUsdc.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* Amount preview */}
          {selectedSkillData && (
            <div className="p-3 bg-white/40 rounded-xl">
              <div className="flex justify-between">
                <span className="text-[12px] text-[#696f8c]" style={{ fontFamily: 'Outfit, sans-serif' }}>Amount</span>
                <span className="text-[14px] font-semibold text-[#1a1228]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  ${selectedSkillData.escrowUsdc.toFixed(2)} USDC
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[12px] text-[#696f8c]" style={{ fontFamily: 'Outfit, sans-serif' }}>Network</span>
                <span className="text-[12px] text-[#393f49]" style={{ fontFamily: 'Outfit, sans-serif' }}>Base</span>
              </div>
            </div>
          )}

          {/* Result message */}
          {submitResult && (
            <p
              className={`text-[12px] ${submitResult.success ? 'text-emerald-600' : 'text-red-500'}`}
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {submitResult.message}
            </p>
          )}

          {/* Submit */}
          <button
            onClick={handleWithdraw}
            disabled={!selectedSkill || isSubmitting || isWithdrawing}
            className="w-full py-2.5 rounded-xl font-['Outfit'] font-semibold text-[13px] text-white bg-[#8478e0] hover:bg-[#6c5ecc] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting || isWithdrawing ? 'Signing transaction...' : 'Confirm Withdrawal'}
          </button>
        </div>
      )}

      {/* Donate Flow */}
      {view === 'donate' && (
        <div className="space-y-3">
          <p
            className="text-[13px] text-[#696f8c] mb-1"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Donate your escrowed funds to a cause you care about.
          </p>

          {/* Skill selector */}
          <div>
            <label className="block text-[12px] font-medium text-[#696f8c] mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Select Skill
            </label>
            <select
              value={selectedSkill || ''}
              onChange={e => setSelectedSkill(e.target.value || null)}
              className="w-full px-3 py-2 text-[13px] border border-white/60 bg-white/50 rounded-xl focus:outline-none focus:border-[#8478e0] text-[#393f49]"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              <option value="">Choose a skill...</option>
              {approvedSkills.map(s => (
                <option key={s.slug} value={s.slug}>
                  {s.name || s.slug} — ${s.escrowUsdc.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {selectedSkillData && (
            <p
              className="text-[12px] text-[#9ca3af] italic"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Donating ${selectedSkillData.escrowUsdc.toFixed(2)} USDC
            </p>
          )}

          {/* Donation platforms */}
          <div className="space-y-2">
            {DONATION_PLATFORMS.map(platform => (
              <a
                key={platform.id}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  if (selectedSkill) {
                    // Fire-and-forget: record the donation intent
                    handleDonate('donate', platform.id);
                  }
                }}
                className="flex items-center justify-between p-3 bg-white/40 rounded-xl hover:bg-white/60 transition-colors group"
              >
                <div>
                  <p
                    className="text-[13px] font-medium text-[#393f49]"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    {platform.name}
                  </p>
                  <p
                    className="text-[11px] text-[#9ca3af]"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    {platform.desc}
                  </p>
                </div>
                <svg className="w-4 h-4 text-[#9ca3af] group-hover:text-[#8478e0] transition-colors shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            ))}
          </div>

          {!selectedSkill && (
            <p
              className="text-[12px] text-amber-600"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Select a skill first to donate its funds.
            </p>
          )}

          {/* Result message */}
          {submitResult && (
            <p
              className={`text-[12px] ${submitResult.success ? 'text-emerald-600' : 'text-red-500'}`}
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {submitResult.message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
