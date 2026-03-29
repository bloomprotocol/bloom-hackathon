'use client';

/**
 * Dashboard Client Component
 *
 * Handles Agent token authentication and login gate
 */

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAgentSession } from '@/hooks/useAgentSession';
import { useAuth } from '@/lib/context/AuthContext';
import SupporterLayout from './components/supporter-layout';
import DashboardPreview from './components/dashboard-preview';

export default function DashboardClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { agentData, authenticateWithToken } = useAgentSession();
  const { user } = useAuth();

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');

    if (token && !isAuthenticating) {
      handleAgentAuth(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // REMOVED: No longer auto-show login modal on page load
  // Instead, email capture will be triggered when users try to view card details
  // This allows non-logged-in users to browse the dashboard for better UX and growth

  const handleAgentAuth = async (token: string) => {
    try {
      setIsAuthenticating(true);
      setAuthError(null);

      console.log('🔐 Authenticating Agent with token...');

      await authenticateWithToken(token);

      console.log('✅ Agent authenticated successfully');

      // Remove token from URL for security
      router.replace('/dashboard');
    } catch (error) {
      console.error('❌ Agent auth failed:', error);
      setAuthError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Show loading state during authentication
  if (isAuthenticating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Verifying Agent authentication...</p>
        </div>
      </div>
    );
  }

  // Show error if auth failed
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md p-8 bg-red-50 rounded-lg">
          <h2 className="text-xl font-bold text-red-900 mb-2">Authentication Failed</h2>
          <p className="text-red-700 mb-4">{authError}</p>
          <button
            onClick={() => {
              setAuthError(null);
              router.replace('/dashboard');
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Show preview for non-logged-in users
  if (!user) {
    return <DashboardPreview />;
  }

  return (
    <div className="space-y-8">
      <SupporterLayout />
    </div>
  );
}
