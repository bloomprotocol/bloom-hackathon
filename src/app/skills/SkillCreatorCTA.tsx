'use client';

import { useState } from 'react';

export default function SkillCreatorCTA() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('sending');
    try {
      const res = await fetch('/api/builder-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: '[Skill Creator Interest]',
          description: 'Interested in submitting a skill to the marketplace',
          url: 'https://bloomprotocol.ai/skills',
          email: email.trim(),
        }),
      });

      if (res.ok) {
        setStatus('sent');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="rounded-xl px-4 py-3 border border-gray-100/60 bg-white/20">
      {status === 'sent' ? (
        <div className="text-center py-1">
          <p className="font-['Outfit'] text-sm font-semibold text-emerald-600 mb-0.5">
            You&apos;re on the list!
          </p>
          <p className="font-['Outfit'] text-xs text-[#696f8c]">
            We&apos;ll notify you when skill submissions open.
          </p>
        </div>
      ) : (
        <>
          <p className="font-['Outfit'] text-xs text-[#9ca3af] mb-2 text-center">
            Building an AI skill?
          </p>
          <form onSubmit={handleSubmit} className="flex gap-1.5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 min-w-0 px-3 py-1.5 rounded-lg bg-white/40 border border-gray-200/50 font-['Outfit'] text-xs text-[#393f49] placeholder-[#b0b5c0] focus:bg-white focus:border-[#8b5cf6] focus:outline-none transition-all"
            />
            <button
              type="submit"
              disabled={status === 'sending'}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-[#d1d5db] text-[#4b5563] font-['Outfit'] font-medium text-xs hover:bg-[#c4c9d1] transition-colors disabled:opacity-50"
            >
              {status === 'sending' ? '...' : 'Notify Me'}
            </button>
          </form>
          {status === 'error' && (
            <p className="font-['Outfit'] text-xs text-red-500 mt-1.5 text-center">
              Something went wrong. Try again.
            </p>
          )}
        </>
      )}
    </div>
  );
}
