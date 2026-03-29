'use client';

import Image from 'next/image';

/**
 * Seed Pass Certificate Component
 *
 * Uses static PNG images exported from Figma for pixel-perfect accuracy.
 * This approach ensures 100% visual fidelity with the Figma design.
 *
 * To update designs:
 * 1. Export new PNGs from Figma (2x or 3x scale)
 * 2. Save to public/certificates/{level}-certificate.png
 * 3. Images will update automatically
 */

interface SeedPassCertificateProps {
  level: 'seed' | 'sprout' | 'bloom';
  className?: string;
}

const certificateConfig = {
  seed: {
    src: '/certificates/seed-certificate.png',
    alt: 'Seed Level Certificate - Early Seed Supporter',
    label: 'Level 1: Seed',
    description: 'Early Seed Supporter',
  },
  sprout: {
    src: '/certificates/sprout-certificate.png',
    alt: 'Sprout Level Certificate - Activated Sprout Supporter',
    label: 'Level 2: Sprout',
    description: 'Activated Sprout Supporter',
  },
  bloom: {
    src: '/certificates/bloom-certificate.png',
    alt: 'Bloom Level Certificate - Bloom Supporter',
    label: 'Level 3: Bloom',
    description: 'Bloom Supporter',
  },
};

export default function SeedPassCertificate({ level, className = '' }: SeedPassCertificateProps) {
  const config = certificateConfig[level];

  return (
    <div className={`relative w-[272px] h-[320px] ${className}`}>
      <Image
        src={config.src}
        alt={config.alt}
        width={272}
        height={320}
        className="w-full h-full object-contain"
        priority
      />
    </div>
  );
}
