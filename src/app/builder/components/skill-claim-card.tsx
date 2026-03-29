'use client';

import { useState } from 'react';
import { useBuilderDashboard } from '../contexts/builder-dashboard-context';
import { useExclusivePassMint } from '@/hooks/useExclusivePassMint';
import { apiPost } from '@/lib/api/apiConfig';
import { EXCLUSIVE_PASS_ADDRESS } from '@/lib/contracts/exclusivePassAbi';
import type { ClaimStatus } from '../constants';

// Predefined perks creators can offer to backers
const PREDEFINED_PERKS = [
  'Early access to new versions',
  'Premium tier / features',
  'Priority support',
  'Limited / paid-only skills',
] as const;

const CLAIM_STATUS_STYLES: Record<ClaimStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Pending Review' },
  approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Approved' },
  rejected: { bg: 'bg-red-50', text: 'text-red-600', label: 'Rejected' },
};

export default function SkillClaimCard() {
  const { claimedSkills, handleSubmitClaimRequest } = useBuilderDashboard();
  const { mintPass, isMinting } = useExclusivePassMint();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Per-skill mint state
  const [mintingSlug, setMintingSlug] = useState<string | null>(null);
  const [mintResult, setMintResult] = useState<{ slug: string; success: boolean; message: string } | null>(null);

  // Claim via GitHub verification (new flow)
  const [claimSlug, setClaimSlug] = useState('');
  const [claimWallet, setClaimWallet] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState<{ success: boolean; message: string } | null>(null);

  // Form state (legacy manual claim)
  const [skillSlug, setSkillSlug] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [evidence, setEvidence] = useState('');
  const [selectedPerks, setSelectedPerks] = useState<string[]>([]);
  const [customPerk, setCustomPerk] = useState('');

  const togglePerk = (perk: string) => {
    setSelectedPerks(prev =>
      prev.includes(perk) ? prev.filter(p => p !== perk) : [...prev, perk]
    );
  };

  const resetForm = () => {
    setSkillSlug('');
    setGithubUsername('');
    setEvidence('');
    setSelectedPerks([]);
    setCustomPerk('');
    setSubmitError('');
    setClaimSlug('');
    setClaimWallet('');
    setClaimResult(null);
  };

  // GitHub-verified claim
  const handleGitHubClaim = async () => {
    if (!claimSlug.trim()) {
      setClaimResult({ success: false, message: 'Skill slug is required.' });
      return;
    }
    const wallet = claimWallet.trim();
    const isEvmAddress = /^0x[a-fA-F0-9]{40}$/.test(wallet);
    const isSolanaAddress = /^[1-9A-HJ-NP-Za-km-z]{43,44}$/.test(wallet);
    if (!wallet || (!isEvmAddress && !isSolanaAddress)) {
      setClaimResult({ success: false, message: 'Valid wallet address required (EVM 0x... or Solana base58).' });
      return;
    }

    setIsClaiming(true);
    setClaimResult(null);

    try {
      const res = await apiPost<{ success: boolean; data: { txHash?: string }; error?: string }>(
        `/skills/${claimSlug.trim()}/claim`,
        { walletAddress: claimWallet.trim() },
      );

      setClaimResult({
        success: true,
        message: `Claim approved! Tx: ${res.data?.txHash?.slice(0, 12)}...`,
      });

      setTimeout(() => {
        setShowForm(false);
        resetForm();
      }, 3000);
    } catch (err: any) {
      const raw = err?.response?.data?.message || err?.message || '';
      // Map backend errors to user-friendly messages
      let message = 'Claim failed. Please try again.';
      if (raw.includes('not a collaborator')) {
        message = 'You are not listed as a collaborator on this repo. Ask the owner to add you, or use Manual Review below.';
      } else if (raw.includes('GitHub not connected')) {
        message = 'Connect your GitHub account above before claiming.';
      } else if (raw.includes('not found') || raw.includes('Skill not found')) {
        message = 'Skill not found. Check the slug and try again.';
      } else if (raw.includes('already claimed')) {
        message = 'This skill has already been claimed by another builder.';
      } else if (raw.includes('wallet address')) {
        message = 'Invalid wallet address. Enter a valid 0x... (EVM) or base58 (Solana) address.';
      } else if (raw) {
        message = raw;
      }
      setClaimResult({ success: false, message });
    } finally {
      setIsClaiming(false);
    }
  };

  // Legacy manual claim (submit for review)
  const handleSubmit = async () => {
    if (!skillSlug.trim() || !githubUsername.trim()) {
      setSubmitError('Skill slug and GitHub username are required.');
      return;
    }

    const perks = [...selectedPerks];
    if (customPerk.trim()) perks.push(customPerk.trim());

    if (perks.length === 0) {
      setSubmitError('Select at least one perk for backers.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    const success = await handleSubmitClaimRequest({
      skillSlug: skillSlug.trim(),
      githubUsername: githubUsername.trim(),
      evidence: evidence.trim() || undefined,
      perks,
    });

    setIsSubmitting(false);

    if (success) {
      resetForm();
      setShowForm(false);
    } else {
      setSubmitError('Failed to submit claim. Please try again.');
    }
  };

  // Mint Exclusive Pass
  const handleMint = async (slug: string) => {
    setMintingSlug(slug);
    setMintResult(null);

    try {
      const txHash = await mintPass(slug);
      setMintResult({
        slug,
        success: true,
        message: `Pass minted! Tx: ${txHash.slice(0, 12)}...`,
      });
    } catch (err: any) {
      if (err?.code === 4001 || err?.code === 'ACTION_REJECTED') {
        setMintResult(null);
        return;
      }
      setMintResult({
        slug,
        success: false,
        message: err?.message?.includes('No EVM wallet')
          ? 'Please install Coinbase Wallet or MetaMask.'
          : 'Mint failed. You may have already minted this pass.',
      });
    } finally {
      setMintingSlug(null);
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
          CLAIMED SKILLS
        </h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-[13px] font-semibold text-[#8478e0] hover:text-[#6c5ecc] transition-colors"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Claim a Skill
          </button>
        )}
      </div>

      {/* Claim Form */}
      {showForm && (
        <div className="mb-5 p-4 bg-white/40 rounded-xl space-y-4">
          {/* GitHub-Verified Claim (primary — recommended) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <p className="text-[12px] font-semibold text-[#8478e0] uppercase tracking-wide" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Instant Claim
              </p>
              <span className="px-1.5 py-0.5 bg-[#8478e0]/10 text-[#8478e0] rounded text-[10px] font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Recommended
              </span>
            </div>
            <p className="text-[12px] text-[#696f8c]" style={{ fontFamily: 'Outfit, sans-serif' }}>
              We verify you&apos;re a collaborator on the skill&apos;s GitHub repo, then approve your claim on-chain automatically. Connect GitHub above first.
            </p>
            <div>
              <label className="block text-[12px] font-medium text-[#696f8c] mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Skill Slug *
              </label>
              <input
                type="text"
                value={claimSlug}
                onChange={e => setClaimSlug(e.target.value)}
                placeholder="e.g. code-review-agent"
                className="w-full px-3 py-2 text-[14px] border border-white/60 bg-white/50 rounded-xl focus:outline-none focus:border-[#8478e0] text-[#393f49]"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#696f8c] mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Your Wallet Address (Base or Solana) *
              </label>
              <input
                type="text"
                value={claimWallet}
                onChange={e => setClaimWallet(e.target.value)}
                placeholder="0x... or Solana address"
                className="w-full px-3 py-2 text-[14px] border border-white/60 bg-white/50 rounded-xl focus:outline-none focus:border-[#8478e0] text-[#393f49]"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              />
            </div>

            {claimResult && (
              <p className={`text-[12px] ${claimResult.success ? 'text-emerald-600' : 'text-red-500'}`} style={{ fontFamily: 'Outfit, sans-serif' }}>
                {claimResult.message}
              </p>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={handleGitHubClaim}
                disabled={isClaiming}
                className="px-4 py-2 text-[13px] font-semibold text-white bg-[#8478e0] hover:bg-[#6c5ecc] rounded-xl transition-colors disabled:opacity-50"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {isClaiming ? 'Verifying...' : 'Verify & Claim'}
              </button>
              <button
                onClick={() => { setShowForm(false); resetForm(); }}
                className="px-4 py-2 text-[13px] font-medium text-[#696f8c] hover:text-[#393f49] transition-colors"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[11px] text-[#9ca3af]" style={{ fontFamily: 'Outfit, sans-serif' }}>OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Manual Review Claim (fallback) */}
          <details className="group">
            <summary className="cursor-pointer list-none">
              <div className="flex items-center gap-2">
                <p className="text-[12px] font-semibold text-[#696f8c] uppercase tracking-wide" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Manual Review
                </p>
                <span className="text-[10px] text-[#9ca3af]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  (not a repo collaborator?)
                </span>
                <svg className="w-3.5 h-3.5 text-[#9ca3af] ml-auto transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </summary>

            <div className="space-y-3 mt-3">
              <p className="text-[12px] text-[#9ca3af]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                If you can&apos;t be verified as a repo collaborator, submit evidence for manual review. This may take 1-3 days.
              </p>
              <div>
                <label className="block text-[12px] font-medium text-[#696f8c] mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Skill Slug *
                </label>
                <input
                  type="text"
                  value={skillSlug}
                  onChange={e => setSkillSlug(e.target.value)}
                  placeholder="e.g. code-review-agent"
                  className="w-full px-3 py-2 text-[14px] border border-white/60 bg-white/50 rounded-xl focus:outline-none focus:border-[#8478e0] text-[#393f49]"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#696f8c] mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  GitHub Username *
                </label>
                <input
                  type="text"
                  value={githubUsername}
                  onChange={e => setGithubUsername(e.target.value)}
                  placeholder="your-github-username"
                  className="w-full px-3 py-2 text-[14px] border border-white/60 bg-white/50 rounded-xl focus:outline-none focus:border-[#8478e0] text-[#393f49]"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                />
              </div>

              {/* Perks Picker */}
              <div>
                <label className="block text-[12px] font-medium text-[#696f8c] mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Perks for Backers (pick 1-3) *
                </label>
                <div className="space-y-1.5">
                  {PREDEFINED_PERKS.map(perk => (
                    <label key={perk} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPerks.includes(perk)}
                        onChange={() => togglePerk(perk)}
                        className="w-3.5 h-3.5 rounded border-gray-300 text-[#8478e0] focus:ring-[#8478e0]"
                      />
                      <span className="text-[13px] text-[#393f49]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        {perk}
                      </span>
                    </label>
                  ))}
                </div>
                <input
                  type="text"
                  value={customPerk}
                  onChange={e => setCustomPerk(e.target.value)}
                  placeholder="Custom perk (optional)"
                  className="mt-2 w-full px-3 py-1.5 text-[13px] border border-white/60 bg-white/50 rounded-xl focus:outline-none focus:border-[#8478e0] text-[#393f49]"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#696f8c] mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Evidence (optional)
                </label>
                <textarea
                  value={evidence}
                  onChange={e => setEvidence(e.target.value)}
                  placeholder="Link to your GitHub repo or proof of ownership"
                  rows={2}
                  className="w-full px-3 py-2 text-[13px] border border-white/60 bg-white/50 rounded-xl focus:outline-none focus:border-[#8478e0] text-[#393f49] resize-none"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                />
              </div>

              {submitError && (
                <p className="text-[12px] text-red-500" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {submitError}
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 text-[13px] font-semibold text-white bg-[#696f8c] hover:bg-[#555b6b] rounded-xl transition-colors disabled:opacity-50"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit for Review'}
              </button>
            </div>
          </details>
        </div>
      )}

      {/* Claimed Skills List */}
      {claimedSkills.length === 0 && !showForm ? (
        <div className="text-center py-6">
          <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-[#8478e0]/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#8478e0]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p
            className="text-[14px] text-[#9ca3af] mb-2"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            See a skill with backers? Claim it to receive escrowed funds and set perks.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="text-[13px] font-semibold text-[#8478e0] hover:text-[#6c5ecc] transition-colors"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Claim a Skill &rarr;
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {claimedSkills.map((skill) => {
            const statusStyle = CLAIM_STATUS_STYLES[skill.claimStatus];
            const isThisMinting = mintingSlug === skill.slug || (isMinting && mintingSlug === skill.slug);
            const thisMintResult = mintResult?.slug === skill.slug ? mintResult : null;

            return (
              <div
                key={skill.slug}
                className="p-3 bg-white/40 rounded-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[14px] font-medium text-[#393f49] truncate"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    >
                      {skill.name || skill.slug}
                    </p>
                    {skill.claimStatus === 'approved' ? (
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[12px] text-[#696f8c]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                          {skill.backerCount} backer{skill.backerCount !== 1 ? 's' : ''} &middot; ${skill.escrowUsdc.toFixed(0)} in escrow
                        </span>
                        {skill.perks.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {skill.perks.map(perk => (
                              <span
                                key={perk}
                                className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-medium"
                                style={{ fontFamily: 'Outfit, sans-serif' }}
                              >
                                {perk}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-[12px] text-[#696f8c] mt-0.5" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        {skill.claimStatus === 'pending' ? 'Pending admin review' : 'Claim was rejected'}
                      </p>
                    )}
                  </div>

                  <span className={`ml-2 px-2 py-0.5 rounded-md text-[11px] font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                    {statusStyle.label}
                  </span>
                </div>

                {/* Mint Exclusive Pass button (shown for approved claims when contract is deployed) */}
                {skill.claimStatus === 'approved' && EXCLUSIVE_PASS_ADDRESS && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-[11px] text-[#9ca3af] mb-1.5" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      Mint a soulbound NFT as proof of builder status. Non-transferable, on Base.
                    </p>
                    <button
                      onClick={() => handleMint(skill.slug)}
                      disabled={isThisMinting}
                      className="w-full py-2 rounded-lg text-[12px] font-semibold transition-colors"
                      style={{
                        fontFamily: 'Outfit, sans-serif',
                        background: 'linear-gradient(135deg, #8478e0 0%, #a78bfa 100%)',
                        color: 'white',
                        opacity: isThisMinting ? 0.6 : 1,
                      }}
                    >
                      {isThisMinting ? 'Signing...' : 'Mint Exclusive Pass'}
                    </button>

                    {thisMintResult && (
                      <p
                        className={`text-[11px] mt-1 ${thisMintResult.success ? 'text-emerald-600' : 'text-red-500'}`}
                        style={{ fontFamily: 'Outfit, sans-serif' }}
                      >
                        {thisMintResult.message}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
