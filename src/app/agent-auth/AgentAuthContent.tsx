'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AgentAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'exchanging' | 'authenticating' | 'success' | 'error'>('exchanging');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const code = searchParams.get('code');

    if (!code) {
      setStatus('error');
      setError('No authentication code provided');
      return;
    }

    authenticateWithCode(code);
  }, [searchParams]);

  async function authenticateWithCode(code: string) {
    try {
      // Step 1: Exchange code for token
      setStatus('exchanging');
      const exchangeResponse = await fetch('/api/agent/auth/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!exchangeResponse.ok) {
        const error = await exchangeResponse.json();
        throw new Error(error.error || 'Failed to exchange code');
      }

      const { token } = await exchangeResponse.json();
      console.log('✅ Code exchanged for token');

      // Step 2: Authenticate with token
      setStatus('authenticating');
      const authResponse = await fetch('/api/agent/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!authResponse.ok) {
        const error = await authResponse.json();
        throw new Error(error.error || 'Authentication failed');
      }

      const { agentData } = await authResponse.json();
      console.log('✅ Agent authenticated:', agentData.address);

      // Store agent data (must match key used by useAgentSession hook)
      if (typeof window !== 'undefined') {
        localStorage.setItem('agent-data', JSON.stringify(agentData));
      }

      // Step 3: Redirect to dashboard with signal for auto-open
      setStatus('success');
      setTimeout(() => {
        window.location.href = '/dashboard?from=agent';
      }, 1000);
    } catch (err) {
      console.error('Authentication failed:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Logo/Icon */}
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {status === 'success' ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                ) : status === 'error' ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                )}
              </svg>
            </div>
          </div>

          {/* Status Messages */}
          {status === 'exchanging' && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Verifying Code
              </h1>
              <p className="text-gray-600 mb-6">
                Exchanging your authentication code...
              </p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              </div>
            </>
          )}

          {status === 'authenticating' && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Authenticating
              </h1>
              <p className="text-gray-600 mb-6">
                Setting up your agent dashboard...
              </p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <h1 className="text-2xl font-bold text-green-600 mb-2">
                Success!
              </h1>
              <p className="text-gray-600 mb-6">
                Redirecting to your dashboard...
              </p>
              <div className="flex justify-center">
                <svg
                  className="w-12 h-12 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <h1 className="text-2xl font-bold text-red-600 mb-2">
                Authentication Failed
              </h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
              >
                Return to Home
              </button>
            </>
          )}
        </div>

        {/* Help Text */}
        {status !== 'success' && (
          <p className="text-center text-sm text-gray-500 mt-4">
            {status === 'error'
              ? 'Your authentication code may have expired or is invalid.'
              : 'This usually takes just a few seconds...'}
          </p>
        )}
      </div>
    </div>
  );
}
