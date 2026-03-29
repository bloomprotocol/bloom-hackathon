'use client';

import { useState } from 'react';
import ChainSelector from '@/components/ui/ChainSelector';
import type { Chain } from '@/components/ui/ChainSelector';
import type { CartItem } from './SkillsPageClient';

interface BackCartProps {
  items: CartItem[];
  onRemove: (slug: string) => void;
  onBackAll: () => void;
  isTransferring: boolean;
  variant?: 'sidebar' | 'floating';
  chain: Chain;
  onChainChange: (chain: Chain) => void;
}

export default function BackCart({ items, onRemove, onBackAll, isTransferring, variant = 'sidebar', chain, onChainChange }: BackCartProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const total = items.reduce((sum, item) => sum + item.amount, 0).toFixed(2);

  // Sidebar variant — always visible, vertical layout
  if (variant === 'sidebar') {
    return (
      <div
        className="relative rounded-[20px] overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(245,240,255,0.35) 100%)',
          border: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 4px 24px rgba(100,80,150,0.08), inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(150,130,200,0.06)',
          backdropFilter: 'blur(24px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.2)',
        }}
      >

        <div className="relative z-10">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-purple-100/30">
          <h3 className="font-['Outfit'] text-[15px] font-semibold" style={{ color: '#1a1228' }}>
            Your Cart
          </h3>
        </div>

        {/* Cart items or empty state */}
        {items.length === 0 ? (
          <div className="px-5 py-5 flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-purple-50/60 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#8b5cf6]/40" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 2v12M2 8h12" strokeLinecap="round" />
              </svg>
            </div>
            <p className="font-['Outfit'] text-xs text-[#9ca3af] text-center leading-relaxed">
              Tap <span className="text-[#8b5cf6] font-medium">Back</span> on any skill to add it here.<br />
              <span className="text-[#b0b5c0]">Your funds are held in escrow — when a creator claims, you receive an Exclusive Pass with perks. Auto-refund if unclaimed in 90 days.</span>
            </p>
          </div>
        ) : (
          <>
            {/* Items list */}
            <div className="px-3 py-2 max-h-64 overflow-y-auto space-y-1.5">
              {items.map((item) => (
                <div
                  key={item.skill.slug}
                  className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/40 group"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-['Outfit'] text-xs text-[#393f49] truncate">
                      {item.skill.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-['Outfit'] text-xs text-[#9ca3af]">
                      ${item.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => onRemove(item.skill.slug)}
                      className="size-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-2.5 h-2.5 text-gray-500" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 2L10 10M10 2L2 10" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Chain selector + Total + Back All */}
            <div className="px-4 py-3 border-t border-purple-100/30">
              <div className="flex items-center justify-between mb-3">
                <span className="font-['Outfit'] text-xs text-[#696f8c]">
                  {items.length} {items.length === 1 ? 'skill' : 'skills'}
                </span>
                <span className="font-['Outfit'] font-semibold text-sm text-[#393f49]">
                  ${total} USDC
                </span>
              </div>
              <div className="mb-3">
                <ChainSelector selected={chain} onChange={onChainChange} disabled={isTransferring} />
              </div>
              <button
                onClick={onBackAll}
                disabled={isTransferring}
                className={`w-full py-2.5 rounded-xl font-['Outfit'] font-semibold text-sm text-white transition-all shadow-[0px_1px_1px_0.05px_rgba(24,24,27,0.24)] ${
                  isTransferring
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] hover:opacity-90'
                }`}
              >
                {isTransferring ? 'Confirming...' : 'Back All'}
              </button>
              <p className="font-['Outfit'] text-[10px] text-[#b0b5c0] text-center mt-2">
                {chain === 'base'
                  ? 'Funds held in smart contract escrow'
                  : 'Funds held in escrow by Bloom Protocol'}
              </p>
            </div>
          </>
        )}
        </div>
      </div>
    );
  }

  // Floating variant — mobile bottom bar (original behavior)
  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-lg">
      {/* Expanded list */}
      {isExpanded && (
        <div className="bg-white rounded-t-xl border border-b-0 border-gray-200 shadow-2xl p-3 max-h-60 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="font-['Outfit'] font-semibold text-sm text-[#393f49]">
              Selected Skills
            </span>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
              </svg>
            </button>
          </div>
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.skill.slug}
                className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-gray-50"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-['Outfit'] text-sm text-[#393f49] truncate">
                    {item.skill.name}
                  </span>
                  <span className="font-['Outfit'] text-xs text-[#9ca3af] shrink-0">
                    ${item.amount.toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={() => onRemove(item.skill.slug)}
                  className="shrink-0 size-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                >
                  <svg className="w-3 h-3 text-gray-500" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 2L10 10M10 2L2 10" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chain selector row (shown when expanded) */}
      {isExpanded && (
        <div className="bg-white border-x border-gray-200 px-4 py-2">
          <ChainSelector selected={chain} onChange={onChainChange} disabled={isTransferring} />
        </div>
      )}

      {/* Cart bar */}
      <div
        className={`bg-white border border-gray-200 shadow-2xl px-4 py-3 flex items-center justify-between ${
          isExpanded ? 'rounded-b-xl' : 'rounded-xl'
        }`}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="text-lg">🛒</span>
          <span className="font-['Outfit'] font-semibold text-sm text-[#393f49]">
            {items.length} {items.length === 1 ? 'skill' : 'skills'}
          </span>
          <span className="font-['Outfit'] text-sm text-[#696f8c]">
            &middot; ${total} USDC
          </span>
          <svg
            className={`w-4 h-4 text-[#696f8c] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M8 4.5L14 10.5H2L8 4.5Z" />
          </svg>
        </button>

        <button
          onClick={onBackAll}
          disabled={isTransferring}
          className={`px-5 py-2 rounded-xl font-['Outfit'] font-semibold text-sm text-white transition-all shadow-[0px_1px_1px_0.05px_rgba(24,24,27,0.24)] ${
            isTransferring
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] hover:opacity-90'
          }`}
        >
          {isTransferring ? 'Confirming...' : 'Back All'}
        </button>
      </div>
    </div>
  );
}
