'use client';

import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { BaseModal } from '@/components/ui';
import { useUnifiedAuth } from '@/lib/hooks/useUnifiedAuth';
import Image from 'next/image';
import { useMenu } from '@/lib/context/menu/MenuContext';
import { useModal } from '@/lib/context/ModalContext';
import { getMobileNavigationItems } from '@/lib/context/menu/menuResolver';
import type { MenuContext } from '@/lib/context/menu/menuTypes';
import { useMenuItems } from '@/lib/hooks/useMenuItems';
import { useUserProfileContext } from '@/app/(protected)/dashboard/contexts/user-profile-context';
import { useMemo } from 'react';
import { UserRole } from '@/lib/types/auth';

// MenuItem and QuickAction interfaces from SharedNavigationContent
export interface MenuItem {
  id: string;
  label: string;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  requiresAuth?: boolean; // Kept for backward compatibility
  disabled?: boolean; // Added to match menuResolver format
}

export interface QuickAction {
  id: string;
  label: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}

interface MobileBurgerMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MobileBurgerMenu({
    isOpen,
    onClose
}: MobileBurgerMenuProps) {
    const router = useRouter();
    const { isAuthenticated, user } = useAuth();
    const pathname = usePathname();
    const { handleUnifiedConnect } = useUnifiedAuth();
    const { dashboardData } = useUserProfileContext();
    const { openProfileModal } = useModal();
    
    // Format wallet address - same as desktop Menu
    // X-only 用戶顯示 "Builder" 標籤，與 Menu.tsx 保持一致
    const shortAddr = useMemo(() => {
        if (!user?.walletAddress) {
            // X-only 用戶 - 根據角色顯示標籤
            return user?.roles?.includes(UserRole.BUILDER) ? 'Builder' : '';
        }
        return `${user.walletAddress.slice(0, 5)}...`;
    }, [user?.walletAddress, user?.roles]);
    
    // Get user points
    const userPoints = dashboardData?.statistics?.totalPoints || 0;

    // 處理 Connect 按鈕點擊 - 使用統一的認證處理
    const handleConnectClick = (e: React.MouseEvent) => {
        e.preventDefault();
        onClose();
        setTimeout(() => {
            handleUnifiedConnect();
        }, 100);
    };


    // Get menu items from menuResolver via MenuContext
    const menuContext = useMenu();
    // Get dynamic menu items from API
    const { data: dynamicMenuItems } = useMenuItems();
    
    const getMenuItems = (): MenuItem[] => {
        // Build menu context for getMobileNavigationItems
        const context: MenuContext = {
            breakpoint: 'mobile', // Force mobile since this is MobileBurgerMenu
            pathname,
            isAuthenticated,
            userRole: null, // Not needed for mobile navigation items
            dashboardView: null,
            pageContext: menuContext.context.pageContext
        };
        
        // Get mobile navigation items with dynamic menu items
        const items = getMobileNavigationItems(context, dynamicMenuItems);
        
        // Return items without icon mapping (icons no longer used in menu)
        return items;
    };

    // Quick actions configuration  
    const getQuickActions = (): QuickAction[] => {
        const actions: QuickAction[] = [];
        
        // Always show Follow us on X
        actions.push({
            id: 'follow-x',
            label: 'Follow us',
            onClick: (e) => {
                e.preventDefault();
                window.open('https://x.com/Bloom__protocol', '_blank', 'noopener,noreferrer');
                onClose();
            },
        })
        // Only show Connect Wallet action when not authenticated
        if (!isAuthenticated) {
            actions.push({
                id: 'wallet-action',
                label: 'Connect',
                onClick: (e) => {
                    e.preventDefault();
                    sessionStorage.setItem('redirectAfterAuth', '/dashboard');
                    handleConnectClick(e);
                },
            });
        }
        
        return actions;
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            hideHeader={true}
        >
            <div className="flex flex-col gap-3 pt-4">
                {/* User Info Section - Only show when authenticated */}
                {isAuthenticated && (
                    <>
                        <div className="flex items-center justify-between w-full">
                            {/* Wallet Address Button */}
                            <button
                                className="bg-[#383838] text-white font-['Outfit'] font-normal text-[14px] h-12 px-6 py-4 rounded-[27px] flex items-center gap-1.5 shadow-[0px_1px_1px_0.05px_rgba(24,24,27,0.24)] relative"
                                onClick={() => {
                                    // Open ProfileModal first, then close burger menu
                                    openProfileModal();
                                    onClose();
                                }}
                            >
                                <Image
                                    src="https://statics.bloomprotocol.ai/icon/yoona-avatar.png"
                                    alt="avatar"
                                    width={24}
                                    height={24}
                                    className="rounded-full"
                                />
                                <span>{shortAddr}</span>
                                {/* Inset shadow effect */}
                                <div className="absolute inset-0 rounded-[27px] pointer-events-none shadow-[inset_0px_2px_0px_0px_rgba(255,255,255,0.1),inset_0px_8px_16px_0px_rgba(255,255,255,0.16)]" />
                            </button>
                            
                            {/* Points Display */}
                            <div className="bg-[rgba(255,255,255,0.8)] h-12 px-3 py-3 rounded-[27px] flex items-center gap-1 shadow-[0px_3px_5px_0px_rgba(200,206,215,0.25),0px_2px_3px_0px_rgba(135,175,199,0.12),0px_4px_10px_0px_rgba(222,228,235,0.25)]">
                                <Image
                                    src="https://statics.bloomprotocol.ai/logo/water-drop-icon.svg"
                                    alt="drops"
                                    width={24}
                                    height={24}
                                />
                                <span className="font-['Outfit'] font-semibold text-[14px] text-[#393f49]">
                                    {userPoints}
                                </span>
                            </div>
                        </div>
                        
                        {/* Divider */}
                        <div className="h-px bg-[#e5e5e5] w-full my-3" />
                    </>
                )}
                
                {/* Navigation Options */}
                <div className="flex flex-col items-start gap-3 self-stretch">
                    {getMenuItems().map((item) => {
                        const isActive = pathname === item.href;
                        
                        const handleItemClick = (e: React.MouseEvent) => {
                            e.preventDefault();
                            
                            if (item.onClick) {
                                item.onClick(e);
                                return;
                            }

                            // Handle disabled items
                            if (item.disabled) {
                                sessionStorage.setItem('redirectAfterAuth', item.href || '/');
                                handleConnectClick(e);
                                return;
                            }

                            if (item.href) {
                                onClose();
                                router.push(item.href);
                            }
                        };
                        
                        return (
                            <button
                                key={item.id}
                                onClick={handleItemClick}
                                className={`h-10 w-full rounded-[40px] ${
                                    isActive 
                                        ? 'bg-[#292929] shadow-[0px_1px_1px_0.05px_rgba(24,24,27,0.24)]' 
                                        : ''
                                }`}
                            >
                                <div className="flex flex-row items-center relative size-full">
                                    <div className="box-border flex flex-row gap-2.5 h-10 items-center justify-start px-5 py-2.5 relative w-full">
                                        <div className={`text-[14px] font-normal text-left text-nowrap font-['Outfit'] ${
                                            isActive ? 'text-white' : 'text-[#696f8c]'
                                        }`}>
                                            {item.label}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Quick Actions */}
                {(() => {
                    const quickActions = getQuickActions();
                    return quickActions.length > 0 ? (
                        <div>
                            <div className="flex flex-col items-start gap-3 self-stretch">
                                {quickActions.map((action) => {
                                    // Special styling for Connect button
                                    if (action.id === 'wallet-action') {
                                        return (
                                            <button
                                                key={action.id}
                                                onClick={action.onClick}
                                                className="w-full flex h-12 justify-center items-center gap-1.5 rounded-[27px] bg-[#eb7cff] shadow-[0px_4px_0px_-1px_#b97bc4] hover:shadow-[0px_2px_0px_-1px_#b97bc4] hover:translate-y-[2px] transition-all text-white text-[16px] font-semibold"
                                            >
                                                {action.label}
                                            </button>
                                        );
                                    }
                                    
                                    // Default styling for other actions
                                    return (
                                        <button
                                            key={action.id}
                                            onClick={action.onClick}
                                            className="h-10 w-full rounded-[40px]"
                                        >
                                            <div className="flex flex-row items-center relative size-full">
                                                <div className={`box-border flex flex-row h-10 items-center ${
                                                    action.id === 'follow-x' ? 'justify-between' : 'justify-start'
                                                } px-4 py-3 relative w-full`}>
                                                    <div className="text-[14px] font-semibold text-left text-nowrap text-[#696f8c]">
                                                        {action.label}
                                                    </div>
                                                    {action.id === 'follow-x' && (
                                                        <div className="shrink-0 size-4">
                                                            <Image
                                                                src="https://statics.bloomprotocol.ai/icon/yoona-x-button.svg"
                                                                alt="X"
                                                                width={16}
                                                                height={16}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : null;
                })()}
            </div>
        </BaseModal>
    );
}