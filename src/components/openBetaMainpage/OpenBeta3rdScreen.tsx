'use client'

import React from 'react';

// CDN URLs for images
const IMAGES = {
  logo: 'https://statics.bloomprotocol.ai/images/home/openBeta/bp_logo_in_3rdScreen.png',
  art1: 'https://statics.bloomprotocol.ai/images/home/openBeta/3rdScrren_1st_image.jpg',
  art2: 'https://statics.bloomprotocol.ai/images/home/openBeta/3rdScrren_2nd_image.jpg',
  art3: 'https://statics.bloomprotocol.ai/images/home/openBeta/openBeta_3rd_image_03.jpg',
};

const SECTIONS = [
  {
    number: '1',
    title: <>Tribal<br />Knowledge</>,
    descriptions: [
      'Your agent starts from what the tribe already learned — not from zero.',
    ],
    imageSrc: IMAGES.art2,
    imageAlt: 'Tribal Knowledge',
  },
  {
    number: '2',
    title: <>Orchestrated<br />Roles</>,
    descriptions: [
      'Four specialized roles, each seeing only what it needs. Independent analysis, no groupthink.',
    ],
    imageSrc: IMAGES.art1,
    imageAlt: 'Orchestrated Roles',
  },
  {
    number: '3',
    title: <>Privacy<br />by Design</>,
    descriptions: [
      'All execution stays on your machine. Bloom only receives structured feedback.',
    ],
    imageSrc: IMAGES.art3,
    imageAlt: 'Privacy by Design',
  },
];

interface SectionProps {
  number: string;
  title: React.ReactNode;
  descriptions: string[];
  imageSrc: string;
  imageAlt: string;
}

function Section({ number, title, descriptions, imageSrc, imageAlt }: SectionProps) {
  return (
    <div className="w-full border-t border-[#595340] pt-[40px] desktop:pt-[80px]">
      <div className="flex flex-col desktop:flex-row gap-[24px] desktop:gap-0">
        {/* Number + Title */}
        <div className="desktop:w-[600px] flex flex-col">
          <div className="flex gap-[4px] items-center">
            <div className="flex flex-col font-semibold justify-center leading-[0] text-[#13120b] text-[120px] desktop:text-[280px] text-center w-[66px] desktop:w-[155px]" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <p className="leading-[96px] desktop:leading-[252px]">{number}</p>
            </div>
            <div className="font-extralight leading-[1.2] text-[#13120b] text-[24px] desktop:text-[48px]" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <span>{title}</span>
            </div>
          </div>
          <div className="desktop:flex-1"></div>
        </div>

        {/* Description + Image */}
        <div className="desktop:w-[600px] flex flex-col gap-[24px] desktop:gap-[64px]">
          <div className="flex flex-col font-light gap-[16px] leading-[36px] desktop:leading-[44px] text-[22px] desktop:text-[32px] text-black tracking-[-0.8px]" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {descriptions.map((desc, idx) => (
              <p key={idx}>{desc}</p>
            ))}
          </div>
          <div className="w-full aspect-[600/300] desktop:w-[600px] desktop:h-[300px]">
            <img
              src={imageSrc}
              alt={imageAlt}
              className="w-full h-full object-cover mix-blend-darken"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OpenBeta3rdScreen() {
  return (
    <section className="bg-[#F9F4FF] w-full">
      <div className="max-w-[1440px] mx-auto px-[16px] desktop:px-[108px] pt-[80px] pb-[140px] desktop:pt-[90px] desktop:pb-[200px] flex flex-col items-center">
        {/* Logo and heading */}
        <div className="flex flex-col items-center w-full">
          <div className="w-[140px] h-[140px] desktop:w-[340px] desktop:h-[340px] desktop:p-[30.7px] flex items-center justify-center shrink-0">
            <img
              src={IMAGES.logo}
              alt="Bloom Protocol Logo"
              className="w-full h-full desktop:w-[249px] desktop:h-[249px]"
            />
          </div>
          <div className="flex flex-col items-center justify-center text-center w-full desktop:mx-[307px]">
            <h2 className="flex flex-col justify-center not-italic text-[#434343] text-[44px] desktop:text-[64px] tracking-[-0.96px] desktop:tracking-[-1.35px] w-full desktop:w-[900px] m-0 font-normal" style={{ fontFamily: 'Gilkys, serif' }}>
              WHAT MAKES A TRIBE
            </h2>
          </div>
        </div>

        {/* Sections */}
        <div className="flex flex-col w-full mt-[59px]">
          {SECTIONS.map((section) => (
            <Section key={section.number} {...section} />
          ))}
        </div>
      </div>
    </section>
  );
}
