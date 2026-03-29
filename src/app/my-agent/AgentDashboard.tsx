'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import type { UserClaim } from '@/lib/api/services/v4UseCaseService';
import { getAllUseCases, getUseCaseById } from '@/constants/v4-use-case-definitions';
import { tribeService, type TribeMembership } from '@/lib/api/services/tribeService';
import { getTribeById } from '@/constants/tribe-definitions';
import { useAuth } from '@/lib/context/AuthContext';
import { useAgentSession } from '@/hooks/useAgentSession';
import { useIdentitySnapshot } from '@/hooks/usePledges';
import { useReputation } from '@/hooks/useReputation';
import { useIdentityCard } from '@/hooks/useIdentityCard';
import type { ReputationData, TribeRepBreakdown } from '@/lib/api/services/reputationService';
import { computeCapabilities, CAPABILITY_DIMENSIONS, type CapabilityProfile } from '@/constants/agent-capabilities';
import CapabilityRadar from '@/components/ui/CapabilityRadar';
import { AGENT_PERSONALITIES } from '@/app/(protected)/dashboard/config/agent-personalities';

interface AgentDashboardProps {
  claims: UserClaim[];
}

const ACCENT: Record<string, string> = {
  purple: '#a78bfa',
  amber: '#fbbf24',
};

const TX_HASH_RE = /^0x[0-9a-fA-F]{64}$/;
const isSafeUrl = (url: string) => /^https:\/\//.test(url);

