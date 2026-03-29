'use client';

import { useState } from 'react';

const STEPS = [
  { num: '1', label: 'Back skills you want to see thrive', detail: 'Starting from $1 — held safely in escrow' },
  { num: '2', label: 'Creator claims your backing', detail: 'You receive an Exclusive Pass' },
  { num: '3', label: 'Enjoy Exclusive Pass perks', detail: 'Early access, priority rewards' },
  { num: '4', label: 'No claim in 90 days?', detail: 'Full automatic refund' },
];

const PERKS = [
  { title: 'Priority Rewards', desc: 'First in line for project drops' },
  { title: 'Founding Status', desc: 'Recognized as an early backer' },
  { title: 'Early Pricing', desc: 'Discounts from projects' },
  { title: 'Exclusive Skills', desc: 'Premium access & limited editions' },
];

export default function HowBackingWorks() {
  const [showHowItWorks, setShowHowItWorks] = useState(true);
  const [showPerks, setShowPerks] = useState(false);

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
      <div className="relative z-10 px-5 py-4 flex flex-col gap-1">

        {/* How It Works — collapsible */}
        <button
          onClick={() => setShowHowItWorks(!showHowItWorks)}
          className="flex items-center justify-between w-full py-1.5 group"
        >
          <h3 className="font-['Outfit'] text-[15px] font-semibold" style={{ color: '#1a1228' }}>
            How It Works
          </h3>
          <svg className="size-5 shrink-0" viewBox="0 0 20 20" fill="#a59af3">
            <path d={showHowItWorks ? "M10 7.5L14 12.5H6L10 7.5Z" : "M10 12.5L14 7.5H6L10 12.5Z"} />
          </svg>
        </button>

        {showHowItWorks && (
          <div className="pb-2 space-y-3">
            {STEPS.map((step) => (
              <div key={step.num} className="flex items-start gap-2.5">
                <div
                  className="w-5 h-5 rounded-full text-white font-['Outfit'] text-[13px] font-semibold flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'rgba(124,58,237,0.5)' }}
                >
                  {step.num}
                </div>
                <div>
                  <p className="font-['Outfit'] text-[13px] font-medium leading-snug" style={{ color: '#2a2040' }}>
                    {step.label}
                  </p>
                  <p className="font-['Outfit'] text-[11px] font-light leading-snug" style={{ color: 'rgba(80,60,120,0.45)' }}>
                    {step.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-purple-100/30" />

        {/* Exclusive Pass Perks — collapsible */}
        <button
          onClick={() => setShowPerks(!showPerks)}
          className="flex items-center justify-between w-full py-1.5 group"
        >
          <h3 className="font-['Outfit'] text-[15px] font-semibold" style={{ color: '#1a1228' }}>
            Exclusive Pass Perks
          </h3>
          <svg className="size-5 shrink-0" viewBox="0 0 20 20" fill="#a59af3">
            <path d={showPerks ? "M10 7.5L14 12.5H6L10 7.5Z" : "M10 12.5L14 7.5H6L10 12.5Z"} />
          </svg>
        </button>

        {showPerks && (
          <div className="pb-2">
            <p className="font-['Outfit'] text-[11px] font-light italic mb-3" style={{ color: 'rgba(100,80,140,0.4)' }}>
              Benefits vary by skill creator — some examples:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {PERKS.map((perk) => (
                <div
                  key={perk.title}
                  className="p-2.5 rounded-xl"
                  style={{
                    background: 'rgba(139,92,246,0.04)',
                    border: '1px solid rgba(139,92,246,0.08)',
                  }}
                >
                  <p className="font-['Outfit'] text-[12px] font-semibold leading-tight mb-0.5" style={{ color: '#2a2040' }}>
                    {perk.title}
                  </p>
                  <p className="font-['Outfit'] text-[10px] font-light leading-tight" style={{ color: 'rgba(80,60,120,0.45)' }}>
                    {perk.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
