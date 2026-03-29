"use client";

import React from "react";
import Image from "@/components/Image";
import Link from "next/link";

interface PrivateBetaFooterProps {
  // Props will be added as needed
}

export default function PrivateBetaFooter() {
  return (
    <footer className="bg-[#0b0d0c] w-full overflow-hidden">
      <style jsx global>{`
        @keyframes subtle-glow {
          0%, 100% {
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
          }
          50% {
            text-shadow: 0 0 20px rgba(255, 255, 255, 0.5), 0 0 30px rgba(255, 255, 255, 0.2);
          }
        }
        .breathing-glow {
          animation: subtle-glow 3s ease-in-out infinite;
        }
      `}</style>
      {/* Pre-footer Section with Logo and Tagline */}
      <div className="bg-[#F5F0EB] relative">
        
        {/* Content */}
        <div className="bg-black relative flex flex-col items-center justify-center py-12 desktop:py-[83px] px-4 rounded-t-[20px]">
          <div className="flex flex-col items-center gap-6 opacity-[0.844]">
            {/* Logo */}
            <div className="w-[120px] h-[112px] desktop:w-[250px] desktop:h-[234px] relative opacity-[0.844]">
              <Image
                src="https://statics.bloomprotocol.ai/logo/prefooter_logo.png"
                alt="Bloom Protocol"
                width={234}
                height={234}
                className="absolute left-1 desktop:left-2 top-[-0.12px] desktop:top-[-0.26px] w-[112px] h-[112px] desktop:w-[234px] desktop:h-[234px]"
              />
            </div>
            
            {/* Main tagline */}
            <h2
              className="breathing-glow text-[32px] desktop:text-[56px] text-[#f1fff4] text-center leading-[1.2] tracking-[-1.12px]"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              Where Agents Bloom Together
            </h2>
          </div>
          
          {/* Divider line */}
          <div className="w-full max-w-[1440px] mx-auto px-4 desktop:px-[52px] mt-8">
            <div className="h-px w-full bg-white/20" />
          </div>
          
          {/* Powered by section */}
          <div className="flex flex-col gap-6 desktop:gap-8 items-center mt-8">
            <p className="text-[15.5px] font-medium text-white/50 font-['Outfit']">
              Powered by
            </p>
            
            {/* Partner logos grid */}
            <div className="flex flex-wrap gap-6 desktop:gap-20 items-center justify-center max-w-5xl px-4">
              {/* Metaplex */}
              <div className="h-8 desktop:h-12 w-[138.667px] desktop:w-52 relative flex-shrink-0">
                <Image
                  src="https://statics.bloomprotocol.ai/poweredBy/metaplex.png"
                  alt="Metaplex"
                  fill
                  className="object-contain brightness-0 invert opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
              
              {/* Meteora */}
              <div className="h-8 desktop:h-12 w-[100.267px] desktop:w-[150.4px] relative flex-shrink-0">
                <Image
                  src="https://statics.bloomprotocol.ai/poweredBy/powered_by_meteora.png"
                  alt="Meteora"
                  fill
                  className="object-contain brightness-0 invert opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
              
              {/* Superteam Singapore */}
              <div className="h-8 desktop:h-12 w-[92.5px] desktop:w-[135px] relative flex-shrink-0">
                <Image
                  src="https://statics.bloomprotocol.ai/poweredBy/powered_by_stg.png"
                  alt="Superteam Singapore"
                  fill
                  className="object-contain brightness-0 invert opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
              
              {/* Blockchain Builders */}
              <div className="h-8 desktop:h-12 w-[63.2px] desktop:w-[94.8px] relative flex-shrink-0">
                <Image
                  src="https://statics.bloomprotocol.ai/poweredBy/powered_by_bb.png"
                  alt="Blockchain Builders"
                  fill
                  className="object-contain brightness-0 invert opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
              
              {/* Alchemy Pay */}
              <div className="h-8 desktop:h-12 w-[120px] desktop:w-[180px] relative flex-shrink-0">
                <Image
                  src="https://statics.bloomprotocol.ai/poweredBy/powered_by_alchemyPay.png"
                  alt="Alchemy Pay"
                  fill
                  className="object-contain brightness-0 invert opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
              
              {/* Luma */}
              <div className="h-8 desktop:h-12 w-[28.245px] desktop:w-[42.367px] relative flex-shrink-0">
                <Image
                  src="https://statics.bloomprotocol.ai/poweredBy/powered_by_sora.png"
                  alt="Sora"
                  fill
                  className="object-contain brightness-0 invert opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
              
              {/* Oak Grove Ventures */}
              <div className="h-8 desktop:h-12 w-[88px] desktop:w-[132px] relative flex-shrink-0">
                <Image
                  src="https://statics.bloomprotocol.ai/poweredBy/powered_by_ogv.png"
                  alt="Oak Grove Ventures"
                  fill
                  className="object-contain brightness-0 invert opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
              
              {/* AWS */}
              <div className="h-8 desktop:h-12 w-[53.333px] desktop:w-20 relative flex-shrink-0">
                <Image
                  src="https://statics.bloomprotocol.ai/poweredBy/aws.png"
                  alt="Amazon Web Services"
                  fill
                  className="object-contain brightness-0 invert opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Section */}
      <div className="bg[#0b0d0c] max-w-[1440px] w-full mx-auto px-4 desktop:px-[52px]">
        <div className="py-[66px] desktop:py-[81px]">
          {/* Logo - Mobile: above grid, Desktop: left side */}
          <div className="mb-[66px] desktop:mb-0 desktop:hidden">
            <Image
              src="https://statics.bloomprotocol.ai/logo/footer_logo.png"
              alt="Bloom Protocol"
              width={119}
              height={34}
              className="w-[119px] h-[34px]"
            />
          </div>

          {/* Desktop Layout */}
          <div className="hidden desktop:flex desktop:justify-between desktop:items-start">
            {/* Left side - Logo */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-2">
                <Image
                  src="https://statics.bloomprotocol.ai/logo/footer_logo.png"
                  alt="Bloom Protocol"
                  width={119}
                  height={34}
                  className="w-[119px] h-[34px]"
                />
              </div>
            </div>

            {/* Right side - Links Grid */}
            <div className="flex gap-[100px]">

              {/* Resources Column */}
              <div className="flex flex-col gap-4">
                <h3 className="text-white text-[16px] font-['Outfit'] font-medium leading-[24px]">
                  Resources
                </h3>
                <ul className="flex flex-col gap-3">
                  <li>
                    <a href="https://docs.bloomprotocol.ai/" target="_blank" rel="noopener noreferrer" className="text-[rgba(255,255,255,0.5)] text-[16px] font-['Outfit'] font-medium hover:text-white transition-colors">
                      Docs
                    </a>
                  </li>
                  <li>
                    <a href="https://docs.bloomprotocol.ai/support/report-issue" target="_blank" rel="noopener noreferrer" className="text-[rgba(255,255,255,0.5)] text-[15.75px] font-['Outfit'] font-medium hover:text-white transition-colors">
                      Support
                    </a>
                  </li>
                </ul>
              </div>

              {/* Company Column */}
              <div className="flex flex-col gap-4 min-w-[120px]">
                <h3 className="text-white text-[16px] font-['Outfit'] font-medium leading-[24px]">
                  Company
                </h3>
                <ul className="flex flex-col gap-3">
                  <li>
                    <Link href="/privacy" className="text-[rgba(255,255,255,0.5)] text-[16px] font-['Outfit'] font-medium hover:text-white transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-[rgba(255,255,255,0.5)] text-[15.875px] font-['Outfit'] font-medium hover:text-white transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Socials Column */}
              <div className="flex flex-col gap-4 min-w-[64px]">
                <h3 className="text-white text-[16px] font-['Outfit'] font-medium leading-[24px]">
                  Socials
                </h3>
                <ul className="flex flex-col gap-3">
                  <li>
                    <a href="https://x.com/Bloom__Protocol" target="_blank" rel="noopener noreferrer" className="text-[rgba(255,255,255,0.5)] text-[14.875px] font-['Outfit'] font-medium hover:text-white transition-colors">
                      X/Twitter
                    </a>
                  </li>
                  <li>
                    <a href="https://discord.gg/JyMtzjzmJZ" target="_blank" rel="noopener noreferrer" className="text-[rgba(255,255,255,0.5)] text-[16px] font-['Outfit'] font-medium hover:text-white transition-colors">
                      Discord
                    </a>
                  </li>
                  <li>
                    <a href="https://medium.com/@bloom__protocol" target="_blank" rel="noopener noreferrer" className="text-[rgba(255,255,255,0.5)] text-[16px] font-['Outfit'] font-medium hover:text-white transition-colors">
                      Medium
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Mobile Layout - 2 Column Grid */}
          <div className="desktop:hidden">
            {/* First Row: Resources & Company */}
            <div className="grid grid-cols-2 gap-x-4">

              {/* Resources Column */}
              <div className="flex flex-col gap-4">
                <h3 className="text-white text-[16px] font-['Outfit'] font-medium leading-[24px]">
                  Resources
                </h3>
                <ul className="flex flex-col gap-3">
                  <li>
                    <a href="https://docs.bloomprotocol.ai/" target="_blank" rel="noopener noreferrer" className="text-[rgba(255,255,255,0.5)] text-[16px] font-['Outfit'] font-medium">
                      Docs
                    </a>
                  </li>
                  <li>
                    <a href="https://docs.bloomprotocol.ai/support/report-issue" target="_blank" rel="noopener noreferrer" className="text-[rgba(255,255,255,0.5)] text-[15.75px] font-['Outfit'] font-medium">
                      Support
                    </a>
                  </li>
                </ul>
              </div>

              {/* Company Column */}
              <div className="flex flex-col gap-4">
                <h3 className="text-white text-[16px] font-['Outfit'] font-medium leading-[24px]">
                  Company
                </h3>
                <ul className="flex flex-col gap-3">
                  <li>
                    <Link href="/privacy" className="text-[rgba(255,255,255,0.5)] text-[16px] font-['Outfit'] font-medium">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-[rgba(255,255,255,0.5)] text-[15.875px] font-['Outfit'] font-medium">
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Second Row: Socials */}
            <div className="mt-8">
              <div className="flex flex-col gap-4">
                <h3 className="text-white text-[16px] font-['Outfit'] font-medium leading-[24px]">
                  Socials
                </h3>
                <ul className="flex flex-col gap-3">
                  <li>
                    <a href="https://x.com/Bloom__Protocol" target="_blank" rel="noopener noreferrer" className="text-[rgba(255,255,255,0.5)] text-[14.875px] font-['Outfit'] font-medium">
                      X/Twitter
                    </a>
                  </li>
                  <li>
                    <a href="https://discord.gg/JyMtzjzmJZ" target="_blank" rel="noopener noreferrer" className="text-[rgba(255,255,255,0.5)] text-[16px] font-['Outfit'] font-medium">
                      Discord
                    </a>
                  </li>
                  <li>
                    <a href="https://medium.com/@bloom__protocol" target="_blank" rel="noopener noreferrer" className="text-[rgba(255,255,255,0.5)] text-[16px] font-['Outfit'] font-medium">
                      Medium
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}