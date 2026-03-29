'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { builderService, ApiKeyInfo, ApiUsageStats } from '@/lib/api/services/builderService';
import { BaseModal } from '@/components/ui/BaseModal';

export default function ApiKeysContent() {
  const [apiKeys, setApiKeys] = useState<ApiKeyInfo[]>([]);
  const [canCreateMore, setCanCreateMore] = useState(true);
  const [maxKeys, setMaxKeys] = useState(3);
  const [usage, setUsage] = useState<ApiUsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Copy state
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchApiKeys = useCallback(async () => {
    try {
      const res = await builderService.getApiKeys();
      if (res.success) {
        setApiKeys(res.data.keys);
        setCanCreateMore(res.data.canCreateMore);
        setMaxKeys(res.data.maxKeys);
      }
    } catch (err) {
      console.error('Failed to load API keys:', err);
      setError('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsageStats = useCallback(async () => {
    try {
      const res = await builderService.getApiUsageStats();
      if (res.success) {
        setUsage(res.data);
      }
    } catch (err) {
      console.error('Failed to load usage stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchApiKeys();
    fetchUsageStats();
  }, [fetchApiKeys, fetchUsageStats]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      setError('Please enter a key name');
      return;
    }

    setCreating(true);
    setError(null);
    try {
      const res = await builderService.createApiKey(newKeyName);
      if (res.success) {
        setCreatedKey(res.data.apiKey);
        setShowCreateModal(false);
        setShowKeyModal(true);
        setNewKeyName('');
        fetchApiKeys();
      } else {
        setError('Failed to create API key');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      await builderService.revokeApiKey(keyId);
      fetchApiKeys();
    } catch (err) {
      setError('Failed to revoke API key');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      // Clear previous timeout
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }

      // Reset after 1.5 seconds
      copyTimeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error('Failed to copy to clipboard', error);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[1440px] w-full px-4 desktop:px-40 desktop:pt-6 desktop:pb-20 mobile:pt-6 mobile:pb-10">
        <div className="common-container-style">
          <span className="text-[14px] text-[#696f8c]" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] w-full px-4 desktop:px-40 desktop:pt-6 desktop:pb-20 mobile:pt-6 mobile:pb-10">
      {/* Breadcrumb */}
      <nav className="breadcrumb-style">
        <Link href="/builder" className="breadcrumb-link hover:underline cursor-pointer">
          Builder
        </Link>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="breadcrumb-separator"
        >
          <path
            d="M6 4L10 8L6 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="breadcrumb-current">API</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h2
          className="text-[24px] font-bold text-[#393f49]"
          style={{ fontFamily: 'Times, serif' }}
        >
          API
        </h2>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-[12px]">
          <span className="text-[14px] text-red-600" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {error}
          </span>
        </div>
      )}

      {/* Max Keys Warning */}
      {!canCreateMore && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-[12px]">
          <span className="text-[14px] text-amber-700" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Maximum {maxKeys} API keys reached. Revoke an existing key to create a new one.
          </span>
        </div>
      )}

      {/* API Keys List */}
      <div className="common-container-style mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3
            className="text-[20px] font-bold text-[#393f49]"
            style={{ fontFamily: 'Times, serif' }}
          >
            API KEYS
          </h3>
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={!canCreateMore}
            className={`px-5 py-2.5 rounded-full text-[14px] font-semibold transition-colors ${
              canCreateMore
                ? 'bg-[#8478e0] text-white hover:bg-[#7367d0]'
                : 'bg-[#e5e5e5] text-[#9ca3af] cursor-not-allowed'
            }`}
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            + New Key
          </button>
        </div>

        {apiKeys.filter(k => k.isActive).length === 0 ? (
          <div className="py-8 text-center">
            <span className="text-[14px] text-[#696f8c]" style={{ fontFamily: 'Outfit, sans-serif' }}>
              No API keys yet. Create one to get started.
            </span>
          </div>
        ) : (
          <div className="space-y-3">
            {apiKeys.filter(k => k.isActive).map(key => (
              <div
                key={key.id}
                className="p-4 bg-white/60 rounded-[12px] border border-[#e5e5e5]"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[16px] font-semibold text-[#393f49]"
                        style={{ fontFamily: 'Outfit, sans-serif' }}
                      >
                        {key.name}
                      </span>
                    </div>
                    <div
                      className="text-[14px] text-[#696f8c] font-mono mt-1"
                    >
                      {key.keyPrefix}
                    </div>
                    <div
                      className="text-[12px] text-[#9ca3af] mt-2"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    >
                      Created: {new Date(key.createdAt).toLocaleDateString()}
                      {key.lastUsedAt && ` | Last used: ${new Date(key.lastUsedAt).toLocaleDateString()}`}
                    </div>
                  </div>
                  <button
                    className="text-[14px] text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                    onClick={() => handleRevokeKey(key.id)}
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Usage Statistics */}
      {usage && (
        <div className="common-container-style">
          <h3
            className="text-[20px] font-bold text-[#393f49] mb-4"
            style={{ fontFamily: 'Times, serif' }}
          >
            USAGE STATISTICS
          </h3>
          <p
            className="text-[12px] text-[#9ca3af] mb-4"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Last 30 Days
          </p>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <div
                className="text-[24px] font-bold text-[#393f49]"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {usage.summary.totalCalls.toLocaleString()}
              </div>
              <div
                className="text-[14px] text-[#696f8c]"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Total Calls
              </div>
            </div>
            <div>
              <div
                className="text-[24px] font-bold text-[#393f49]"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {usage.summary.successRate}%
              </div>
              <div
                className="text-[14px] text-[#696f8c]"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Success Rate
              </div>
            </div>
            <div>
              <div
                className="text-[24px] font-bold text-[#393f49]"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {usage.summary.failedCalls.toLocaleString()}
              </div>
              <div
                className="text-[14px] text-[#696f8c]"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Failed Calls
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Key Modal */}
      <BaseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        logo={{
          src: "https://statics.bloomprotocol.ai/logo/bp_logo_icon.svg",
          alt: "Bloom Protocol",
        }}
        caption="CREATE NEW API KEY"
      >
        <div className="flex flex-col gap-4">
          <div>
            <label
              className="block text-[14px] text-[#696f8c] mb-2"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Key Name
            </label>
            <input
              type="text"
              placeholder="e.g., Production Key"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-[#e5e5e5] rounded-[12px] text-[#393f49] placeholder-[#9ca3af] focus:outline-none focus:border-[#8478e0] text-[14px]"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              className="px-4 py-2 text-[14px] text-[#696f8c] hover:text-[#393f49] transition-colors"
              style={{ fontFamily: 'Outfit, sans-serif' }}
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </button>
            <button
              className="px-5 py-2.5 bg-[#8478e0] text-white rounded-full text-[14px] font-semibold hover:bg-[#7367d0] transition-colors disabled:opacity-50"
              style={{ fontFamily: 'Outfit, sans-serif' }}
              onClick={handleCreateKey}
              disabled={creating}
            >
              {creating ? 'Creating...' : 'Create Key'}
            </button>
          </div>
        </div>
      </BaseModal>

      {/* Show Key Modal */}
      <BaseModal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        logo={{
          src: "https://statics.bloomprotocol.ai/logo/bp_logo_icon.svg",
          alt: "Bloom Protocol",
        }}
        caption="API KEY CREATED"
        closeStrategy="none"
      >
        <div className="flex flex-col gap-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-[12px]">
            <p
              className="text-[14px] text-amber-700"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Copy your API key now. You won&apos;t be able to see it again!
            </p>
          </div>
          <div className="relative">
            <code
              className="block p-4 bg-[#f5f5f5] rounded-[12px] text-[14px] text-[#393f49] break-all font-mono border border-[#e5e5e5] pr-16"
            >
              {createdKey}
            </code>
            <button
              className="absolute top-1/2 right-3 -translate-y-1/2 p-2 hover:bg-white/50 rounded-lg transition-colors"
              onClick={() => copyToClipboard(createdKey)}
            >
              {copied ? (
                <span className="text-[12px] text-[#71ca41] font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Copied!
                </span>
              ) : (
                <Image
                  src="https://statics.bloomprotocol.ai/icon/yoona-copy.png"
                  alt="Copy"
                  width={20}
                  height={20}
                  className="opacity-50 hover:opacity-100 transition-opacity"
                />
              )}
            </button>
          </div>
          <div className="flex justify-end">
            <button
              className="px-5 py-2.5 bg-[#8478e0] text-white rounded-full text-[14px] font-semibold hover:bg-[#7367d0] transition-colors"
              style={{ fontFamily: 'Outfit, sans-serif' }}
              onClick={() => setShowKeyModal(false)}
            >
              Done
            </button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}
