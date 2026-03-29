'use client';

import { BaseModal } from '@/components/ui';
import { useAuth } from '@/lib/context/AuthContext';
import { useUserProfileContext } from '@/app/(protected)/dashboard/contexts/user-profile-context';
// Phase 2: import { useAgentSession } from '@/hooks/useAgentSession';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react';
import { referralService } from '@/lib/api/services/referralService';
import { switchToBuilder } from '@/lib/api/services/authService';
import { setCookie, COOKIE_KEYS } from '@/lib/utils/storage';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '@/lib/utils/logger';
import projectService from '@/lib/api/services/projectService';
// Phase 2: import WalletManagementModal from './WalletManagementModal';
// Phase 2: import { Bot } from 'lucide-react';
// Don't import useDashboardView directly to avoid static build issues

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// 從 ProfileContext 獲取數據

// CSS for cute shake animation
const shakeStyles = `
    @keyframes shakeCute {
        0%, 100% { transform: translateX(0) rotate(0deg); }
        10% { transform: translateX(-2px) rotate(-5deg); }
        20% { transform: translateX(2px) rotate(5deg); }
        30% { transform: translateX(-2px) rotate(-5deg); }
        40% { transform: translateX(2px) rotate(5deg); }
        50% { transform: translateX(0) rotate(0deg) scale(1.1); }
        60% { transform: translateX(0) rotate(0deg) scale(1); }
    }
    
    .shake-cute {
        animation: shakeCute 0.6s ease-in-out;
    }
`;

