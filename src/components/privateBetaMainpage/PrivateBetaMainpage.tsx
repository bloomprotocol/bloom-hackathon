"use client";

import React from "react";
import Link from "next/link";
import Image from "@/components/Image";

interface PrivateBetaMainpageProps {
  // Future props can be added here
}

export default function PrivateBetaMainpage(props: PrivateBetaMainpageProps) {
  return (
    <div className="py-6 desktop:pt-[55px] desktop:pb-0 justify-center px-4 desktop:px-0">
      {/* Caption */}
      <div className="text-center">
        <span className="text-neutral-700 text-2xl desktop:text-4xl font-['Outfit'] font-thin leading-[32px] desktop:leading-[48px]">
          Where Early Support
        </span>
        <div className="items-center justify-center flex">
          <span className="text-neutral-700 text-3xl desktop:text-6xl font-normal font-['Gilkys'] leading-[38px] desktop:leading-[76.80px]">
            Builds
          </span>

          <Image
            src="https://statics.bloomprotocol.ai/logo/bp-logo-pb-mainpage.png"
            width={95.35}
            height={95.35}
            alt="bloom protocol logo"
            className="w-12 h-12 desktop:w-24 desktop:h-24"
          />

          <span className="text-neutral-700 text-3xl desktop:text-6xl font-normal font-['Gilkys'] leading-[38px] desktop:leading-[76.80px]">
            Legends
          </span>
        </div>
        <span className="pt-[8px] desktop:pt-[12px] text-zinc-700 text-base desktop:text-xl font-light font-['Outfit']">
          Support hidden gems. Track progress. Earn early access.
        </span>
      </div>

      {/* CTA */}
      <div className="mt-[30px] desktop:mt-[40px] w-fit max-w-full relative rounded-[20px] flex flex-col overflow-hidden mx-auto">
        {/* Background layers */}

        <div className="absolute inset-0 bg-white/60 rounded-[20px] shadow-[0px_6px_10px_-4px_rgba(0,0,0,0.12)] backdrop-blur-[5px] -z-10" />

        {/* Content */}
        <div className="relative z-10 px-5 pt-5 pb-6 flex flex-col gap-5">
          <div className="text-center">
            <div className="font-['Times'] text-Main-Black text-base font-normal whitespace-nowrap">
              Where will you start your journey today?
            </div>
          </div>
          <div className="w-full flex">
            <div className="flex flex-col desktop:flex-row gap-5 items-center">
              <Link href="/spotlight" className="group">
                <div className="w-[335px] desktop:w-[174px] h-[160px] desktop:h-60 relative rounded-[20px] overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-[1.02]">
                  {/* 背景圖 - 用 CSS 控制 Mobile/Desktop 顯示不同圖片 */}
                  <Image
                    src="https://statics.bloomprotocol.ai/images/pbmp_mobile_link_card_3.jpg"
                    alt="Spotlight prime focus"
                    fill
                    className="object-cover block desktop:hidden"
                  />
                  <Image
                    src="https://statics.bloomprotocol.ai/images/pbmp_link_card_3.png"
                    alt="Spotlight prime focus"
                    fill
                    className="object-cover hidden desktop:block"
                  />

                  {/* 漸層覆蓋層 */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/50 z-10 transition-opacity duration-200 group-hover:opacity-80" />

                  {/* 文字內容 */}
                  <div className="left-[15px] right-[15px] bottom-[20px] absolute text-white text-[14px] font-normal font-['Times'] z-20">
                    Spotlight prime focus
                  </div>
                </div>
              </Link>
              <Link href="/dashboard" className="group">
                <div className="w-[335px] desktop:w-[174px] h-[160px] desktop:h-60 relative rounded-[20px] overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-[1.02]">
                  {/* 背景圖 - 用 CSS 控制 Mobile/Desktop 顯示不同圖片 */}
                  <Image
                    src="https://statics.bloomprotocol.ai/images/pbmp_mobile_link_card_2.jpg"
                    alt="Join quests and unlock supporter perks"
                    fill
                    className="object-cover block desktop:hidden"
                  />
                  <Image
                    src="https://statics.bloomprotocol.ai/images/pbmp_link_card_2.png"
                    alt="Join quests and unlock supporter perks"
                    fill
                    className="object-cover hidden desktop:block"
                  />

                  {/* 漸層覆蓋層 */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/50 z-10 transition-opacity duration-200 group-hover:opacity-80" />

                  {/* 文字內容 */}
                  <div className="left-[15px] right-[15px] bottom-[20px] absolute text-white text-[14px] font-normal font-['Times'] z-20">
                    Join quests and unlock supporter perks
                  </div>
                </div>
              </Link>
              <Link href="/discover" className="group">
                <div className="w-[335px] desktop:w-[174px] h-[160px] desktop:h-60 relative rounded-[20px] overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-[1.02]">
                  {/* 背景圖 - 用 CSS 控制 Mobile/Desktop 顯示不同圖片 */}
                  <Image
                    src="https://statics.bloomprotocol.ai/images/pbmp_mobile_link_card_1.jpg"
                    alt="Discover future products"
                    fill
                    className="object-cover block desktop:hidden"
                  />
                  <Image
                    src="https://statics.bloomprotocol.ai/images/pbmp_link_card_1.png"
                    alt="Discover future products"
                    fill
                    className="object-cover hidden desktop:block"
                  />

                  {/* 漸層覆蓋層 */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/50 z-10 transition-opacity duration-200 group-hover:opacity-80" />

                  {/* 文字內容 */}
                  <div className="left-[15px] right-[15px] bottom-[20px] absolute text-white text-[14px] font-normal font-['Times'] z-20">
                    Discover future products
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
