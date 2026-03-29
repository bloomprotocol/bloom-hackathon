'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { UseCase } from '@/constants/v4-use-case-definitions';
import { useClaimFlow } from '@/hooks/useClaimFlow';
import ClaimResult from './ClaimResult';

// Map use case IDs to playbook page slugs
const PLAYBOOK_SLUG_MAP: Record<string, string> = {
  geo: 'geo-content-marketing',
  'find-skills': 'find-skills',
};

interface V4ClaimModalProps {
  useCase: UseCase;
  isOpen: boolean;
  onClose: () => void;
}

const THEME_ACCENT: Record<UseCase['color'], string> = {
  purple: '#a78bfa',
  amber: '#fbbf24',
};

export default function V4ClaimModal({ useCase, isOpen, onClose }: V4ClaimModalProps) {
  const isSoon = useCase.status === 'soon';
  const flow = useClaimFlow(useCase);
  const [copied, setCopied] = useState(false);
  const [pasteExpanded, setPasteExpanded] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const accent = THEME_ACCENT[useCase.color];
  const progress = useCase.tribe.claimTarget > 0
    ? Math.min((useCase.claimCount / useCase.tribe.claimTarget) * 100, 100)
    : 0;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(useCase.pasteConfig);
      setCopied(true);
      clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = useCase.pasteConfig;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    }
  }, [useCase.pasteConfig]);

  // Cleanup copy timer
  useEffect(() => () => clearTimeout(copyTimerRef.current), []);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  // Truncate paste block preview to first 6 lines
  const pasteLines = useCase.pasteConfig.split('\n');
  const pastePreview = pasteLines.slice(0, 6).join('\n') + (pasteLines.length > 6 ? '\n...' : '');

  // Short description (first sentence or first 120 chars)
  const shortDesc = useCase.description.length > 120
    ? useCase.description.slice(0, useCase.description.indexOf('.', 60) + 1 || 120)
    : useCase.description;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end desktop:items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[rgba(8,8,12,0.7)] backdrop-blur-sm" />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="claim-modal-title"
        className="relative bg-white w-full max-w-[720px] max-h-[92vh] overflow-y-auto rounded-t-[20px] desktop:rounded-[20px] shadow-2xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-lg transition-colors"
        >
          ×
        </button>

        {/* ─── Coming Soon state ─── */}
        {isSoon && (
          <div className="p-8 desktop:p-10 text-center">
            <span className="text-4xl block mb-4">{useCase.icon}</span>
            <h2
              id="claim-modal-title"
              className="text-xl desktop:text-2xl font-bold text-gray-900 mb-3"
              style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
            >
              {useCase.title}
            </h2>
            <span
              className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide mb-4"
              style={{
                fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                background: 'rgba(167,139,250,0.1)',
                color: '#a78bfa',
              }}
            >
              COMING SOON
            </span>
            <p
              className="text-sm text-gray-500 leading-relaxed max-w-md mx-auto mb-6"
              style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
            >
              {useCase.description}
            </p>
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {useCase.skills.map((skill) => (
                <span
                  key={skill.name}
                  className="px-3 py-1 rounded-full text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200"
                  style={{ fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' }}
                >
                  {skill.name}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-400">
              We&apos;re researching this use case. Follow{' '}
              <a
                href="https://x.com/Bloom__protocol"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 underline hover:text-gray-700"
              >
                @bloom__protocol
              </a>{' '}
              for updates.
            </p>
          </div>
        )}

        {!isSoon && flow.step === 'claiming' && (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-[3px] border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: accent, borderTopColor: 'transparent' }} />
            <p className="text-sm text-gray-500">Recording your claim...</p>
          </div>
        )}

        {!isSoon && flow.step === 'success' && (
          <div className="p-8 desktop:p-10">
            <ClaimResult
              variant="success"
              useCase={useCase}
              remaining={flow.remaining}
              willOpen={flow.willOpen}
              shareText={flow.shareText}
              shareUrl={flow.shareUrl}
              onDone={onClose}
            />
          </div>
        )}

        {!isSoon && flow.step === 'error' && (
          <div className="p-8 desktop:p-10">
            <ClaimResult
              variant="error"
              errorMsg={flow.errorMsg}
              onRetry={flow.reset}
            />
          </div>
        )}

        {!isSoon && (flow.step === 'detail' || flow.step === 'form') && (
          <div className="p-6 desktop:p-10 pt-2">

            {/* ─── 1. Header ─── */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{useCase.icon}</span>
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide"
                  style={{
                    fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                    background: `${accent}15`,
                    color: accent,
                  }}
                >
                  BLOOM VERIFIED
                </span>
              </div>
              <h2
                id="claim-modal-title"
                className="text-xl desktop:text-2xl font-bold text-gray-900 mb-2"
                style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
              >
                {useCase.title}
              </h2>
              <p
                className="text-sm text-gray-500 leading-relaxed"
                style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
              >
                {shortDesc}
              </p>
            </div>

            {/* ─── 2. Configuration ─── */}
            <div className="mb-6">
              <h3
                className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-3"
                style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
              >
                Configuration
              </h3>
              <div className="space-y-2">
                {useCase.skills.map((skill) => (
                  <div key={skill.name} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className="text-sm font-medium text-gray-800"
                          style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                        >
                          {skill.name}
                        </span>
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={{
                            fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                            background: skill.required ? `${accent}15` : 'rgba(0,0,0,0.04)',
                            color: skill.required ? accent : '#a1a1aa',
                          }}
                        >
                          {skill.required ? 'REQUIRED' : 'OPTIONAL'}
                        </span>
                      </div>
                      <p
                        className="text-xs text-gray-500"
                        style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                      >
                        {skill.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── 3. Claim Section (moved up) ─── */}
            <div className="mb-6 p-5 rounded-2xl bg-gray-50/80 border border-gray-100">
              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="text-xs font-medium text-gray-500"
                    style={{ fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' }}
                  >
                    {useCase.tribe.name}
                  </span>
                  <span
                    className="text-xs text-gray-400"
                    style={{ fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' }}
                  >
                    {useCase.claimCount}/{useCase.tribe.claimTarget}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${progress}%`, background: accent }}
                  />
                </div>
              </div>

              {/* What are you building? */}
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                  style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                >
                  What are you building?
                  <span className="text-gray-400 font-normal ml-1">(50 chars min)</span>
                </label>
                <textarea
                  value={flow.projectDescription}
                  onChange={(e) => flow.setProjectDescription(e.target.value)}
                  placeholder="Describe your project and how you'll use these skills..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-none"
                  style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                  rows={3}
                  maxLength={2000}
                />
                <div className="flex justify-end mt-1">
                  <span
                    className={`text-[11px] ${
                      flow.projectDescription.trim().length >= 50 ? 'text-green-600' : 'text-gray-400'
                    }`}
                    style={{ fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' }}
                  >
                    {flow.projectDescription.trim().length}/50
                  </span>
                </div>
              </div>

              {/* X Handle (optional) */}
              <div className="mb-5">
                <label
                  className="block text-xs font-medium text-gray-500 mb-1.5"
                  style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                >
                  X handle <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={flow.xHandle}
                  onChange={(e) => flow.setXHandle(e.target.value)}
                  placeholder="@yourhandle"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                  maxLength={50}
                />
              </div>

              {/* Claim buttons */}
              <button
                onClick={flow.handleEmailClaim}
                disabled={!flow.isProjectValid}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors mb-3 ${
                  flow.isProjectValid
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
              >
                Claim with Email — free
              </button>

              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <button
                onClick={flow.handleWalletClaim}
                disabled={!flow.isProjectValid}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors border ${
                  flow.isProjectValid
                    ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    : 'border-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
              >
                Claim with Wallet — $0.50 USDC
              </button>

              {/* Agent install hint */}
              <p className="text-center mt-3">
                <span
                  className="text-[11px] text-gray-400"
                  style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                >
                  Or install{' '}
                </span>
                <code
                  className="text-[11px] px-1.5 py-0.5 rounded"
                  style={{
                    fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                    background: 'rgba(22,163,74,0.08)',
                    color: '#16a34a',
                  }}
                >
                  bloom-tribe
                </code>
                <span
                  className="text-[11px] text-gray-400"
                  style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                >
                  {' '}to claim via agent
                </span>
              </p>
            </div>

            {/* ─── Separator ─── */}
            <div className="h-px bg-gray-100 my-6" />

            {/* ─── 4. Paste Block (collapsed by default) ─── */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <h3
                    className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]"
                    style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                  >
                    AGENTS.md Paste Block
                  </h3>
                  {PLAYBOOK_SLUG_MAP[useCase.id] && (
                    <Link
                      href={`/playbooks/${PLAYBOOK_SLUG_MAP[useCase.id]}`}
                      className="text-[11px] font-medium text-purple-400 hover:text-purple-600 transition-colors"
                      style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                    >
                      Full guide &rarr;
                    </Link>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPasteExpanded(!pasteExpanded)}
                    className="text-[11px] font-medium text-gray-400 hover:text-gray-600 transition-colors"
                    style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                  >
                    {pasteExpanded ? 'Collapse' : 'Show full preview'}
                  </button>
                  <button
                    onClick={handleCopy}
                    className="text-xs font-medium px-3 py-1 rounded-lg transition-colors"
                    style={{
                      background: copied ? '#dcfce7' : 'rgba(0,0,0,0.04)',
                      color: copied ? '#16a34a' : '#71717a',
                    }}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <div
                className="rounded-xl p-4 overflow-x-auto text-[13px] leading-[1.6]"
                style={{
                  fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                  background: '#08080c',
                  color: '#a1a1aa',
                  maxHeight: pasteExpanded ? 'none' : '160px',
                  overflow: pasteExpanded ? 'visible' : 'hidden',
                }}
              >
                <pre className="whitespace-pre-wrap">
                  {pasteExpanded ? useCase.pasteConfig : pastePreview}
                </pre>
              </div>
            </div>

            {/* ─── 5. Before vs After (side-by-side grid) ─── */}
            {useCase.web2Comparison.length > 0 && (
              <div className="mb-6">
                <h3
                  className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-3"
                  style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                >
                  Before vs After
                </h3>
                <div className="rounded-xl overflow-hidden border border-gray-100">
                  {/* Column headers */}
                  <div className="grid grid-cols-2 bg-gray-50">
                    <div className="px-4 py-2 border-r border-gray-100">
                      <span
                        className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider"
                        style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                      >
                        Before
                      </span>
                    </div>
                    <div className="px-4 py-2">
                      <span
                        className="text-[10px] font-semibold uppercase tracking-wider"
                        style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif', color: accent }}
                      >
                        After
                      </span>
                    </div>
                  </div>
                  {/* Rows */}
                  {useCase.web2Comparison.map((comp, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-2 border-t border-gray-100"
                    >
                      <div className="px-4 py-3 border-r border-gray-100">
                        <span
                          className="text-[13px] text-gray-500 leading-relaxed"
                          style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                        >
                          {comp.before}
                        </span>
                      </div>
                      <div className="px-4 py-3">
                        <span
                          className="text-[13px] text-gray-700 leading-relaxed"
                          style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                        >
                          {comp.after}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── 6. Research Basis ─── */}
            {useCase.methodology.keyStats.length > 0 && (
              <div className="mb-4 p-4 rounded-xl bg-gray-50">
                <h3
                  className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-2"
                  style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                >
                  Research basis
                </h3>
                <ul className="space-y-1">
                  {useCase.methodology.keyStats.map((stat, i) => (
                    <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                      <span className="text-gray-300 mt-0.5">•</span>
                      <span style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>{stat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Copy skills text link */}
            <div className="text-center pt-2">
              <button
                onClick={handleCopy}
                className="text-[13px] font-medium transition-colors hover:opacity-80"
                style={{
                  fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif',
                  color: accent,
                }}
              >
                {copied ? 'Copied to clipboard!' : 'Copy skills to your agent →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
