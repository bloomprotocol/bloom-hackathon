'use client';

import Link from 'next/link';
import type { UseCase } from '@/constants/v4-use-case-definitions';

type SuccessProps = {
  variant: 'success';
  useCase: UseCase;
  remaining: number;
  willOpen: boolean;
  shareText: string;
  shareUrl: string;
  onDone: () => void;
  doneLabel?: string;
  doneHref?: string;
};

type ErrorProps = {
  variant: 'error';
  errorMsg?: string;
  onRetry: () => void;
};

type ClaimResultProps = SuccessProps | ErrorProps;

export default function ClaimResult(props: ClaimResultProps) {
  if (props.variant === 'error') {
    return (
      <div className="text-center py-6">
        <div className="text-3xl mb-3">⚠️</div>
        <p className="text-sm text-gray-700 mb-4">
          {props.errorMsg || 'Something went wrong. Please try again later.'}
        </p>
        <button
          onClick={props.onRetry}
          className="px-6 py-2.5 rounded-xl bg-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-300"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { useCase, remaining, willOpen, shareText, shareUrl, onDone, doneLabel, doneHref } = props;

  return (
    <div className="text-center py-6">
      <div className="text-4xl mb-3">🎉</div>
      <h3
        className="text-lg font-semibold text-gray-900 mb-2"
        style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}
      >
        Spot claimed!
      </h3>
      {willOpen ? (
        <p className="text-sm text-green-700 mb-4">
          The {useCase.tribe.name} tribe is now open!
          {useCase.tribeLink && (
            <>
              {' '}
              <a
                href={useCase.tribeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-green-900"
              >
                Enter tribe →
              </a>
            </>
          )}
        </p>
      ) : (
        <p className="text-sm text-gray-600 mb-4">
          {remaining} more claims needed to open the {useCase.tribe.name} tribe ({useCase.tribe.claimTarget} total).
        </p>
      )}
      <p className="text-xs text-gray-400 mb-6">
        Share to help reach the {useCase.tribe.claimTarget}-member threshold faster.
      </p>
      <div className="flex flex-col gap-2">
        <a
          href={`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 text-center"
        >
          Share on X — grow the tribe
        </a>
        {doneHref ? (
          <Link
            href={doneHref}
            className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 text-center"
          >
            {doneLabel || 'Browse More Use Cases'}
          </Link>
        ) : (
          <button
            onClick={onDone}
            className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50"
          >
            {doneLabel || 'Done'}
          </button>
        )}
      </div>
    </div>
  );
}
