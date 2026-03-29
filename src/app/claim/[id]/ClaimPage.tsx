'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useV4UseCaseById } from '@/hooks/useV4UseCaseById';
import { useClaimFlow } from '@/hooks/useClaimFlow';
import ClaimResult from '@/app/discover/ClaimResult';
import type { UseCase } from '@/constants/v4-use-case-definitions';

const AGENT_ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

function isSafeReturnUrl(url: string): boolean {
  if (url.startsWith('//') || url.includes('://')) {
    try {
      const parsed = new URL(url, window.location.origin);
      return parsed.origin === window.location.origin;
    } catch {
      return false;
    }
  }
  return true;
}

interface ClaimPageProps {
  useCaseId: string;
}

function ClaimPageInner({ useCaseId }: ClaimPageProps) {
  const searchParams = useSearchParams();
  const rawReturnUrl = searchParams.get('returnUrl');
  const returnUrl = rawReturnUrl && isSafeReturnUrl(rawReturnUrl) ? rawReturnUrl : null;
  const rawAgentId = searchParams.get('agentId');
  const agentId = rawAgentId && AGENT_ID_PATTERN.test(rawAgentId) ? rawAgentId : null;

  const { data: useCase, isLoading } = useV4UseCaseById(useCaseId);

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <div className="w-10 h-10 border-[3px] border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500">Loading use case...</p>
      </div>
    );
  }

  if (!useCase) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <h1
          className="text-2xl font-bold text-gray-900 mb-4"
          style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
        >
          Use Case Not Found
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          This use case doesn&apos;t exist or has been removed.
        </p>
        <Link href="/discover" className="text-gray-600 hover:underline">
          Browse all use cases →
        </Link>
      </div>
    );
  }

  if (useCase.status === 'soon') {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <span className="text-4xl block mb-4">{useCase.icon}</span>
        <h1
          className="text-2xl font-bold text-gray-900 mb-3"
          style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
        >
          {useCase.title}
        </h1>
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
        <p className="text-sm text-gray-500 mb-6">{useCase.description}</p>
        <Link href="/discover" className="text-gray-600 hover:underline">
          Browse available use cases →
        </Link>
      </div>
    );
  }

  return (
    <ClaimPageWithFlow
      useCase={useCase}
      returnUrl={returnUrl}
      agentId={agentId}
    />
  );
}

function ClaimPageWithFlow({
  useCase,
  returnUrl,
  agentId,
}: {
  useCase: UseCase;
  returnUrl: string | null;
  agentId: string | null;
}) {
  const flow = useClaimFlow(useCase);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(copyTimerRef.current), []);

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

  return (
    <div className="max-w-lg mx-auto py-8">
      {/* Trust bar */}
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
        <Image
          src="https://statics.bloomprotocol.ai/logo/bp_logo_icon.svg"
          alt="Bloom Protocol"
          width={24}
          height={24}
        />
        <span className="text-sm text-gray-600">
          Bloom Protocol — Agent Use Case Discovery
        </span>
        <Link href="/discover" className="text-xs text-gray-500 hover:text-gray-900 ml-auto">
          Browse all →
        </Link>
      </div>

      {agentId && (
        <div className="mb-4 p-3 rounded-xl bg-gray-50 border border-gray-200">
          <p className="text-xs text-gray-600">
            Claiming via agent{' '}
            <span
              className="font-semibold"
              style={{ fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' }}
            >
              {agentId}
            </span>
          </p>
        </div>
      )}

      {flow.step === 'claiming' && (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-[3px] border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">Recording your claim...</p>
        </div>
      )}

      {flow.step === 'success' && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 p-8 shadow-sm">
          <ClaimResult
            variant="success"
            useCase={useCase}
            remaining={flow.remaining}
            willOpen={flow.willOpen}
            shareText={flow.shareText}
            shareUrl={flow.shareUrl}
            onDone={() => {
              if (returnUrl) window.location.href = returnUrl;
            }}
            doneLabel={returnUrl ? 'Return to Agent' : 'Browse More Use Cases'}
            doneHref={returnUrl ? undefined : '/discover'}
          />
        </div>
      )}

      {flow.step === 'error' && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 p-8 shadow-sm">
          <ClaimResult
            variant="error"
            errorMsg={flow.errorMsg}
            onRetry={flow.reset}
          />
        </div>
      )}

      {(flow.step === 'detail' || flow.step === 'form') && (
        <>
          {/* Use case info */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{useCase.icon}</span>
              <span
                className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide"
                style={{ fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' }}
              >
                BLOOM VERIFIED
              </span>
            </div>

            <h1
              className="text-2xl font-bold text-gray-900 mb-2"
              style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}
            >
              {useCase.title}
            </h1>
            <p className="text-sm text-gray-600 mb-4">
              {useCase.description}
            </p>

            {/* Skills */}
            <div className="mb-4">
              {useCase.skills.map((skill) => (
                <div key={skill.name} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm text-gray-800">{skill.name}</p>
                    <p className="text-xs text-gray-500">{skill.description}</p>
                  </div>
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ml-2"
                    style={{
                      fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                      background: skill.required ? 'rgba(167,139,250,0.1)' : 'rgba(0,0,0,0.04)',
                      color: skill.required ? '#a78bfa' : '#a1a1aa',
                    }}
                  >
                    {skill.required ? 'REQUIRED' : 'OPTIONAL'}
                  </span>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{useCase.tribe.name}</span>
                <span
                  style={{ fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' }}
                >
                  {useCase.claimCount}/{useCase.tribe.claimTarget}
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gray-900 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Paste block */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="text-xs font-bold text-gray-400 uppercase tracking-wider"
                  style={{ fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' }}
                >
                  Paste Block
                </span>
                <button
                  onClick={handleCopy}
                  className="text-xs font-medium px-3 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div
                className="rounded-xl p-3 overflow-auto text-[11px] leading-[1.6] max-h-36"
                style={{
                  fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                  background: '#08080c',
                  color: '#a1a1aa',
                }}
              >
                <pre className="whitespace-pre-wrap">{useCase.pasteConfig}</pre>
              </div>
            </div>
          </div>

          {/* Claim form */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2
              className="text-lg font-bold text-gray-900 mb-4"
              style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}
            >
              Claim your spot
            </h2>

            {/* What are you building? */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                What are you building?
                <span className="text-gray-400 font-normal ml-1">(50 chars min)</span>
              </label>
              <textarea
                value={flow.projectDescription}
                onChange={(e) => flow.setProjectDescription(e.target.value)}
                placeholder="Describe your project and how you'll use these skills..."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-none"
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

            {/* X handle */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                X handle <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={flow.xHandle}
                onChange={(e) => flow.setXHandle(e.target.value)}
                placeholder="@yourhandle"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
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
            >
              Claim with Wallet — $0.50 USDC
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function ClaimPage({ useCaseId }: ClaimPageProps) {
  return <ClaimPageInner useCaseId={useCaseId} />;
}
