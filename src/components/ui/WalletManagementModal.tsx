'use client';

import { BaseModal } from '@/components/ui';
import Image from 'next/image';
import { useState } from 'react';
import { Bot } from 'lucide-react';

interface AgentWallet {
  address: string;
  network: string;
  x402Endpoint?: string;
  balance?: string;
}

interface WalletManagementModalProps {
  wallet: AgentWallet;
  onClose: () => void;
}

export default function WalletManagementModal({
  wallet,
  onClose
}: WalletManagementModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'settings'>('overview');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const handleCopy = (text: string, itemName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(itemName);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const balance = wallet.balance || '0';
  const isMainnet = wallet.network === 'base-mainnet' || wallet.network === 'base';
  const networkDisplay = isMainnet ? 'Base' : 'Base Sepolia';

  return (
    <BaseModal
      isOpen={true}
      onClose={onClose}
      logo={{
        src: "https://statics.bloomprotocol.ai/logo/bp_logo_icon.svg",
        alt: "Bloom Protocol",
        width: 34.62,
        height: 34
      }}
      caption={
        <div className="flex items-center gap-2">
          <span className="modal-title-text">Agent Wallet</span>
          <span className="px-2 py-1 bg-[#8478e0]/10 rounded-[6px] font-['Outfit'] font-normal text-[10px] text-[#8478e0]">
            Base
          </span>
        </div>
      }
    >
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[#e7e6f2]">
        {['overview', 'transactions', 'settings'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`
              px-4 py-2 font-['Outfit'] font-medium text-[14px] tracking-[-0.28px] border-b-2 transition-colors
              ${activeTab === tab
                ? 'text-[#8478e0] border-[#8478e0]'
                : 'text-[#696f8c] border-transparent hover:text-[#393f49]'
              }
            `}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Balance & Network Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[12px] bg-gradient-to-br from-[#f5f3ff] to-[#faf5ff] border border-[#e9d5ff] p-4">
              <div className="text-[12px] font-['Outfit'] text-[#696f8c] mb-1">Balance</div>
              <div className="text-[24px] font-['Outfit'] font-bold text-[#393f49]">{balance}</div>
              <div className="text-[11px] font-['Outfit'] text-[#696f8c]">USDC</div>
            </div>

            <div className="rounded-[12px] bg-gradient-to-br from-[#f5f3ff] to-[#faf5ff] border border-[#e9d5ff] p-4">
              <div className="text-[12px] font-['Outfit'] text-[#696f8c] mb-1">Network</div>
              <div className="flex items-center gap-2">
                <div className="text-[18px] font-['Outfit'] font-semibold text-[#393f49]">{networkDisplay}</div>
                <div className={`w-2 h-2 rounded-full ${isMainnet ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              </div>
              <div className="text-[11px] font-['Outfit'] text-[#696f8c]">{isMainnet ? 'Mainnet' : 'Testnet'}</div>
            </div>
          </div>

          {/* Wallet Address */}
          <div className="rounded-[12px] bg-[#f6f6f6] border border-[#e7e6f2] p-4">
            <div className="text-[12px] font-['Outfit'] text-[#696f8c] mb-2">Wallet Address</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 font-['Courier'] text-[12px] text-[#393f49] break-all">
                {wallet.address}
              </code>
              <button
                onClick={() => handleCopy(wallet.address, 'address')}
                className="shrink-0 p-2 hover:bg-white rounded-lg transition-colors"
              >
                {copiedItem === 'address' ? (
                  <span className="text-[12px] text-green-600">✓</span>
                ) : (
                  <Image
                    src="https://statics.bloomprotocol.ai/icon/yoona-copy.png"
                    alt="Copy"
                    width={20}
                    height={20}
                  />
                )}
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button className="h-[44px] flex items-center justify-center gap-2 rounded-[10px] border-2 border-[#e7e6f2] hover:border-[#8478e0] transition-colors">
              <span className="text-[18px]">📥</span>
              <span className="font-['Outfit'] font-medium text-[14px] text-[#393f49]">Receive</span>
            </button>
            <button
              onClick={() => window.open(`https://basescan.org/address/${wallet.address}`, '_blank')}
              className="h-[44px] flex items-center justify-center gap-2 rounded-[10px] border-2 border-[#e7e6f2] hover:border-[#8478e0] transition-colors"
            >
              <span className="text-[18px]">🔍</span>
              <span className="font-['Outfit'] font-medium text-[14px] text-[#393f49]">BaseScan</span>
            </button>
          </div>

          {/* Wallet Security Info */}
          <div className="rounded-[12px] bg-blue-50 border border-blue-200 p-4">
            <div className="flex items-start gap-3">
              <span className="text-[24px]">🛡️</span>
              <div className="flex-1">
                <div className="font-['Outfit'] font-semibold text-[14px] text-[#393f49] mb-1">
                  Secured Wallet
                </div>
                <p className="font-['Outfit'] font-normal text-[12px] text-[#696f8c] leading-[1.5]">
                  Your wallet is managed through a secure embedded wallet infrastructure. Private keys are never exposed.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="text-center py-12">
          <div className="text-[48px] mb-4 opacity-40">📜</div>
          <p className="font-['Outfit'] text-[14px] text-[#696f8c] mb-2">No transactions yet</p>
          <p className="font-['Outfit'] text-[12px] text-[#696f8c]">
            Your transaction history will appear here
          </p>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-4">
          {/* Export Wallet */}
          <div className="rounded-[12px] bg-[#f6f6f6] border border-[#e7e6f2] p-4">
            <div className="font-['Outfit'] font-semibold text-[14px] text-[#393f49] mb-2">
              Backup & Security
            </div>
            <p className="font-['Outfit'] text-[12px] text-[#696f8c] mb-3">
              Export your wallet data for backup purposes. Store it securely.
            </p>
            <button className="w-full h-[40px] flex items-center justify-center gap-2 rounded-[8px] border-2 border-[#e7e6f2] hover:border-[#8478e0] transition-colors">
              <span className="text-[16px]">💾</span>
              <span className="font-['Outfit'] font-medium text-[13px] text-[#393f49]">
                Export Wallet Data
              </span>
            </button>
          </div>

          {/* X402 Endpoint */}
          {wallet.x402Endpoint && (
            <div className="rounded-[12px] bg-[#f6f6f6] border border-[#e7e6f2] p-4">
              <div className="font-['Outfit'] font-semibold text-[14px] text-[#393f49] mb-2">
                X402 Payment Endpoint
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-['Courier'] text-[11px] text-[#393f49] break-all bg-white p-2 rounded border border-[#e7e6f2]">
                  {wallet.x402Endpoint}
                </code>
                <button
                  onClick={() => handleCopy(wallet.x402Endpoint!, 'x402')}
                  className="shrink-0 p-2 hover:bg-white rounded-lg transition-colors"
                >
                  {copiedItem === 'x402' ? (
                    <span className="text-[12px] text-green-600">✓</span>
                  ) : (
                    <Image
                      src="https://statics.bloomprotocol.ai/icon/yoona-copy.png"
                      alt="Copy"
                      width={20}
                      height={20}
                    />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* About CDP */}
          <div className="rounded-[12px] bg-[#f6f6f6] border border-[#e7e6f2] p-4">
            <div className="font-['Outfit'] font-semibold text-[14px] text-[#393f49] mb-3">
              About Coinbase CDP
            </div>
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="text-[20px]">🔐</span>
                <div className="flex-1">
                  <div className="font-['Outfit'] font-medium text-[12px] text-[#393f49]">MPC Technology</div>
                  <p className="font-['Outfit'] text-[11px] text-[#696f8c] leading-[1.4]">
                    Multi-Party Computation for enhanced security
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-[20px]">⚡</span>
                <div className="flex-1">
                  <div className="font-['Outfit'] font-medium text-[12px] text-[#393f49]">Gasless Transactions</div>
                  <p className="font-['Outfit'] text-[11px] text-[#696f8c] leading-[1.4]">
                    Coinbase sponsors gas fees on all transactions
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Bot className="w-5 h-5 text-[#8478e0] shrink-0" strokeWidth={2} />
                <div className="flex-1">
                  <div className="font-['Outfit'] font-medium text-[12px] text-[#393f49]">Agent-Native</div>
                  <p className="font-['Outfit'] text-[11px] text-[#696f8c] leading-[1.4]">
                    Built specifically for AI agents
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => window.open('https://docs.cdp.coinbase.com/agentkit', '_blank')}
              className="w-full mt-4 h-[36px] flex items-center justify-center gap-2 rounded-[8px] border-2 border-[#e7e6f2] hover:border-[#8478e0] transition-colors"
            >
              <span className="font-['Outfit'] font-medium text-[13px] text-[#8478e0]">
                Learn More →
              </span>
            </button>
          </div>
        </div>
      )}
    </BaseModal>
  );
}
