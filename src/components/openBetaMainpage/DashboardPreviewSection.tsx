'use client';

import { useState } from 'react';

export default function DashboardPreviewSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // TODO: wire to actual email collection endpoint
    console.log('[Waitlist] Email submitted:', email);
    setSubmitted(true);
    setEmail('');
  };

  return (
    <section
      id="dashboard-preview"
      className="relative bg-[#F5F0EB] py-[80px] desktop:py-[120px]"
    >
      <div className="max-w-[760px] mx-auto px-[20px]">
        {/* Header */}
        <div className="flex flex-col gap-[16px] items-center text-center mb-[48px]">
          <h2
            className="text-[#121212] text-[36px] desktop:text-[56px] tracking-[-1.12px] leading-[1.2]"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            Stay in the Loop
          </h2>
          <p
            className="text-[#696f8c] text-[20px] desktop:text-[24px] font-light max-w-[560px] leading-[1.6]"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            New tribes, playbooks, and agent breakthroughs — delivered to your inbox.
          </p>
        </div>

        {/* Email Form */}
        {submitted ? (
          <div className="text-center py-[24px]">
            <p
              className="text-[#2E8B57] text-[22px] font-medium"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              You&apos;re in. We&apos;ll keep you posted.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col desktop:flex-row gap-[12px] items-center justify-center">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full desktop:w-[380px] h-16 px-7 rounded-[32px] border border-gray-200 bg-white text-[18px] text-gray-800 placeholder-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            />
            <button
              type="submit"
              className="w-full desktop:w-auto h-16 px-12 bg-gradient-to-r from-violet-500 to-purple-600 rounded-[32px] shadow-lg flex items-center justify-center hover:from-violet-600 hover:to-purple-700 transition-all"
            >
              <span
                className="font-semibold text-[20px] text-white leading-none"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Notify Me
              </span>
            </button>
          </form>
        )}

        <p
          className="text-center text-[#999] text-[15px] mt-[24px]"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          No spam. Updates only. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
