'use client';

import { useBuilderDashboard } from '../contexts/builder-dashboard-context';

/**
 * State 2: X Connected, No Missions Found
 * Visual step-by-step guide with connected account info and "Post on X" CTA
 */
export default function NoMissionsPrompt() {
  const { connectedAccount, handleDisconnectX, handleHowItWorks } = useBuilderDashboard();

  const steps = [
    {
      step: '1',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      title: 'Post on X',
      desc: 'Mention @Bloom__Protocol in your post to create a mission',
      color: 'bg-[#f0eefb]',
      iconColor: 'text-[#8478e0]',
    },
    {
      step: '2',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      title: 'Auto-Discovery',
      desc: 'Our bot detects your mission automatically',
      color: 'bg-[#e8f9ef]',
      iconColor: 'text-[#00C853]',
    },
    {
      step: '3',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      title: 'Manage & Reward',
      desc: 'Come back to manage submissions and distribute rewards',
      color: 'bg-[#e8f0fb]',
      iconColor: 'text-[#4A90D9]',
    },
  ];

  const handlePostOnX = () => {
    const text = encodeURIComponent('Hey @Bloom__Protocol ');
    window.open(`https://x.com/intent/tweet?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-5">
      {/* Connected account bar */}
      <div className="common-container-style flex items-center justify-between py-4 px-6">
        <div className="flex items-center gap-3">
          {connectedAccount?.profileImageUrl ? (
            <img
              src={connectedAccount.profileImageUrl}
              alt=""
              className="w-9 h-9 rounded-full"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#f0eefb] flex items-center justify-center">
              <span className="text-[#8478e0] text-[14px] font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {connectedAccount?.xUsername?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
          )}
          <div>
            <span
              className="text-[14px] font-semibold text-[#393f49] block"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              @{connectedAccount?.xUsername}
            </span>
            <span
              className="text-[12px] text-[#696f8c]"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Connected
            </span>
          </div>
        </div>
        <button
          onClick={handleDisconnectX}
          className="text-[13px] text-[#696f8c] hover:text-[#8478e0] transition-colors"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          Disconnect
        </button>
      </div>

      {/* No missions card */}
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="common-container-style max-w-[520px] w-full text-center py-10 px-8">
          {/* Title */}
          <h2
            className="text-[26px] font-bold text-[#393f49] mb-2"
            style={{ fontFamily: 'Times, serif' }}
          >
            No Missions Yet
          </h2>

          {/* Description */}
          <p
            className="text-[15px] text-[#696f8c] mb-8"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Get started in 3 simple steps
          </p>

          {/* Visual Step Cards */}
          <div className="flex flex-col gap-3 mb-8">
            {steps.map((step) => (
              <div
                key={step.step}
                className="flex items-center gap-4 text-left bg-[#fafafa] rounded-xl px-5 py-4"
              >
                <div className={`w-11 h-11 rounded-xl ${step.color} ${step.iconColor} flex items-center justify-center flex-shrink-0`}>
                  {step.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[11px] font-bold text-[#696f8c] uppercase tracking-wider"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    >
                      Step {step.step}
                    </span>
                  </div>
                  <div
                    className="text-[15px] font-semibold text-[#393f49]"
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

          {/* Post on X CTA */}
          <button
            onClick={handlePostOnX}
            className="bg-[#393f49] text-white px-8 py-3 rounded-full text-[15px] font-semibold hover:opacity-90 transition-opacity w-full max-w-[280px] flex items-center justify-center gap-2 mx-auto"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Post on X
          </button>

          {/* How It Works link */}
          <button
            onClick={handleHowItWorks}
            className="mt-4 text-[13px] text-[#696f8c] hover:text-[#8478e0] transition-colors"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            How It Works →
          </button>
        </div>
      </div>
    </div>
  );
}
