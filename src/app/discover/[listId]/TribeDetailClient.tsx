'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useTribeById } from '@/hooks/useTribeById';
import { useJoinTribe } from '@/hooks/useJoinTribe';
import { useAuth } from '@/lib/context/AuthContext';
import { TRIBE_COLOR } from '@/constants/tribe-definitions';
import { TRIBE_MOCK_DATA } from '@/constants/tribe-mock-data';
import { useReputation } from '@/hooks/useReputation';
import { getTierFromScore } from '@/lib/utils/tierUtils';
import TribeHeader from './TribeHeader';
import TribePlaybooksTab from './TribePlaybooksTab';
import TribeProjectsTab from './TribeProjectsTab';
import TribeFeedTab from './TribeFeedTab';
import TribeMissionsTab from './TribeMissionsTab';
import dynamic from 'next/dynamic';

const WorldIdVerify = dynamic(() => import('@/components/hackathon/WorldIdVerify'), { ssr: false });

// Fetch real community playbooks, fall back to mock
function useCommunityPlaybooks(tribeId: string) {
  const [data, setData] = useState<any[] | null>(null);
  useEffect(() => {
    fetch(`/api/tribes/${tribeId}/community-playbooks?sort=newest&limit=10`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data?.playbooks?.length > 0) {
          setData(d.data.playbooks.map((p: any) => ({
            id: p.id,
            title: p.title,
            desc: p.description || p.contentPreview || '',
            official: false,
            version: '1.0',
            running: p.runCount || 0,
            avgScore: p.avgRating || 0,
            agentReviews: [],
          })));
        }
      })
      .catch(() => {});
  }, [tribeId]);
  return data;
}

// Light theme color constants
const C = {
  bg: '#FAFAF8',
  text: '#2a2a2a',
  textMid: '#666',
  textDim: '#999',
  border: '#eee',
  cardBg: '#fff',
  accent: TRIBE_COLOR,        // '#c4a46c'
  accentText: '#8a7340',      // darkened gold — WCAG AA on light bg
};

const JOINED_KEY = 'bloom-joined-tribes';

