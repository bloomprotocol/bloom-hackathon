'use client';

import { useBuilderDashboard } from '../contexts/builder-dashboard-context';

/**
 * State 1: X Account Not Connected
 * Welcoming onboarding card with X icon, 3-step preview, and prominent CTA
 */
export default function ConnectXPrompt() {
  const { handleConnectX } = useBuilderDashboard();

  const steps = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      title: 'Create Missions',
      desc: 'Post on X to launch social missions',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Review Supporters',
      desc: 'Approve or reject submissions',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Distribute Rewards',
      desc: 'Send tokens to approved supporters',
    },
  ];

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="common-container-style max-w-[520px] w-full text-center py-10 px-8">
        {/* X Logo */}
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-[#f0eefb] flex items-center justify-center">
            <svg className="w-7 h-7 text-[#393f49]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2
          className="text-[28px] font-bold text-[#393f49] mb-2"
          style={{ fontFamily: 'Times, serif' }}
        >
          Builder Dashboard
        </h2>

        {/* Description */}
        <p
          className="text-[15px] text-[#696f8c] mb-8"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          Connect your X account to create and manage Social Missions
        </p>

        {/* 3-Step Preview */}
        <div className="flex flex-col gap-3 mb-8">
          {steps.map((step) => (
            <div
              key={step.title}
              className="flex items-center gap-3 text-left bg-[#fafafa] rounded-xl px-4 py-3"
            >
              <div className="w-9 h-9 rounded-xl bg-[#f0eefb] text-[#8478e0] flex items-center justify-center flex-shrink-0">
                {step.icon}
              </div>
              <div>
                <div
                  className="text-[14px] font-semibold text-[#393f49]"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {step.title}
                </div>
                <div
                  className="text-[13px] text-[#696f8c]"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {step.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Connect Button — metallic texture */}
        <button
          onClick={handleConnectX}
          className="relative text-white px-8 py-3 rounded-full text-[15px] font-semibold w-full max-w-[280px] border border-[#a89deb]/40 shadow-[0px_4px_12px_rgba(132,120,224,0.3),inset_0px_1px_1px_rgba(255,255,255,0.3)] hover:shadow-[0px_4px_16px_rgba(132,120,224,0.45),inset_0px_1px_1px_rgba(255,255,255,0.3)] active:shadow-[inset_0px_2px_4px_rgba(0,0,0,0.15)] transition-all duration-200"
          style={{
            fontFamily: 'Outfit, sans-serif',
            background: 'linear-gradient(180deg, #9b90ef 0%, #7b6dd4 50%, #8478e0 100%)',
          }}
        >
          <span className="relative z-10">Connect X Account</span>
        </button>
      </div>
    </div>
  );
}
