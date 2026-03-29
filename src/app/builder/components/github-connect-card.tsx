'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { apiGet } from '@/lib/api/apiConfig';

/**
 * GitHubConnectCard — shown in builder portal.
 * If GitHub is not connected, shows a "Connect GitHub" button.
 * If connected, shows the GitHub username with a green checkmark.
 */
export default function GitHubConnectCard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [justConnected, setJustConnected] = useState(false);

  useEffect(() => {
    // Check URL params for just-connected indicator
    const connectedParam = searchParams.get('github_connected');
    if (connectedParam) {
      setGithubUsername(connectedParam);
      setJustConnected(true);
      setIsLoading(false);

      // Clean up URL param without navigation
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('github_connected');
      const cleanUrl = newParams.toString()
        ? `${pathname}?${newParams.toString()}`
        : pathname;
      router.replace(cleanUrl, { scroll: false });
      return;
    }

    // Fetch from backend
    (async () => {
      try {
        const res = await apiGet<{ success: boolean; data: { githubUsername?: string } }>(
          '/users/me/github',
        );
        if (res?.data?.githubUsername) {
          setGithubUsername(res.data.githubUsername);
        }
      } catch {
        // Not connected — expected
      } finally {
        setIsLoading(false);
      }
    })();
  }, [searchParams, router, pathname]);

  const handleConnect = () => {
    if (!isAuthenticated) return; // Guard: must be logged in
    window.location.href = '/api/auth/github?returnTo=/builder';
  };

  if (isLoading) return null;

  return (
    <div
      className="rounded-[20px] p-6"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(245,240,255,0.35) 100%)',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 4px 24px rgba(100,80,150,0.08), inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(150,130,200,0.06)',
        backdropFilter: 'blur(24px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.2)',
      }}
    >
      <h3
        className="text-[15px] font-semibold text-[#1a1228] mb-3"
        style={{ fontFamily: 'Outfit, sans-serif' }}
      >
        GITHUB IDENTITY
      </h3>

      {githubUsername ? (
        /* Connected state */
        <div>
          {justConnected && (
            <p
              className="text-[12px] text-emerald-600 mb-2"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              GitHub connected successfully! You can now claim skills.
            </p>
          )}
          <div className="flex items-center gap-3 p-3 bg-white/40 rounded-xl">
            {/* GitHub icon */}
            <svg className="w-5 h-5 text-[#24292f] shrink-0" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>

            <span
              className="text-[14px] font-medium text-[#393f49]"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              @{githubUsername}
            </span>

            {/* Green checkmark */}
            <svg className="w-4 h-4 text-emerald-500 ml-auto shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      ) : (
        /* Not connected state */
        <div className="text-center py-4">
          <p
            className="text-[13px] text-[#9ca3af] mb-3"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Connect your GitHub account to verify skill ownership and claim escrowed funds.
          </p>
          <button
            onClick={handleConnect}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-[13px] text-white bg-[#24292f] hover:bg-[#1b1f23] transition-colors"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            {/* GitHub icon */}
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            Connect GitHub
          </button>
        </div>
      )}
    </div>
  );
}
