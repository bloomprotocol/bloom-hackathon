'use client';

import { TurnstileWidget, useTurnstile, isTurnstileConfigured } from '@/lib/integration/turnstile';
import { useState } from 'react';

export default function TestTurnstilePage() {
  const [token, setToken] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [verified, setVerified] = useState(false);

  const handleSuccess = (token: string) => {
    console.log('✅ Turnstile Success:', token);
    setToken(token);
    setVerified(true);
    setError('');
  };

  const handleError = (error: string) => {
    console.error('❌ Turnstile Error:', error);
    setError(error);
    setVerified(false);
  };

  const handleExpire = () => {
    console.warn('⏰ Turnstile Expired');
    setVerified(false);
    setToken('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Turnstile Diagnostic Page</h1>

        {/* Configuration Check */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Configuration Status</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Is Configured:</span>
              <span className={isTurnstileConfigured() ? 'text-green-600' : 'text-red-600'}>
                {isTurnstileConfigured() ? '✓ Yes' : '✗ No'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Site Key:</span>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || 'Not Set'}
              </code>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Current Domain:</span>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                {typeof window !== 'undefined' ? window.location.hostname : 'N/A'}
              </code>
            </div>
          </div>
        </div>

        {/* Widget Test */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Turnstile Widget</h2>
          <div className="mb-4">
            <TurnstileWidget
              onSuccess={handleSuccess}
              onError={handleError}
              onExpire={handleExpire}
              theme="light"
              size="normal"
            />
          </div>

          {/* Status */}
          {verified && (
            <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
              <div className="text-green-800 font-semibold mb-2">✓ Verification Successful</div>
              <div className="text-sm text-green-700 break-all">
                Token: {token.substring(0, 50)}...
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <div className="text-red-800 font-semibold mb-2">✗ Verification Failed</div>
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Debug Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Check if the Turnstile widget loads above</li>
            <li>Complete the challenge if prompted</li>
            <li>Check browser console for any errors</li>
            <li>Verify the domain is added to Cloudflare Turnstile settings</li>
            <li>Check if nameservers are correctly configured in Cloudflare</li>
          </ol>
        </div>

        {/* Cloudflare Dashboard Link */}
        <div className="mt-6 text-center">
          <a
            href="https://dash.cloudflare.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Open Cloudflare Dashboard →
          </a>
        </div>
      </div>
    </div>
  );
}