function getJoinedTribes(): Set<string> {
  try {
    const raw = localStorage.getItem(JOINED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function markTribeJoined(tribeId: string) {
  const joined = getJoinedTribes();
  joined.add(tribeId);
  localStorage.setItem(JOINED_KEY, JSON.stringify([...joined]));
}

interface TribeDetailClientProps {
  tribeId: string;
}

export default function TribeDetailClient({ tribeId }: TribeDetailClientProps) {
  const { data: tribe, isLoading } = useTribeById(tribeId);
  const joinMutation = useJoinTribe();
  const { isAuthenticated, user } = useAuth();
  const { data: reputation } = useReputation(isAuthenticated);
  const [activeTab, setActiveTab] = useState<'playbooks' | 'missions' | 'projects' | 'feed'>('playbooks');
  const communityPlaybooks = useCommunityPlaybooks(tribeId);
  const [previouslyJoined, setPreviouslyJoined] = useState(false);
  const [showWorldIdWidget, setShowWorldIdWidget] = useState(false);
  const [buildCopied, setBuildCopied] = useState<'project' | 'skill' | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Handle postMessage from Sanctuary iframe requesting World ID verification
  const handleIframeVerified = useCallback((anonymousId: string) => {
    setShowWorldIdWidget(false);
    // Notify iframe that verification succeeded
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'sanctuary-verify-result', verified: true, anonymousId },
      '*',
    );
  }, []);

  useEffect(() => {
    if (tribeId !== 'sanctuary') return;
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'sanctuary-verify-request') {
        setShowWorldIdWidget(true);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [tribeId]);

  const mockData = TRIBE_MOCK_DATA[tribeId];

  // Derive agent tier from reputation — per-tribe if available, else total
  const agentTier = useMemo(() => {
    if (!reputation) return 'Seedling' as const;
    const tribeRep = reputation.tribes[tribeId];
    const score = tribeRep?.rep ?? reputation.total;
    return getTierFromScore(score);
  }, [reputation, tribeId]);
  const tribesLive = process.env.NEXT_PUBLIC_TRIBES_ACTIVE === 'true';
  const isForming = tribe?.status === 'forming';

  // Per-tribe tab configuration — keep it tight, no empty tabs
  const tribeTabs = useMemo(() => {
    if (tribeId === 'raise') return ['playbooks', 'projects', 'feed'] as const;
    return ['playbooks', 'missions', 'feed'] as const;
  }, [tribeId]);

  // Check localStorage for prior join
  useEffect(() => {
    setPreviouslyJoined(getJoinedTribes().has(tribeId));
  }, [tribeId]);

  // Persist join to localStorage on success
  useEffect(() => {
    if (joinMutation.isSuccess) {
      markTribeJoined(tribeId);
      setPreviouslyJoined(true);
    }
  }, [joinMutation.isSuccess, tribeId]);

  const joinState = useMemo(() => {
    if (isForming) return 'hidden' as const;
    if (joinMutation.isSuccess || previouslyJoined) return 'joined' as const;
    if (joinMutation.isPending) return 'joining' as const;
    return 'can-join' as const;
  }, [isForming, joinMutation.isSuccess, joinMutation.isPending, previouslyJoined]);


  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Loading tribe"
        style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <div
          className="animate-spin"
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: `2px solid ${C.accent}30`,
            borderTopColor: C.accent,
          }}
        />
      </div>
    );
  }

  if (!tribe) {
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '80px 14px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 16, color: C.textMid, marginBottom: 16 }}>
          Something went wrong loading this tribe.
        </p>
        <a
          href="/discover"
          style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 14, color: C.accentText }}
        >
          &larr; Back to tribes
        </a>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 24px 80px' }}>
      <TribeHeader
        tribe={tribe}
        joinState={joinState}
        accentColor={C.accent}
        accentTextColor={C.accentText}
      />

      {/* Builder CTA — Launch tribe only */}
      {tribeId !== 'sanctuary' && (
        <div style={{ margin: '20px 0 28px', borderRadius: 16, border: `1px solid ${C.border}`, background: C.cardBg, padding: '20px 20px 16px', }}>
          <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 12, textAlign: 'center' }}>
            Paste this to your AI agent:
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 10,
                background: 'rgba(0,0,0,0.02)',
                border: '1px solid rgba(0,0,0,0.06)',
                cursor: 'pointer',
              }}
              onClick={() => {
                navigator.clipboard.writeText('Read https://bloomprotocol.ai/paste-blocks/bloom-claude-code.md and help me get started with Bloom.');
                setBuildCopied('project');
                setTimeout(() => setBuildCopied(null), 2000);
              }}
              title="Click to copy"
            >
              <p style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', fontSize: 12, color: '#555', lineHeight: 1.5, margin: 0 }}>
                Read https://bloomprotocol.ai/paste-blocks/bloom-claude-code.md and help me get started with Bloom.
              </p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText('Read https://bloomprotocol.ai/paste-blocks/bloom-claude-code.md and help me get started with Bloom.');
                setBuildCopied('project');
                setTimeout(() => setBuildCopied(null), 2000);
              }}
              style={{
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: 13,
                fontWeight: 600,
                padding: '10px 18px',
                borderRadius: 10,
                border: `1px solid ${buildCopied ? '#2E8B57' : C.accent}`,
                background: buildCopied ? '#edf5f0' : 'transparent',
                color: buildCopied ? '#2E8B57' : C.accentText,
                cursor: 'pointer',
                whiteSpace: 'nowrap' as const,
              }}
            >
              {buildCopied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 12, color: C.textDim }}>
              Your agent will guide you: <strong>🚀 Project</strong> or <strong>🛠 Skill</strong>
            </span>
            <a
              href="https://github.com/bloomprotocol/bloom-tribe-skill"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', fontSize: 11, color: '#999', textDecoration: 'none' }}
            >
              GitHub →
            </a>
          </div>
        </div>
      )}

      {/* Sanctuary: 3D Zen Garden + Human Only badge */}
      {tribeId === 'sanctuary' && (
        <div style={{ marginTop: 16 }}>
          <div style={{ borderRadius: 20, overflow: 'hidden', border: `1px solid ${C.border}` }}>
            <iframe
              ref={iframeRef}
              src="/sanctuary/zen-garden.html"
              style={{ width: '100%', height: 720, border: 'none' }}
              title="Sanctuary — Zen Garden"
              allow="autoplay"
            />
          </div>
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <p style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 13,
              color: C.textDim,
              lineHeight: 1.6,
              maxWidth: 420,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}>
              Verify once with World App to unlock Sanctuary. Your reflection stays on your machine — Bloom only records an anonymous heartbeat.
            </p>
            {/* Real World ID verification widget — triggered by iframe postMessage */}
            {showWorldIdWidget && (
              <div style={{ marginTop: 16 }}>
                <WorldIdVerify userId={user?.uid} onVerified={handleIframeVerified} autoStart />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabs + Content for active tribes (when NEXT_PUBLIC_TRIBES_ACTIVE=true) */}
      {tribeId !== 'sanctuary' && !isForming && tribesLive && (
        <>
          {/* Tab Pills — first tab is default active */}
          <div
            style={{
              display: 'flex',
              gap: 32,
              justifyContent: 'center',
              marginBottom: 28,
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            {tribeTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  fontSize: 16,
                  fontWeight: activeTab === tab ? 600 : 400,
                  padding: '12px 6px',
                  border: 'none',
                  cursor: 'pointer',
                  background: 'transparent',
                  color: activeTab === tab ? C.text : C.textDim,
                  borderBottom: activeTab === tab
                    ? `2px solid ${C.accent}`
                    : '2px solid transparent',
                  transition: 'color 0.15s',
                  textTransform: 'capitalize',
                  marginBottom: -1,
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'playbooks' && (
            <TribePlaybooksTab
              playbooks={[...(mockData?.playbooks ?? []), ...(communityPlaybooks ?? [])]}
              tribeColor={C.accent}
              isAuthenticated={isAuthenticated}
              agentTier={agentTier}
            />
          )}
          {activeTab === 'missions' && (
            <TribeMissionsTab
              tribeId={tribeId}
              tribeColor={C.accent}
              isAuthenticated={isAuthenticated}
            />
          )}
          {activeTab === 'projects' && (
            <TribeProjectsTab
              tribeId={tribeId}
              tribeColor={C.accent}
            />
          )}
          {activeTab === 'feed' && (
            <TribeFeedTab
              tribeId={tribeId}
              mockPosts={mockData?.feed ?? []}
              tribeColor={C.accent}
              isAuthenticated={isAuthenticated}
            />
          )}
        </>
      )}

      {/* Coming Soon state — tribes visible but tabs not yet live */}
      {!isForming && !tribesLive && (
        <div style={{ textAlign: 'center', marginTop: 40, padding: '0 20px' }}>
          <p
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 20,
              fontWeight: 600,
              color: C.accentText,
              marginBottom: 12,
            }}
          >
            Coming Soon
          </p>
          <p
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 14,
              color: C.textDim,
              lineHeight: 1.6,
              maxWidth: 400,
              margin: '0 auto',
            }}
          >
            Playbooks, evaluations, and tribe activities are launching soon.
            Follow us on X for updates.
          </p>
        </div>
      )}

      {/* Forming state */}
      {isForming && (
        <div style={{ textAlign: 'center', marginTop: 40, padding: '0 20px' }}>
          <p
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 20,
              fontWeight: 600,
              color: C.accentText,
              marginBottom: 12,
            }}
          >
            This tribe is forming
          </p>
          <p
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 14,
              color: C.textDim,
              lineHeight: 1.6,
              maxWidth: 400,
              margin: '0 auto',
            }}
          >
            Be the first to join when it opens. We&apos;re gathering interest and shaping what this
            tribe will become.
          </p>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: 48, paddingBottom: 20 }}>
        <p
          style={{
            fontFamily: 'var(--font-newsreader), serif',
            fontSize: 12,
            fontStyle: 'italic',
            color: '#bbb',
            margin: 0,
          }}
        >
          Your agent grows stronger here — so you thrive out there.
        </p>
      </div>
    </div>
  );
}
