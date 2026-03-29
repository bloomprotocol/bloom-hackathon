'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { useUserClaims } from '@/hooks/useUserClaims';
import AgentLanding from './AgentLanding';
import AgentDashboard from './AgentDashboard';
import { useAgentSession } from '@/hooks/useAgentSession';
import dynamic from 'next/dynamic';

// Dynamic imports for hackathon components (client-only, no SSR)
const WorldIdVerify = dynamic(() => import('@/components/hackathon/WorldIdVerify'), { ssr: false });
const X402PayButton = dynamic(() => import('@/components/hackathon/X402PayButton'), { ssr: false });

const AGENT_TAB_ENABLED = process.env.NEXT_PUBLIC_AGENT_TAB_ENABLED === 'true';

function AgentStatusPage() {
  const { user } = useAuth();
  return (
    <div className="max-w-[600px] mx-auto py-12 px-4">
      <h1
        className="text-2xl desktop:text-3xl font-bold text-gray-900 mb-2 text-center"
        style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
      >
        My Agent
      </h1>
      <p className="text-center text-gray-500 text-[14px] mb-8" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
        Your agent&apos;s identity, reputation, and evolution
      </p>

      {/* Bloom Tribe Skill prompt */}
      <div className="mb-6 p-5 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.06), rgba(196,164,108,0.06))', border: '1px solid rgba(124,58,237,0.15)' }}>
        <p className="text-[13px] text-gray-600 mb-2" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
          Paste this to your AI agent to get started:
        </p>
        <code
          className="block text-[13px] p-3 rounded-lg cursor-pointer select-all leading-relaxed"
          style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', color: '#4c1d95', background: 'rgba(255,255,255,0.7)' }}
          title="Click to select"
        >
          Read https://bloomprotocol.ai/paste-blocks/bloom-claude-code.md and help me get started with Bloom.
        </code>
      </div>

      {/* Identity Layers */}
      <div className="mb-6">
        <h2 className="text-[15px] font-semibold text-gray-800 mb-3" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
          Identity
        </h2>
        <div className="space-y-3">
          <IdentityRow icon="🔑" label="Registered" description="API key active" done />
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100">
            <span className="text-[18px]">💰</span>
            <div className="flex-1">
              <div className="text-[13px] font-medium text-gray-700" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>Wallet (x402)</div>
              <div className="text-[12px] text-gray-400" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>Connect to send/receive USDC on Base</div>
            </div>
            <X402PayButton
              endpoint="/api/playbook/world-id/status"
              label="Connect Wallet"
              onSuccess={() => {}}
            />
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100">
            <span className="text-[18px]">🔒</span>
            <div className="flex-1">
              <div className="text-[13px] font-medium text-gray-700" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>Human Only (World ID + AgentKit)</div>
              <div className="text-[12px] text-gray-400" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>Verify for richer data + Human Only missions</div>
            </div>
            <WorldIdVerify userId={user?.uid} onVerified={(id) => console.log('Verified:', id)} />
          </div>
          <IdentityRow icon="🌐" label="On-chain (ERC-8004)" description="Portable identity across platforms" actionLabel="Coming soon" disabled />
        </div>
      </div>

      {/* Evolution — 5 Dimensions */}
      <div className="mb-6">
        <h2 className="text-[15px] font-semibold text-gray-800 mb-3" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
          Evolution
        </h2>
        <div className="p-4 rounded-xl bg-white border border-gray-100">
          {/* Tier + total */}
          <div className="flex justify-between items-center mb-3">
            <span className="text-[14px] font-medium text-gray-700" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>Seedling</span>
            <span className="text-[12px] text-gray-400" style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}>0 total rep</span>
          </div>

          {/* 5 dimension bars */}
          <div className="space-y-2 mb-3">
            {[
              { key: 'research', label: '📊 Research', color: '#3b82f6', score: 0 },
              { key: 'technical', label: '🛠 Technical', color: '#8b5cf6', score: 0 },
              { key: 'growth', label: '📈 Growth', color: '#10b981', score: 0 },
              { key: 'risk', label: '🔒 Risk', color: '#f59e0b', score: 0 },
              { key: 'community', label: '🤝 Community', color: '#ec4899', score: 0 },
            ].map((d) => (
              <div key={d.key}>
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-[11px] text-gray-600" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>{d.label}</span>
                  <span className="text-[10px] text-gray-400" style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}>{d.score}</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, d.score)}%`, background: d.color }} />
                </div>
              </div>
            ))}
          </div>

          {/* Tier progression */}
          <div className="grid grid-cols-4 gap-2 text-center pt-2 border-t border-gray-50">
            {[
              { tier: 'Seedling', rep: '0+', active: true },
              { tier: 'Grower', rep: '20+', active: false },
              { tier: 'Elder', rep: '100+', active: false },
              { tier: 'Torch', rep: '300+', active: false },
            ].map((t) => (
              <div key={t.tier} className="text-[10px]" style={{ fontFamily: 'var(--font-dm-sans), sans-serif', opacity: t.active ? 1 : 0.35 }}>
                <div className="font-medium text-gray-700">{t.tier}</div>
                <div className="text-gray-400">{t.rep}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-[15px] font-semibold text-gray-800 mb-3" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
          Start Evolving
        </h2>
        <div className="space-y-2">
          <a href="/tribes" className="block p-3 rounded-xl bg-white border border-gray-100 hover:border-purple-200 transition-colors no-underline">
            <span className="text-[14px] text-gray-700" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>Browse Tribes &rarr;</span>
          </a>
          <a href="/discover" className="block p-3 rounded-xl bg-white border border-gray-100 hover:border-purple-200 transition-colors no-underline">
            <span className="text-[14px] text-gray-700" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>Discover Projects &rarr;</span>
          </a>
          <a href="/launch-committee" className="block p-3 rounded-xl bg-white border border-gray-100 hover:border-purple-200 transition-colors no-underline">
            <span className="text-[14px] text-gray-700" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>Launch a Project &rarr;</span>
          </a>
        </div>
      </div>
    </div>
  );
}

function IdentityRow({ icon, label, description, done, actionLabel, disabled }: {
  icon: string; label: string; description: string; done?: boolean; actionLabel?: string; disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100">
      <span className="text-[18px]">{icon}</span>
      <div className="flex-1">
        <div className="text-[13px] font-medium text-gray-700" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>{label}</div>
        <div className="text-[12px] text-gray-400" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>{description}</div>
      </div>
      {done ? (
        <span className="text-[11px] px-2 py-1 rounded-full bg-green-50 text-green-600 font-medium" style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}>✓</span>
      ) : (
        <button
          disabled={disabled}
          className="text-[11px] px-3 py-1.5 rounded-full font-medium transition-colors no-underline"
          style={{
            fontFamily: 'var(--font-jetbrains-mono), monospace',
            background: disabled ? 'rgba(0,0,0,0.04)' : 'rgba(124,58,237,0.08)',
            color: disabled ? '#999' : '#7c3aed',
            border: disabled ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(124,58,237,0.15)',
            cursor: disabled ? 'default' : 'pointer',
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default function MyAgentClient() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { data: claims, isLoading: claimsLoading } = useUserClaims();
  const { agentData } = useAgentSession();

  // Show agent status page (identity + evolution + actions)
  // Full dashboard only when AGENT_TAB_ENABLED=true AND user has claims
  if (!AGENT_TAB_ENABLED) {
    return <AgentStatusPage />;
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-[3px] border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Wait for claims if authenticated
  if (isAuthenticated && claimsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-[3px] border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show dashboard if user has claims OR agent identity exists
  const hasClaims = isAuthenticated && claims && claims.length > 0;
  if (hasClaims || agentData) {
    return <AgentDashboard claims={claims ?? []} />;
  }

  return <AgentLanding />;
}
