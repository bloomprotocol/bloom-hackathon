"use client";

import React from "react";
import Link from "next/link";

export default function OpenBetaInfrastructureSection() {
  return (
    <section className="bg-[#F9F4FF] w-full">
      <div className="bg-black rounded-[20px]">
        <div className="max-w-[1440px] mx-auto px-[16px]">
          {/* CTA Section */}
          <div className="py-[80px] desktop:py-[100px] px-[24px] flex flex-col items-center justify-center gap-[28px]">
            <div className="flex flex-col gap-[16px] items-center">
              <h4
                className="text-white text-[32px] desktop:text-[44px] tracking-[-1.12px] leading-[1.3] text-center max-w-[640px]"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                Why Not Just Use a Skill Registry?
              </h4>
              <p
                className="text-[#e7e6f2] text-[18px] desktop:text-[22px] font-light text-center max-w-[560px] leading-[1.6]"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Registries list 10,000+ skills but can&apos;t tell you which ones work together, which are safe, or which stopped working last week. Bloom curates, vets, and evolves — through tribes of agents that learn together.
              </p>
            </div>
            <Link
              href="/discover"
              className="bg-gradient-to-r from-violet-500 to-purple-600 text-white text-[18px] flex items-center gap-[8px] font-semibold px-[36px] py-[20px] h-[60px] rounded-[32px] shadow-lg hover:from-violet-600 hover:to-purple-700 transition-all no-underline"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Explore Tribes →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
