"use client";

import { useState, useEffect } from "react";

export default function HowItWorksCard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    const checkDesktop = () => {
      const isDesktop = window.innerWidth >= 1280;
      setIsExpanded(isDesktop);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="bg-white rounded-[16px] border border-[#e6e8ec] p-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
      >
        <h3 className="font-semibold text-[18px] text-[#393f49]" style={{ fontFamily: 'Times, serif' }}>
          What is x402?
        </h3>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="#696f8c"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isExpanded && (
      <>
        {/* Brief Intro */}
        <p className="font-['Outfit'] text-[14px] text-[#696f8c] mt-4 leading-[1.5]">
          We know x402 is a bit hard to understand for individuals, so imagine x402 is a vending machine on the internet.
        </p>

        {/* Divider */}
        <div className="border-t border-[#e6e8ec] my-4"></div>

        {/* Collapsible Sections */}
        <div className="flex flex-col gap-2">

          {/* Section: Content Creator */}
          <div>
            <button
              onClick={() => toggleSection('creator')}
              className="w-full flex items-center justify-between py-2 hover:opacity-80 transition-opacity"
            >
              <span className="font-['Outfit'] font-medium text-[14px] text-[#393f49]">
                I am a content creator
              </span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="none"
                className={`transition-transform duration-200 ${expandedSection === 'creator' ? 'rotate-180' : ''}`}
              >
                <path
                  d="M4 6L8 10L12 6"
                  stroke="#696f8c"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {expandedSection === 'creator' && (
              <div className="flex flex-col gap-3 pl-2 pb-3">
                { /* for content creators, professional, skill expert */}
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#71ca41] flex items-center justify-center shrink-0">
                    <span className="text-[10px] text-white">✓</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-['Outfit'] font-medium text-[13px] text-[#393f49] mb-0.5">
                      On-Demand Expertise
                    </p>
                    <p className="font-['Outfit'] text-[11px] text-[#696f8c]">
                      Any skill, anytime, pay-per-use.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#71ca41] flex items-center justify-center shrink-0">
                    <span className="text-[10px] text-white">✓</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-['Outfit'] font-medium text-[13px] text-[#393f49] mb-0.5">
                      Global Clients, Zero Barriers
                    </p>
                    <p className="font-['Outfit'] text-[11px] text-[#696f8c]">
                      Anyone in the world can pay you. No bank account issues.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#71ca41] flex items-center justify-center shrink-0">
                    <span className="text-[10px] text-white">✓</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-['Outfit'] font-medium text-[13px] text-[#393f49] mb-0.5">
                      Instant Payout
                    </p>
                    <p className="font-['Outfit'] text-[11px] text-[#696f8c]">
                      Money in your wallet the second someone pays. No 30-day wait.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section: Community Owner */}
          <div>
            <button
              onClick={() => toggleSection('community')}
              className="w-full flex items-center justify-between py-2 hover:opacity-80 transition-opacity"
            >
              <span className="font-['Outfit'] font-medium text-[14px] text-[#393f49]">
                I own a community
              </span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="none"
                className={`transition-transform duration-200 ${expandedSection === 'community' ? 'rotate-180' : ''}`}
              >
                <path
                  d="M4 6L8 10L12 6"
                  stroke="#696f8c"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {expandedSection === 'community' && (
              <div className="flex flex-col gap-3 pl-2 pb-3">
                { /* for influencer, live streamer -ish */}
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#71ca41] flex items-center justify-center shrink-0">
                    <span className="text-[10px] text-white">✓</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-['Outfit'] font-medium text-[13px] text-[#393f49] mb-0.5">
                      No Membership System Needed
                    </p>
                    <p className="font-['Outfit'] text-[11px] text-[#696f8c]">
                      Charge for content without building login, payment, or user management.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#71ca41] flex items-center justify-center shrink-0">
                    <span className="text-[10px] text-white">✓</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-['Outfit'] font-medium text-[13px] text-[#393f49] mb-0.5">
                      Micro-charge Anything
                    </p>
                    <p className="font-['Outfit'] text-[11px] text-[#696f8c]">
                      Charge $0.50 for a post, $2 for a guide. Any amount works.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#71ca41] flex items-center justify-center shrink-0">
                    <span className="text-[10px] text-white">✓</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-['Outfit'] font-medium text-[13px] text-[#393f49] mb-0.5">
                      Your Community, Your Rules
                    </p>
                    <p className="font-['Outfit'] text-[11px] text-[#696f8c]">
                      No platform telling you what you can or can't charge for.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section: For Everyone */}
          <div>
            <button
              onClick={() => toggleSection('everyone')}
              className="w-full flex items-center justify-between py-2 hover:opacity-80 transition-opacity"
            >
              <span className="font-['Outfit'] font-medium text-[14px] text-[#393f49]">
                For everyone
              </span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="none"
                className={`transition-transform duration-200 ${expandedSection === 'everyone' ? 'rotate-180' : ''}`}
              >
                <path
                  d="M4 6L8 10L12 6"
                  stroke="#696f8c"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {expandedSection === 'everyone' && (
              <div className="flex flex-col gap-3 pl-2 pb-3">
                { /* for normal individuals */}
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#71ca41] flex items-center justify-center shrink-0">
                    <span className="text-[10px] text-white">✓</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-['Outfit'] font-medium text-[13px] text-[#393f49] mb-0.5">
                      No Credit Card Needed
                    </p>
                    <p className="font-['Outfit'] text-[11px] text-[#696f8c]">
                      No card number, no expiry date, no CVV. Just your wallet.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#71ca41] flex items-center justify-center shrink-0">
                    <span className="text-[10px] text-white">✓</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-['Outfit'] font-medium text-[13px] text-[#393f49] mb-0.5">
                      Instant Access
                    </p>
                    <p className="font-['Outfit'] text-[11px] text-[#696f8c]">
                      Pay, and the content/service unlocks immediately. No waiting.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#71ca41] flex items-center justify-center shrink-0">
                    <span className="text-[10px] text-white">✓</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-['Outfit'] font-medium text-[13px] text-[#393f49] mb-0.5">
                      No Commitment Pressure
                    </p>
                    <p className="font-['Outfit'] text-[11px] text-[#696f8c]">
                      No "subscribe now for best value." Just pay for what you want today.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-[#e6e8ec] my-4"></div>

        {/* Good to Know */}
        <div className="bg-[rgba(247,89,255,0.1)] rounded-[12px] p-[10px]">
          <p className="font-['Outfit'] font-medium text-[12px] text-[#393f49] mb-2 leading-[1.4]">
            Good to Know:
          </p>
          <ul className="font-['Outfit'] font-light text-[12px] text-[#696f8c] space-y-1 leading-[1.4]">
            <li>• Payments go directly to your wallet</li>
            <li>• More networks coming soon</li>
          </ul>
        </div>

        {/* Divider */}
        <div className="border-t border-[#e6e8ec] my-4"></div>

        {/* Personalize Your Page */}
        <div className="bg-[rgba(76,190,255,0.1)] rounded-[12px] p-[10px]">
          <p className="font-['Outfit'] font-medium text-[12px] text-[#393f49] mb-2 leading-[1.4]">
            Personalize Your Page
          </p>
          <p className="font-['Outfit'] font-light text-[12px] text-[#696f8c] leading-[1.4]">
            Customize your public profile below to add your name, bio, and social links
          </p>
        </div>

        {/* Twitter Connected Benefits - Light green box */}
        <div className="bg-[rgba(113,202,65,0.1)] rounded-[12px] p-[10px] mt-3">
          <p className="font-['Outfit'] font-medium text-[12px] text-[#393f49] mb-2 leading-[1.4]">
            Twitter Connected Benefits
          </p>
          <p className="font-['Outfit'] font-light text-[12px] text-[#696f8c] leading-[1.4]">
            No need to include your page link in social mission posts
          </p>
        </div>
      </>
      )}
    </div>
  );
}