export default function AgentDashboard({ claims }: AgentDashboardProps) {
  const allUseCases = getAllUseCases();
  const { agentData } = useAgentSession();
  const { user, isAuthenticated } = useAuth();
  const { data: identitySnapshot } = useIdentitySnapshot(!!user);
  const { data: reputation } = useReputation(isAuthenticated);
  const identityCard = useIdentityCard();

  // Fetch tribe memberships (includes on-chain identity status)
  const { data: tribeMemberships } = useQuery({
    queryKey: ['my-tribes'],
    queryFn: async () => {
      const res = await tribeService.getMyTribes();
      return res.data;
    },
    enabled: isAuthenticated,
    // Auto-refetch while identity is actively minting
    refetchInterval: (query) =>
      query.state.data?.some((m: TribeMembership) => m.sbtStatus === 'minting') ? 5000 : false,
  });

  // Resolve personality (agent takes priority)
  const agentKey = agentData?.identity?.personalityType?.toLowerCase().replace('the ', '') || '';
  const agentPConfig = agentKey ? AGENT_PERSONALITIES[agentKey] : null;
  const identityName = agentPConfig?.name || identitySnapshot?.personality?.name;
  const identityTagline = agentPConfig?.description || identitySnapshot?.personality?.description;

  // Compute capability profile from reputation data
  const capProfile: CapabilityProfile | null = reputation
    ? computeCapabilities(reputation)
    : null;

  // Resolve use case data for each claim
  const claimedWithData = claims.map((claim) => ({
    claim,
    useCase: claim.useCase ?? getUseCaseById(claim.useCaseId),
  })).filter((c) => c.useCase);

  // Use cases not yet claimed
  const claimedIds = new Set(claims.map((c) => c.useCaseId));
  const unclaimedUseCases = allUseCases.filter((uc) => !claimedIds.has(uc.id));

  return (
    <div className="max-w-[900px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl desktop:text-4xl font-extrabold text-gray-900 mb-2"
          style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}
        >
          My Agent
        </h1>
        <p className="text-base text-gray-500">
          Your claimed configurations and tribe memberships.
        </p>
      </div>

      {/* Claimed Tribes */}
      <section className="mb-10">
        <h2
          className="text-xl font-bold text-gray-900 mb-4"
          style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}
        >
          Your Tribes
        </h2>
        <div className="grid grid-cols-1 desktop:grid-cols-2 gap-4">
          {claimedWithData.map(({ claim, useCase }) => {
            if (!useCase) return null;
            const accent = ACCENT[useCase.color] ?? '#a78bfa';
            const progress = useCase.tribe.claimTarget > 0
              ? Math.min((useCase.claimCount / useCase.tribe.claimTarget) * 100, 100)
              : 0;
            const isOpen = useCase.tribeStatus === 'open';

            return (
              <div
                key={claim.claimId}
                className="relative rounded-[20px] overflow-hidden"
                style={{
                  background: useCase.color === 'purple'
                    ? 'linear-gradient(170deg, #1a0f2e 0%, #0d0a14 50%, #100d18 100%)'
                    : 'linear-gradient(170deg, #1f1a0f 0%, #14100a 50%, #18120d 100%)',
                  border: `1px solid ${accent}33`,
                }}
              >
                <div className="p-5">
                  {/* Header row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{useCase.icon}</span>
                      <span
                        className="text-[17px] font-bold text-[#fafafa]"
                        style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}
                      >
                        {useCase.title}
                      </span>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide"
                      style={{
                        fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                        background: isOpen ? 'rgba(52,211,153,0.12)' : `${accent}15`,
                        color: isOpen ? '#34d399' : accent,
                        border: `1px solid ${isOpen ? 'rgba(52,211,153,0.25)' : `${accent}30`}`,
                      }}
                    >
                      {isOpen ? 'TRIBE OPEN' : 'WAITING'}
                    </span>
                  </div>

                  {/* Tribe progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-[11px] text-[#a1a1aa]"
                        style={{ fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' }}
                      >
                        {useCase.tribe.name}
                      </span>
                      <span
                        className="text-[11px] text-[#71717a]"
                        style={{ fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' }}
                      >
                        {useCase.claimCount}/{useCase.tribe.claimTarget}
                      </span>
                    </div>
                    <div className="h-[3px] rounded-[2px] overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
                      <div
                        className="h-full rounded-[2px] transition-all"
                        style={{
                          width: `${progress}%`,
                          background: isOpen
                            ? 'linear-gradient(90deg, #34d399, #6ee7b7)'
                            : `linear-gradient(90deg, ${accent}, ${accent}99)`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Project description */}
                  <p className="text-xs text-[#71717a] mb-3 line-clamp-2">
                    {claim.projectDescription}
                  </p>

                  {/* Actions */}
                  {isOpen && useCase.tribeLink ? (
                    <a
                      href={useCase.tribeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-2.5 rounded-lg text-center text-sm font-semibold transition-colors"
                      style={{
                        background: 'rgba(52,211,153,0.12)',
                        color: '#34d399',
                        border: '1px solid rgba(52,211,153,0.25)',
                      }}
                    >
                      Enter tribe →
                    </a>
                  ) : !isOpen ? (
                    <a
                      href={`https://x.com/intent/tweet?text=${encodeURIComponent(`I claimed a spot in the "${useCase.tribe.name}" tribe on @Bloom__protocol! Join us:`)}&url=${encodeURIComponent(`https://bloomprotocol.ai/claim/${useCase.id}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-2.5 rounded-lg text-center text-[11px] font-medium transition-colors"
                      style={{
                        background: 'rgba(255,255,255,0.15)',
                        color: '#a1a1aa',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      Share to grow tribe →
                    </a>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* More Tribes to Claim */}
      {unclaimedUseCases.length > 0 && (
        <section className="mb-10">
          <h2
            className="text-xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}
          >
            More tribes to claim
          </h2>
          <div className="grid grid-cols-1 desktop:grid-cols-2 gap-4">
            {unclaimedUseCases.map((uc) => (
              <Link
                key={uc.id}
                href="/discover"
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white/70 hover:shadow-md transition-shadow"
              >
                <span className="text-2xl">{uc.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900">{uc.title}</h3>
                  <p className="text-xs text-gray-500 truncate">{uc.description}</p>
                </div>
                <span
                  className="text-xs text-gray-400 shrink-0"
                  style={{ fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' }}
                >
                  {uc.claimCount}/{uc.tribe.claimTarget}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Global On-Chain Identity (ERC-8004) — one identity across all tribes */}
      {tribeMemberships && tribeMemberships.length > 0 && (
        <section className="mb-10">
          <h2
            className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3"
            style={{ fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' }}
          >
            On-Chain Identity (ERC-8004)
          </h2>
          {/* Global identity card — shows minting status from first membership */}
          <GlobalIdentityCard
            memberships={tribeMemberships}
            reputation={reputation}
            identityCard={identityCard}
            identityName={identityName}
            identityTagline={identityTagline}
            agentData={agentData}
          />
          {/* Tribes joined */}
          <div className="flex flex-wrap gap-2 mt-3">
            {tribeMemberships.map((membership) => {
              const tribe = getTribeById(membership.tribeId);
              return (
                <Link
                  key={membership.id}
                  href={`/discover/${membership.tribeId}`}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 bg-white/70 text-gray-700 hover:shadow-sm transition-shadow no-underline"
                  style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                >
                  {tribe?.name ?? membership.tribeId}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Agent Capabilities — radar chart + dimension breakdown */}
      {capProfile && (
        <section className="mb-10">
          <h2
            className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3"
            style={{ fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' }}
          >
            Agent Capabilities
          </h2>
          <div className="rounded-xl border border-gray-200 bg-white/70 p-5">
            <div className="flex flex-col desktop:flex-row items-center gap-6">
              {/* Radar chart */}
              <CapabilityRadar capabilities={capProfile.capabilities} size={260} />

              {/* Dimension list */}
              <div className="flex-1 w-full">
                {capProfile.dominantCapability && (
                  <p className="text-[12px] text-gray-500 mb-3" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                    Strongest:{' '}
                    <span className="font-semibold text-gray-800">
                      {CAPABILITY_DIMENSIONS.find((d) => d.id === capProfile.dominantCapability)?.label}
                    </span>
                  </p>
                )}
                <div className="flex flex-col gap-2">
                  {capProfile.capabilities.map((cap) => (
                    <div key={cap.id} className="flex items-center gap-3">
                      <span
                        className="text-[11px] w-[72px] text-right shrink-0 text-gray-500"
                        style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
                      >
                        {cap.shortLabel}
                      </span>
                      <div className="flex-1 h-[6px] rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${cap.level}%`,
                            backgroundColor: cap.color,
                            opacity: cap.level > 0 ? 1 : 0.3,
                          }}
                        />
                      </div>
                      <span
                        className="text-[10px] w-[28px] text-right font-bold"
                        style={{
                          fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                          color: cap.level > 0 ? cap.color : '#d1d5db',
                        }}
                      >
                        {cap.level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Bloom Identity — compact, secondary */}
      <section>
        <h2
          className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3"
          style={{ fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' }}
        >
          Bloom Identity
        </h2>
        {identityName ? (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white/70">
            <div
              className="w-8 h-8 rounded-full shrink-0"
              style={{ background: 'linear-gradient(135deg, #c4a46c 0%, #d4b87c 100%)' }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{identityName}</p>
              <p className="text-xs text-gray-500 truncate">{identityTagline}</p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-dashed border-gray-200 text-center">
            <p className="text-xs text-gray-400 mb-2">Discover your agent personality</p>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-600">
              clawhub install bloom-discovery
            </code>
          </div>
        )}
      </section>

      {/* Recommended Skills — live from agent identity, no curated list TTL */}
      {agentData?.recommendations && agentData.recommendations.length > 0 && (
        <section className="mt-6">
          <h2
            className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3"
            style={{ fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' }}
          >
            Recommended Skills
          </h2>
          <div className="flex flex-col gap-2">
            {agentData.recommendations.slice(0, 5).map((rec) => (
              <a
                key={rec.skillId}
                href={isSafeUrl(rec.url) ? rec.url : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white/70 hover:shadow-sm transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{rec.skillName}</p>
                  <p className="text-xs text-gray-400 truncate">{rec.description}</p>
                </div>
                {rec.matchScore > 0 && (
                  <span className="text-xs text-[#8b5cf6] font-medium shrink-0">
                    {rec.matchScore}%
                  </span>
                )}
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ── Global Identity Card (ERC-8004) ─────────────────────────────────
// One identity, all actions recorded. SBT = verifiable resume, not badge.

const IDENTITY_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending: { label: 'PENDING', color: '#d97706', bg: 'rgba(217,119,6,0.08)', border: 'rgba(217,119,6,0.2)' },
  minting: { label: 'MINTING...', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)' },
  minted: { label: 'ACTIVE', color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
  failed: { label: 'FAILED', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
};

// Known tribe labels for reputation cards
const TRIBE_LABELS: Record<string, string> = {
  raise: 'Raise', build: 'Build', grow: 'Grow', connect: 'Connect', think: 'Think', all: 'All',
};

function formatTribeRepLines(key: string, t: TribeRepBreakdown): string[] {
  const lines: string[] = [];
  if (t.evaluations > 0) lines.push(`${t.evaluations} evals`);
  if (t.accuracy > 0) lines.push(`${t.accuracy}% accuracy`);
  if (t.citations > 0) lines.push(`cited ${t.citations}\u00D7`);
  if (t.proposalsMerged > 0) lines.push(`${t.proposalsMerged} merged`);
  if (t.proposalsSubmitted > 0 && key !== 'raise') lines.push(`${t.proposalsSubmitted} proposed`);
  if (t.votesCast > 0) lines.push(`${t.votesCast} votes`);
  if (lines.length === 0) lines.push('No activity yet');
  return lines;
}

interface GlobalIdentityCardProps {
  memberships: TribeMembership[];
  reputation?: ReputationData;
  identityCard: ReturnType<typeof useIdentityCard>;
  identityName?: string;
  identityTagline?: string;
  agentData?: ReturnType<typeof useAgentSession>['agentData'];
}

function GlobalIdentityCard({
  memberships,
  reputation,
  identityCard,
  identityName,
  identityTagline,
  agentData,
}: GlobalIdentityCardProps) {
  const [mintError, setMintError] = useState<string | null>(null);

  const minted = memberships.find((m) => m.sbtStatus === 'minted' && m.sbtTxHash);
  const primary = minted ?? memberships[0];
  const status = primary?.sbtStatus ?? 'pending';
  const config = IDENTITY_STATUS_CONFIG[status] ?? IDENTITY_STATUS_CONFIG.pending;
  const hasWallet = !!primary?.walletAddress;
  const isMinted = !!minted;
  const tribeCount = memberships.length;
  const rep = reputation ?? { total: 0, tribes: {}, linked: false };
  const tribeEntries = Object.entries(rep.tribes);

  // Determine if the on-chain contract is configured
  const hasContract = !!identityCard.contractAddress;
  const alreadyMintedOnChain = identityCard.hasMinted === true;
  const canMint = hasContract && hasWallet && !alreadyMintedOnChain && !identityCard.isMinting && status === 'pending';

  async function handleMint() {
    setMintError(null);
    try {
      const pType = agentData?.identity?.personalityType || identityName || 'Explorer';
      const tagline = agentData?.identity?.tagline || identityTagline || '';
      const desc = agentData?.identity?.description || '';
      const mainCats = agentData?.identity?.mainCategories || [];
      const subCats = agentData?.identity?.subCategories || [];
      await identityCard.mintCard(pType, tagline, desc, mainCats, subCats);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      // Show user-friendly message; avoid leaking contract internals
      setMintError(
        msg.includes('rejected') ? 'Transaction rejected by wallet'
        : msg.includes('insufficient') ? 'Insufficient funds for gas'
        : 'Mint failed — please try again',
      );
    }
  }

  return (
    <div
      className="rounded-xl border bg-white/70 overflow-hidden"
      style={{ borderColor: config.border }}
    >
      {/* Header row */}
      <div className="flex items-center gap-3 p-4">
        {/* Identity icon */}
        <div
          className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #c4a46c 0%, #a08050 100%)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>

        {/* Identity info + reputation */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900">Global Agent Identity</p>
            {rep.total > 0 && (
              <>
                <span
                  className="text-lg font-bold"
                  style={{ fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace', color: '#c4a46c' }}
                >
                  {rep.total}
                </span>
                <span className="text-[10px] text-gray-400" style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}>REP</span>
              </>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">
            {isMinted && minted?.sbtTokenId
              ? `ERC-8004 #${minted.sbtTokenId} \u00B7 ${tribeCount} tribe${tribeCount !== 1 ? 's' : ''}`
              : alreadyMintedOnChain && identityCard.tokenId
                ? `ERC-8004 #${identityCard.tokenId.toString()} \u00B7 ${tribeCount} tribe${tribeCount !== 1 ? 's' : ''}`
                : !hasWallet
                  ? `${tribeCount} tribe${tribeCount !== 1 ? 's' : ''} joined \u00B7 Add wallet to mint on-chain identity`
                  : status === 'pending'
                    ? `${tribeCount} tribe${tribeCount !== 1 ? 's' : ''} joined \u00B7 Ready to mint`
                    : status === 'failed'
                      ? 'Mint failed \u2014 retry below'
                      : 'Awaiting confirmation...'}
          </p>
        </div>

        {/* Status badge or Basescan link */}
        {isMinted && TX_HASH_RE.test(minted!.sbtTxHash ?? '') ? (
          <a
            href={`https://basescan.org/tx/${minted!.sbtTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide no-underline transition-opacity hover:opacity-80"
            style={{
              fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
              background: config.bg,
              color: config.color,
              border: `1px solid ${config.border}`,
            }}
          >
            VIEW \u2197
          </a>
        ) : (
          <span
            className="px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide"
            style={{
              fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
              background: config.bg,
              color: config.color,
              border: `1px solid ${config.border}`,
            }}
          >
            {config.label}
          </span>
        )}
      </div>

      {/* Mint CTA — shown when wallet is connected but SBT not yet minted */}
      {(canMint || status === 'failed') && (
        <div className="px-4 pb-3">
          <button
            onClick={handleMint}
            disabled={identityCard.isMinting}
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: identityCard.isMinting
                ? 'rgba(139,92,246,0.08)'
                : 'linear-gradient(135deg, #c4a46c 0%, #a08050 100%)',
              color: identityCard.isMinting ? '#8b5cf6' : '#fff',
              border: identityCard.isMinting ? '1px solid rgba(139,92,246,0.2)' : 'none',
              cursor: identityCard.isMinting ? 'wait' : 'pointer',
            }}
          >
            {identityCard.isMinting
              ? 'Minting on Base...'
              : status === 'failed'
                ? 'Retry Mint Identity SBT'
                : 'Mint Identity SBT on Base'}
          </button>
          {mintError && (
            <p className="text-[11px] text-red-500 mt-1.5 text-center">{mintError}</p>
          )}
          {identityCard.mintTxHash && TX_HASH_RE.test(identityCard.mintTxHash) && (
            <p className="text-[11px] text-gray-400 mt-1 text-center">
              <a
                href={`https://basescan.org/tx/${identityCard.mintTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8b5cf6] no-underline hover:underline"
              >
                View transaction \u2197
              </a>
            </p>
          )}
        </div>
      )}

      {/* Cross-tribe activity breakdown */}
      {tribeEntries.length > 0 && (
        <div className={`px-4 pb-4 grid gap-3 ${tribeEntries.length >= 3 ? 'grid-cols-3' : tribeEntries.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {tribeEntries.map(([key, t]) => (
            <TribeRepCard
              key={key}
              name={TRIBE_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1)}
              rep={t.rep}
              lines={formatTribeRepLines(key, t)}
            />
          ))}
        </div>
      )}

      {/* Empty reputation state */}
      {tribeEntries.length === 0 && (
        <div className="px-4 pb-4">
          {rep.linked === false ? (
            <div className="text-center">
              <p className="text-[11px] text-gray-400 italic mb-2">
                No agent linked to your account yet.
              </p>
              <p className="text-[11px] text-gray-500">
                Paste this into your AI agent to connect:
              </p>
              <code className="text-[10px] bg-gray-100 px-2 py-1 rounded font-mono text-gray-600 block mt-1">
                Join Bloom Protocol. Install the tribe skill: https://github.com/bloomprotocol/bloom-tribe-skill
              </code>
            </div>
          ) : (
            <p className="text-[11px] text-gray-400 text-center italic">
              Your agent is linked. Activity will appear as it participates in tribes.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function TribeRepCard({ name, rep, lines }: { name: string; rep: number; lines: string[] }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <div className="flex items-center justify-between mb-1">
        <span
          className="text-[11px] font-semibold text-gray-600"
          style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
        >
          {name}
        </span>
        <span
          className="text-[11px] font-bold text-gray-800"
          style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
        >
          +{rep}
        </span>
      </div>
      {lines.map((line, i) => (
        <p
          key={i}
          className="text-[10px] text-gray-400 leading-relaxed m-0"
          style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
        >
          {line}
        </p>
      ))}
    </div>
  );
}