export default function ProfileModal({
    isOpen,
    onClose
}: ProfileModalProps) {
    const { user, logout, refreshToken } = useAuth();
    const { dashboardData } = useUserProfileContext();
    // Phase 2: const { agentData } = useAgentSession();
    const router = useRouter()
    const pathname = usePathname();
    const queryClient = useQueryClient();
    const [isGeneratingCode, setIsGeneratingCode] = useState(false);
    const [referralCode, setReferralCode] = useState<string | null>(dashboardData?.userInfo?.referralCode || null);
    const [isSwitchingRole, setIsSwitchingRole] = useState(false);
    const [currentRole, setCurrentRole] = useState<string>(dashboardData?.userInfo?.role || 'USER');
    const [userProject, setUserProject] = useState<any>(null);
    const [isLoadingProject, setIsLoadingProject] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    // Phase 2: const [showWalletManagement, setShowWalletManagement] = useState(false);
    
    
    const uid = user?.uid ? `${user.uid}` : '';
    const walletAddress = user?.walletAddress || '';
    const shortWalletAddress = walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : '';

    // Sync role and referral code from profile data when it changes
    useEffect(() => {
        if (dashboardData?.userInfo?.role) {
            setCurrentRole(dashboardData.userInfo.role);
            // Also update the cookie with the correct format when we have fresh data
            setCookie(COOKIE_KEYS.ROLE, dashboardData.userInfo.role);
        }
        if (dashboardData?.userInfo?.referralCode) {
            setReferralCode(dashboardData.userInfo.referralCode);
        }
    }, [dashboardData?.userInfo?.role, dashboardData?.userInfo?.referralCode]);

    // Load user's project when modal opens and user is a builder
    useEffect(() => {
        const loadUserProject = async () => {
            if (!isOpen || currentRole !== 'BUILDER' || !user?.uid) {
                setUserProject(null);
                setIsLoadingProject(false);
                return;
            }
            
            setIsLoadingProject(true);
            try {
                const projects = await projectService.getMyProjects();
                if (projects && projects.length > 0) {
                    setUserProject(projects[0]); // Get the first project (most recent)
                } else {
                    setUserProject(null);
                }
            } catch (error: any) {
                // Only log actual errors, not empty responses or 404s (user has no projects)
                if (error && error.response?.status !== 404 && error.status !== 404) {
                    logger.error('Failed to load user project', { error });
                }
                setUserProject(null);
            } finally {
                setIsLoadingProject(false);
            }
        };

        // Add a small delay to allow role changes to propagate
        const timeoutId = setTimeout(() => {
            loadUserProject();
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [isOpen, currentRole, user?.uid]);

    const handleCopy = (text: string, buttonRef?: React.RefObject<HTMLButtonElement>) => {
        navigator.clipboard.writeText(text);
        // Add shake animation if ref provided
        if (buttonRef?.current) {
            buttonRef.current.classList.add('shake-animation');
            setTimeout(() => {
                buttonRef.current?.classList.remove('shake-animation');
            }, 500);
        }
    };

    const handleGenerateReferralCode = async () => {
        if (isGeneratingCode) return;
        
        setIsGeneratingCode(true);
        try {
            const response = await referralService.getMyReferralCode();
            setReferralCode(response.code);
        } catch (error) {
            logger.error('Failed to generate referral code', { error });
        } finally {
            setIsGeneratingCode(false);
        }
    };

    const handleBackToTop = () => {
        onClose();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSwitchRole = async () => {
        if (isSwitchingRole) return;
        
        setIsSwitchingRole(true);
        try {
            // Always perform actual role switch (simplified logic)
            
            const response = await switchToBuilder();
            
            if (response.success && response.data) {
                const userData = response.data as any;
                const newRole = userData.role;
                
                // Update local state
                setCurrentRole(newRole);

                // Update cookie for role persistence - store as string
                setCookie(COOKIE_KEYS.ROLE, newRole);
                
                // Refresh JWT token to get new role
                const tokenRefreshed = await refreshToken();
                
                if (tokenRefreshed) {
                    
                    // Invalidate profile data to trigger refresh
                    await queryClient.invalidateQueries({ queryKey: ['profileInitialData'] });
                    
                    // Close the modal after successful role switch
                    onClose();
                    
                } else {
                    logger.error('Failed to refresh token, falling back to page reload');
                    window.location.reload();
                }
            } else {
                logger.error('Role switch API call failed', { response });
            }
        } catch (error) {
            logger.error('Failed to switch role/view', { 
                error, 
                currentRole, 
                pathname,
                attemptedSwitch: currentRole === 'USER' ? 'USER→BUILDER' : 'BUILDER→USER' 
            });
        } finally {
            setIsSwitchingRole(false);
        }
    };


    return (
        <>
            <style jsx>{shakeStyles}</style>
            <BaseModal
                isOpen={isOpen}
                onClose={onClose}
                logo={{
                    src: "https://statics.bloomprotocol.ai/logo/bp_logo_icon.svg",
                    alt: "Bloom Protocol",
                    width: 34.62,
                    height: 34
                }}
                caption={<span className="modal-title-text">Profile</span>}
            >
                {/* User Info Cards */}
                <div className="flex flex-col">
                    {/* UID */}
                    <div className="w-full flex items-center gap-[8px] py-[12px] rounded-[10px]">
                        <div className="flex items-center gap-[8px] flex-1">
                            <Image
                                src="https://statics.bloomprotocol.ai/icon/yoona-id-badge.svg"
                                alt="uid"
                                width={24}
                                height={24}
                            />
                            <span className="font-['Outfit'] font-normal text-[14px] text-[#696f8c] tracking-[-0.28px] leading-[1.4]">
                                UID
                            </span>
                        </div>
                        <div
                            className="flex items-center gap-[8px] w-[212px] p-[10px] bg-[#f6f6f6] border border-[#e7e6f2] rounded-[8px] cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => {
                                handleCopy(uid);
                            }}
                        >
                            <span className="flex-1 font-['Outfit'] font-normal text-[14px] text-[#393f49] tracking-[-0.28px] leading-[1.4] text-right">{uid}</span>
                            <button
                                className="shrink-0"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy(uid);
                                    const btn = e.currentTarget;
                                    btn.classList.add('shake-cute');
                                    setTimeout(() => {
                                        btn.classList.remove('shake-cute');
                                    }, 600);
                                }}
                            >
                                <Image
                                    src="https://statics.bloomprotocol.ai/icon/yoona-copy.png"
                                    alt="Copy"
                                    width={24}
                                    height={24}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Wallet - 只有當用戶有錢包地址時才顯示 (X-only Builder 沒有錢包) */}
                    {walletAddress && (
                    <div className="w-full flex items-center gap-[8px] py-[12px] rounded-[10px]">
                        <div className="flex items-center gap-[8px] flex-1">
                            <Image
                                src="https://statics.bloomprotocol.ai/icon/yoona-wallet.svg"
                                alt="wallet"
                                width={24}
                                height={24}
                            />
                            <span className="font-['Outfit'] font-normal text-[14px] text-[#696f8c] tracking-[-0.28px] leading-[1.4]">
                                Wallet
                            </span>
                        </div>
                        <div
                            className="flex items-center gap-[8px] w-[212px] p-[10px] bg-[#f6f6f6] border border-[#e7e6f2] rounded-[8px] cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => {
                                handleCopy(walletAddress);
                            }}
                        >
                            <span className="flex-1 font-['Outfit'] font-normal text-[14px] text-[#393f49] tracking-[-0.28px] leading-[1.4] text-right">{shortWalletAddress}</span>
                            <button
                                className="shrink-0"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy(walletAddress);
                                    const btn = e.currentTarget;
                                    btn.classList.add('shake-cute');
                                    setTimeout(() => {
                                        btn.classList.remove('shake-cute');
                                    }, 600);
                                }}
                            >
                                <Image
                                    src="https://statics.bloomprotocol.ai/icon/yoona-copy.png"
                                    alt="Copy"
                                    width={24}
                                    height={24}
                                />
                            </button>
                        </div>
                    </div>
                    )}

                    {/* Referral */}
                    <div className="w-full flex items-center gap-[8px] py-[12px] rounded-[10px]">
                        <div className="flex items-center gap-[8px] flex-1">
                            <Image
                                src="https://statics.bloomprotocol.ai/icon/yoona-gift.svg"
                                alt="referral"
                                width={24}
                                height={24}
                            />
                            <span className="font-['Outfit'] font-normal text-[14px] text-[#696f8c] tracking-[-0.28px] leading-[1.4]">
                                Referral
                            </span>
                        </div>
                        {referralCode ? (
                            <div
                                className="flex items-center gap-[8px] w-[212px] p-[10px] bg-[#f6f6f6] border border-[#e7e6f2] rounded-[8px] cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => {
                                    const referralUrl = `${window.location.origin}/?code=${referralCode}`;
                                    handleCopy(referralUrl);
                                }}
                            >
                                <span className="flex-1 font-['Outfit'] font-normal text-[14px] text-[#393f49] tracking-[-0.28px] leading-[1.4] text-right">{referralCode}</span>
                                <button
                                    className="shrink-0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const referralUrl = `${window.location.origin}/?code=${referralCode}`;
                                        handleCopy(referralUrl);
                                        const btn = e.currentTarget;
                                        btn.classList.add('shake-cute');
                                        setTimeout(() => {
                                            btn.classList.remove('shake-cute');
                                        }, 600);
                                    }}
                                >
                                    <Image
                                        src="https://statics.bloomprotocol.ai/icon/yoona-copy.png"
                                        alt="Copy"
                                        width={24}
                                        height={24}
                                    />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-[8px] w-[212px] p-[10px] bg-[#f6f6f6] border border-[#e7e6f2] rounded-[8px]">
                                <span className="flex-1 font-['Outfit'] font-normal text-[14px] text-[#393f49] tracking-[-0.28px] leading-[1.4] text-right">Not generated</span>
                                <button
                                    className="shrink-0 px-2 py-0.5 bg-purple-600 text-white text-[12px] rounded hover:bg-purple-700 transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleGenerateReferralCode();
                                    }}
                                    disabled={isGeneratingCode}
                                >
                                    {isGeneratingCode ? '...' : 'Generate'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Agent Wallet Section - REMOVED for Phase 1 */}
                    {/*
                      Phase 2: Uncomment when marketplace is ready

                      <div className="w-full pt-[16px] mt-[8px] border-t border-[#e7e6f2]">
                        {agentData && (
                          <div className="space-y-[12px]">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-[8px]">
                                <Bot className="w-5 h-5 text-[#8478e0]" strokeWidth={2} />
                                <span className="font-['Outfit'] font-medium text-[14px] text-[#393f49]">
                                  Agent Wallet
                                </span>
                              </div>
                              <span className="px-[8px] py-[4px] bg-[#8478e0]/10 rounded-[6px] font-['Outfit'] font-normal text-[10px] text-[#8478e0]">
                                Base
                              </span>
                            </div>
                            <div className="rounded-[12px] bg-gradient-to-br from-[#f5f3ff] to-[#faf5ff] border border-[#e9d5ff] p-[12px] space-y-[8px]">
                              <div className="flex items-center justify-between">
                                <span className="font-['Outfit'] font-normal text-[12px] text-[#696f8c]">Balance</span>
                                <span className="font-['Outfit'] font-semibold text-[14px] text-[#393f49]">
                                  {agentData.wallet.balance || '0'} USDC
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="font-['Outfit'] font-normal text-[12px] text-[#696f8c]">Address</span>
                                <code className="font-['Courier'] text-[11px] text-[#393f49]">
                                  {agentData.wallet.address.slice(0, 6)}...{agentData.wallet.address.slice(-4)}
                                </code>
                              </div>
                              <button
                                className="w-full mt-[4px] h-[36px] flex justify-center items-center rounded-[8px] bg-[#8478e0] hover:bg-[#7366d9] transition-colors"
                                onClick={() => setShowWalletManagement(true)}
                              >
                                <span className="font-['Outfit'] font-medium text-[13px] text-white">Manage Wallet</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    */}
                </div>

                {/* Quick Actions */}
                {/* <div className="pt-6 border-t">
                    <h3 className="text-sm font-semibold text-gray-600 mb-3">Quick Actions</h3>
                    <div className="space-y-2">
                        {/* Switch Role */}
                        {/* <button
                            className="w-full p-3 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-left font-medium text-[14px]"
                            onClick={handleSwitchRole}
                            disabled={isSwitchingRole}
                        >
                            {isSwitchingRole ? 'Switching...' : 
                                // Show role switch text  
                                `Switch to ${currentRole === 'USER' ? 'Builder' : 'User'}`
                            }
                        </button> */}

                        {/* Builder-specific actions */}
                        {/* {currentRole === 'BUILDER' && (
                            <>
                                <button
                                    className="w-full p-3 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors text-left font-medium text-[14px]"
                                    onClick={() => {
                                        onClose();
                                        if (userProject) {
                                            router.push(`/create-project?edit=${userProject.id}`);
                                        } else {
                                            router.push('/create-project');
                                        }
                                    }}
                                    disabled={isLoadingProject}
                                >
                                    {isLoadingProject 
                                        ? 'Loading...' 
                                        : userProject 
                                        ? 'Edit Project' 
                                        : 'Submit Project'
                                    }
                                </button>
                                {pathname !== '/dashboard' && (
                                    <button
                                        className="w-full p-3 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors text-left font-medium text-[14px]"
                                        onClick={() => {
                                            onClose();
                                            window.location.href = '/dashboard';
                                        }}
                                    >
                                        Go to dashboard
                                    </button>
                                )}
                            </>
                        )} */}

                        {/* Back to Top */}
                        {/* <button
                            className="w-full p-3 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors text-left font-medium text-[14px]"
                            onClick={handleBackToTop}
                        >
                            Back to Top
                        </button>
                    </div>
                </div> */}

                {/* Settings button */}
                <div className="relative w-full">
                    <button
                        className="w-full flex h-[48px] justify-center items-center gap-[6px] rounded-[27px] bg-[rgba(132,120,224,0.10)] backdrop-blur-[10px] shadow-[0px_1px_1px_0.05px_rgba(24,24,27,0.24),0px_4px_10px_0px_rgba(0,0,0,0.25)] hover:opacity-90 transition-all text-[#8478e0] font-['Outfit'] font-medium text-[16px] leading-none overflow-hidden"
                        onClick={() => {
                            onClose();
                            router.push('/profile');
                        }}
                    >
                        Settings
                        <div className="absolute inset-0 pointer-events-none shadow-[inset_0px_2px_0px_0px_rgba(255,255,255,0.1),inset_0px_8px_16px_0px_rgba(255,255,255,0.16)]" />
                    </button>
                </div>

                {/* Disconnect button - separated at bottom */}
                <div className="relative w-full">
                    <button
                        className="w-full flex h-[48px] justify-center items-center gap-[6px] rounded-[27px] bg-[rgba(247,89,255,0.10)] backdrop-blur-[10px] shadow-[0px_1px_1px_0.05px_rgba(24,24,27,0.24),0px_4px_10px_0px_rgba(0,0,0,0.25)] hover:opacity-90 transition-all text-[#eb7cff] font-['Outfit'] font-medium text-[16px] leading-none overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoggingOut}
                        onClick={async () => {
                            if (isLoggingOut) return;

                            setIsLoggingOut(true);

                            try {
                                // Create a timeout promise (5 seconds)
                                const timeoutPromise = new Promise((_, reject) => {
                                    setTimeout(() => reject(new Error('Logout timeout')), 5000);
                                });

                                // Race between logout and timeout
                                await Promise.race([logout(), timeoutPromise]);
                            } catch (error) {
                                // Log error but continue with cleanup
                                logger.warn('[ProfileModal] Logout error or timeout, forcing cleanup', { error });
                            } finally {
                                onClose();

                                // Force redirect/reload regardless of logout success
                                const protectedPaths = ['/dashboard', '/profile', '/builder'];
                                const shouldRedirectHome = protectedPaths.some(p => pathname.startsWith(p));

                                if (shouldRedirectHome) {
                                    window.location.href = '/';
                                } else {
                                    window.location.reload();
                                }
                            }
                        }}
                    >
                        {isLoggingOut ? 'Disconnecting...' : 'Disconnect'}
                        <div className="absolute inset-0 pointer-events-none shadow-[inset_0px_2px_0px_0px_rgba(255,255,255,0.1),inset_0px_8px_16px_0px_rgba(255,255,255,0.16)]" />
                    </button>
                </div>

            </BaseModal>

            {/* Phase 2: Wallet Management Modal */}
            {/*
            {agentData && showWalletManagement && (
                <WalletManagementModal
                    wallet={agentData.wallet}
                    onClose={() => setShowWalletManagement(false)}
                />
            )}
            */}
        </>
    );
}