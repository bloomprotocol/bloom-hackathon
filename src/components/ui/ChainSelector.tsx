'use client';

import { useId } from 'react';

export type Chain = 'base' | 'solana';

interface ChainSelectorProps {
  selected: Chain;
  onChange: (chain: Chain) => void;
  /** Compact mode shows only icons (for mobile floating cart) */
  compact?: boolean;
  /** Disable switching (e.g. during active deposit) */
  disabled?: boolean;
}

// Chain icons as functions to accept unique gradient IDs
function BaseIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="#0052FF" />
      <path
        d="M12 21.5c5.247 0 9.5-4.253 9.5-9.5S17.247 2.5 12 2.5 2.5 6.753 2.5 12s4.253 9.5 9.5 9.5Z"
        fill="#0052FF"
      />
      <path
        d="M11.93 18.5c3.59 0 6.5-2.91 6.5-6.5S15.52 5.5 11.93 5.5 5.43 8.41 5.43 12c0 3.04 2.09 5.59 4.91 6.3v-4.46H8.5V12h1.84v-1.41c0-1.82 1.08-2.82 2.74-2.82.79 0 1.62.14 1.62.14v1.78h-.91c-.9 0-1.18.56-1.18 1.13V12h2.01l-.32 1.84h-1.69v4.46c2.82-.71 4.91-3.26 4.91-6.3"
        fill="white"
      />
    </svg>
  );
}

function SolanaIcon({ gradientId }: { gradientId: string }) {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill={`url(#${gradientId})`} />
      <path
        d="M7.5 15.2a.4.4 0 01.28-.12h10.6a.2.2 0 01.14.34l-2.02 2.02a.4.4 0 01-.28.12H5.62a.2.2 0 01-.14-.34l2.02-2.02zM7.5 6.56a.41.41 0 01.28-.12h10.6a.2.2 0 01.14.34l-2.02 2.02a.4.4 0 01-.28.12H5.62a.2.2 0 01-.14-.34L7.5 6.56zM16.5 10.84a.4.4 0 00-.28-.12H5.62a.2.2 0 00-.14.34l2.02 2.02a.4.4 0 00.28.12h10.6a.2.2 0 00.14-.34l-2.02-2.02z"
        fill="white"
      />
      <defs>
        <linearGradient id={gradientId} x1="0" y1="24" x2="24" y2="0">
          <stop stopColor="#9945FF" />
          <stop offset="0.5" stopColor="#14F195" />
          <stop offset="1" stopColor="#00D18C" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const CHAINS: { id: Chain; label: string }[] = [
  { id: 'base', label: 'Base' },
  { id: 'solana', label: 'Solana' },
];

export default function ChainSelector({
  selected,
  onChange,
  compact = false,
  disabled = false,
}: ChainSelectorProps) {
  const uid = useId();
  const solGradId = `solGrad-${uid}`;

  return (
    <div className={`flex items-center gap-1.5 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {!compact && (
        <span className="font-['Outfit'] text-xs text-[#9ca3af] shrink-0">
          Pay with
        </span>
      )}
      <div className="flex gap-1">
        {CHAINS.map((chain) => {
          const isSelected = selected === chain.id;
          return (
            <button
              key={chain.id}
              onClick={() => onChange(chain.id)}
              disabled={disabled}
              className={`inline-flex items-center gap-1.5 rounded-lg transition-all ${
                compact ? 'px-2 py-1.5' : 'px-2.5 py-1.5'
              } ${
                isSelected
                  ? 'bg-gradient-to-r from-[#7c3aed]/10 to-[#8b5cf6]/10 border border-[#8b5cf6]/30 shadow-sm'
                  : 'bg-white/30 border border-white/40 hover:bg-white/50'
              }`}
            >
              {chain.id === 'base' ? <BaseIcon /> : <SolanaIcon gradientId={solGradId} />}
              {!compact && (
                <span
                  className={`font-['Outfit'] text-xs font-medium ${
                    isSelected ? 'text-[#7c3aed]' : 'text-[#696f8c]'
                  }`}
                >
                  {chain.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
