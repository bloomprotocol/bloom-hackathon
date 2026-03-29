'use client';

import Image from 'next/image';

/**
 * Seed Pass Certificate Component
 *
 * This component is a direct translation from Figma design.
 * All layers and positioning are preserved exactly as specified in Figma.
 *
 * Layer structure from Figma:
 * - Property 1=Default (root)
 *   - Rectangle 39337 (bottom bar)
 *   - Yoona background image
 *   - shape (decorative shape)
 *   - Rectangle 34624084 (overlay)
 *   - logo_mark (background, opacity 30%)
 *   - Overlay gradient
 *   - Component 11 (content container)
 *     - logo_mark (foreground icon)
 *     - Text elements (L1, Early Seed Supporter, Certificate, Seed)
 *     - Branches decoration
 */

interface SeedPassCertificateProps {
  className?: string;
}

export default function SeedPassCertificate({ className = '' }: SeedPassCertificateProps) {
  return (
    <div
      className={`border-[1.5px] border-solid border-white h-[320px] overflow-clip relative rounded-[16px] w-[272px] ${className}`}
      style={{
        boxShadow: '0px 5px 20px 0px rgba(140, 255, 136, 0.2), 0px 5px 15px 0px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Layer: Rectangle 39337 - Bottom bar */}
      <div className="absolute bottom-[-1.97px] h-[41.47px] left-[calc(-0.03%-1.5px)] right-[calc(0.06%-1.5px)]">
        <Image
          src="/certificates/seed-rectangle.svg"
          alt=""
          fill
          className="max-w-none"
        />
      </div>

      {/* Layer: Yoona_ultra-clean_minimalist_card_background - Main background image */}
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-[calc(50%+0.5px)] size-[323px] top-[calc(50%+0.5px)]">
        <Image
          src="/certificates/seed-bg.png"
          alt=""
          fill
          className="object-cover pointer-events-none"
          priority
        />
      </div>

      {/* Layer: shape - Decorative shape at bottom */}
      <div className="-translate-x-1/2 absolute bottom-[calc(-4.38%-1.5px)] left-[calc(50%-8.35px)] top-[calc(60.62%-1.5px)] w-[349px]">
        <div className="absolute inset-[-51.43%_-20.63%]">
          <Image
            src="/certificates/seed-shape.svg"
            alt=""
            fill
            className="max-w-none"
          />
        </div>
      </div>

      {/* Layer: Rectangle 34624084 (if exists) - Dark overlay */}
      <div className="absolute backdrop-blur-[5px] bg-[rgba(0,0,0,0.2)] h-[338px] left-[-1.5px] top-[-3.5px] w-[277px]" />

      {/* Layer: logo_mark - Background decorative logo (30% opacity) */}
      <div className="absolute inset-[calc(-73.9%-1.5px)_calc(-101.84%-1.5px)_calc(-89.51%-1.5px)_calc(-88.24%-1.5px)] opacity-30">
        <div className="absolute aspect-[40/40] left-0 overflow-clip right-0 top-0">
          <div className="absolute inset-[5%_22.5%]">
            {/* Component 1 - Stem part */}
            <div className="absolute inset-[13.1%_0_0_0]">
              <div className="absolute inset-0">
                <Image
                  src="/certificates/logo-stem.svg"
                  alt=""
                  fill
                  className="max-w-none"
                  style={{ color: 'rgba(246, 246, 246, 1)' } as any}
                />
              </div>
            </div>
            {/* Component 1 - Leaf part */}
            <div className="absolute inset-[0_33.92%_61.3%_33.76%]">
              <div className="absolute inset-0">
                <Image
                  src="/certificates/logo-leaf.svg"
                  alt=""
                  fill
                  className="max-w-none"
                  style={{ color: 'rgba(246, 246, 246, 1)' } as any}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layer: Overlay gradient - Light overlay with mix-blend */}
      <div
        className="-translate-x-1/2 -translate-y-1/2 absolute h-[349px] left-[calc(50%-0.5px)] mix-blend-overlay top-[calc(50%-0.5px)] w-[325px]"
        style={{
          backgroundImage: 'linear-gradient(138.114deg, rgb(255, 255, 227) 10.035%, rgba(255, 255, 255, 0.1) 49.686%, rgba(0, 0, 0, 0.5) 88.583%)',
        }}
      />

      {/* Layer: Component 11 - Main content container */}
      <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[278px] left-[calc(50%+0.06px)] top-1/2 w-[234.115px]">
        {/* Layer: logo_mark - Foreground icon (top right) */}
        <div className="absolute inset-[0.15%_0.05%_84.38%_81.16%]">
          <div className="absolute aspect-[40/40] left-0 overflow-clip right-0 top-0">
            <div className="absolute inset-[5%_22.5%]">
              {/* Stem filled */}
              <div className="absolute inset-[13.1%_0_0_0]">
                <div className="absolute inset-[-5.81%_-16.53%_-17.44%_-16.53%]">
                  <Image
                    src="/certificates/logo-stem-filled.svg"
                    alt=""
                    fill
                    className="max-w-none"
                  />
                </div>
              </div>
              {/* Leaf filled */}
              <div className="absolute inset-[0_33.92%_61.3%_33.76%]">
                <div className="absolute inset-[-13.05%_-51.14%_-39.15%_-51.14%]">
                  <Image
                    src="/certificates/logo-leaf-filled.svg"
                    alt=""
                    fill
                    className="max-w-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Layer: Text - Level and description */}
        <div className="absolute content-stretch flex flex-col font-['Tobias'] items-start leading-[normal] left-0 not-italic text-white top-[173px] w-[148px]">
          <p className="min-w-full opacity-50 relative shrink-0 text-[25px] tracking-[-1px] w-[min-content]">
            L1
          </p>
          <p className="opacity-80 relative shrink-0 text-[17px]">
            Early Seed Supporter
          </p>
        </div>

        {/* Layer: Text - Certificate badge */}
        <div className="absolute flex flex-col font-['Tobias'] inset-[94.24%_0.05%_-1.08%_71.33%] justify-end leading-[0] not-italic opacity-50 text-[14px] text-white">
          <p className="leading-[normal]">Certificate</p>
        </div>

        {/* Layer: Text - Title "Seed" */}
        <p
          className="absolute font-['Tobias'] inset-[0_57.38%_83.81%_0] leading-[normal] not-italic text-[32px] text-white tracking-[-1.28px]"
          style={{ textShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' }}
        >
          Seed
        </p>

        {/* Layer: Branches decoration - Bottom branches */}
        <div className="-translate-x-1/2 absolute bottom-[8.99%] left-[calc(50%+0.44px)] top-[91.01%] w-[332px]">
          <div className="absolute inset-[-1px_0_0_0]">
            <Image
              src="/certificates/branches.svg"
              alt=""
              fill
              className="max-w-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
