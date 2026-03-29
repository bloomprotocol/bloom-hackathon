'use client';

import SeedPassCertificate from './SeedPassCertificate';

/**
 * Showcase component to display all three certificate variants
 * Useful for development and preview purposes
 */
export default function CertificateShowcase() {
  return (
    <div className="p-8 bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-serif text-4xl font-bold text-gray-900 mb-8">
          Seed Pass Certificates
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="flex flex-col items-center gap-4">
            <SeedPassCertificate level="seed" />
            <div className="text-center">
              <p className="font-['Outfit'] font-semibold text-sm text-gray-700">Level 1: Seed</p>
              <p className="font-['Outfit'] text-xs text-gray-500">Early Seed Supporter</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <SeedPassCertificate level="sprout" />
            <div className="text-center">
              <p className="font-['Outfit'] font-semibold text-sm text-gray-700">Level 2: Sprout</p>
              <p className="font-['Outfit'] text-xs text-gray-500">Activated Sprout Supporter</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <SeedPassCertificate level="bloom" />
            <div className="text-center">
              <p className="font-['Outfit'] font-semibold text-sm text-gray-700">Level 3: Bloom</p>
              <p className="font-['Outfit'] text-xs text-gray-500">Bloom Supporter</p>
            </div>
          </div>
        </div>

        {/* Usage Example */}
        <div className="mt-12 p-6 bg-white rounded-xl shadow-sm">
          <h2 className="font-['Outfit'] font-semibold text-lg text-gray-900 mb-4">
            Usage Example
          </h2>
          <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
            <code className="text-sm text-gray-800">
{`import { SeedPassCertificate } from '@/components/certificates';

// Use in your component
<SeedPassCertificate level="seed" />
<SeedPassCertificate level="sprout" />
<SeedPassCertificate level="bloom" />`}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}
