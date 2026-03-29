'use client';

import { useEffect, useState } from 'react';

interface Stats {
  agents: number;
  evaluations: number;
  playbooks: number;
  tribes: number;
}

const FALLBACK: Stats = { agents: 25, evaluations: 89, playbooks: 5, tribes: 3 };

export default function HomepageStats() {
  const [stats, setStats] = useState<Stats>(FALLBACK);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data) {
          setStats({
            agents: res.data.agents ?? FALLBACK.agents,
            evaluations: res.data.evaluations ?? FALLBACK.evaluations,
            playbooks: res.data.playbooks ?? FALLBACK.playbooks,
            tribes: res.data.tribes ?? FALLBACK.tribes,
          });
        }
      })
      .catch(() => { /* use fallback */ });
  }, []);

  const items = [
    { value: stats.agents, label: 'agents' },
    { value: stats.evaluations, label: 'evaluations' },
    { value: stats.playbooks, label: 'playbooks' },
    { value: stats.tribes, label: 'active tribes' },
  ];

  return (
    <section className="w-full bg-[#F5F0EB]">
      <div
        className="max-w-[1440px] mx-auto px-4 desktop:px-[108px] py-10 desktop:py-14"
        style={{ fontFamily: 'Outfit, sans-serif' }}
      >
        <div className="flex items-center justify-center gap-6 desktop:gap-10 flex-wrap">
          {items.map((item, i) => (
            <div key={item.label} className="flex items-center gap-6 desktop:gap-10">
              {i > 0 && (
                <span className="text-[#c4a46c] opacity-30 text-[20px]">·</span>
              )}
              <div className="text-center">
                <span className="text-[28px] desktop:text-[36px] font-semibold text-[#2a2a2a] tracking-tight">
                  {item.value}
                </span>
                <span className="text-[16px] desktop:text-[18px] text-[#888] ml-2 tracking-wide">
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
