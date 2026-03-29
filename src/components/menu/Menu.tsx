"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./Menu.module.css";
import { useMemo, useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { useUserProfileContext } from "@/app/(protected)/dashboard/contexts/user-profile-context";
import { useMenu } from "@/lib/context/menu/MenuContext";
import { useAgentSession } from '@/hooks/useAgentSession';
import { UserRole } from "@/lib/types/auth";
import { Home, Settings, LogOut } from 'lucide-react';

interface MenuProps {
  minimal?: boolean;
}

export function Menu({ minimal = false }: MenuProps = {}) {
  const { isLoading, isAuthenticated, user } = useAuth();

  // Used for points display
  const { dashboardData } = useUserProfileContext();

  // 使用 MenuContext 替代硬編碼邏輯
  const menuContext = useMenu();
  const { agentData } = useAgentSession();

  // Profile dropdown state
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isProfileDropdownOpen]);

  // 使用 useMemo 優化地址顯示
  // X-only Builder 用戶沒有錢包地址，顯示 "Builder" 標籤
  const shortAddr = useMemo(() => {
    if (!user?.walletAddress) {
      // X-only 用戶 - 根據角色顯示標籤
      return user?.roles?.includes(UserRole.BUILDER) ? 'Builder' : '';
    }
    return `${user.walletAddress.slice(0, 5)}...`;
  }, [user?.walletAddress, user?.roles]);

  const handleNavClick = () => {
    menuContext.handleAction("openMobileBurgerMenu");
  };

  // Check if current page is homepage
  const isHomepage = menuContext.context.pathname === '/';

  // Show auth button (Login) on all pages including homepage
  const shouldShowAuthButton = !minimal;

  return (
    <div className="px-3 py-1 desktop:px-8 desktop:py-0 h-full flex flex-col justify-center max-w-[1440px] mx-auto">
      <div className="flex justify-between items-center">
        {/* Left: Logo and Brand */}
        <div className="flex items-center gap-2.5">
          <Link className="flex items-center" href="/">
            <div className="h-8 desktop:h-10 relative shrink-0 w-[110px] desktop:w-[140px]">
              {/* Logo Mark - positioned absolutely at 29.09% width */}
              <div className="absolute bottom-0 left-0 right-[70.91%] top-0">
                <Image
                  src="https://statics.bloomprotocol.ai/logo/bp_logo_icon.svg"
                  alt="Bloom Protocol's Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              {/* Logo Text - positioned absolutely from 36.36% */}
              <div className="absolute bottom-[2.87%] left-[36.36%] right-0 top-[2.87%]">
                <Image
                  src="https://statics.bloomprotocol.ai/logo/bp_logo_text.svg"
                  alt="Bloom Protocol's Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </Link>
        </div>
        <div className="flex items-center">
          {/* Mobile View - Unified layout for all pages */}
          <div className="mobile:block desktop:hidden">
            <div className="flex items-center gap-2">
              {/* Auth button - hide in minimal mode and on homepage */}
              {shouldShowAuthButton && (
                isLoading ? (
                  <button
                    disabled
                    className="bg-[#C496FF] text-white font-['Wix_Madefor_Display'] font-semibold text-xs leading-none w-[134px] h-[28px] rounded-full"
                  >
                    Connecting
                  </button>
                ) : menuContext.showProfileButton ? (
                  <button
                    className="bg-[#383838] text-[#ffffff] font-['Outfit'] font-normal text-[12px] leading-none h-7 px-4 py-2 rounded-[27px] flex items-center justify-center gap-1 shadow-[0px_1px_1px_0.05px_rgba(24,24,27,0.24)] relative after:content-[''] after:absolute after:inset-0 after:rounded-[27px] after:pointer-events-none after:shadow-[inset_0px_2px_0px_0px_rgba(255,255,255,0.1),inset_0px_8px_16px_0px_rgba(255,255,255,0.16)]"
                    onClick={() => menuContext.handleAction("openProfileModal")}
                  >
                    <Image
                      src="https://statics.bloomprotocol.ai/logo/bloom-protocol-avatar.png"
                      alt="avatar"
                      width={16}
                      height={16}
                      className="rounded-full"
                    />
                    <span>{shortAddr}</span>
                    <span className={styles.dropdownArrow}>▾</span>
                  </button>
                ) : menuContext.showConnectButton ? (
                  isHomepage ? (
                    <button
                      className="bg-[#eb7cff]/15 backdrop-blur-md text-[#696f8c] font-['Outfit'] font-normal text-[12px] leading-none px-3 py-2 rounded-[27px] border border-[#eb7cff]/20 shadow-[0_2px_4px_rgba(235,124,255,0.08)] hover:bg-[#eb7cff]/25 hover:border-[#eb7cff]/30 hover:text-[#393f49] transition-all h-7"
                      onClick={() => menuContext.handleAction("connect")}
                    >
                      Login
                    </button>
                  ) : (
                    <button
                      className="bg-[#eb7cff] text-[#ffffff] font-['Outfit'] font-normal text-[12px] leading-none px-4 py-2 rounded-[27px] shadow-[0px_4px_0px_-1px_#b97bc4] h-7"
                      onClick={() => menuContext.handleAction("connect")}
                    >
                      Connect
                    </button>
                  )
                ) : null
              )}

              {/* X (Twitter) Button */}
              <button
                onClick={() => window.open('https://x.com/Bloom__protocol', '_blank', 'noopener,noreferrer')}
                className="size-12 flex items-center justify-center cursor-pointer bg-transparent border-none rounded-[27px]"
                aria-label="Follow on X"
              >
                <Image
                  src="https://statics.bloomprotocol.ai/icon/v2-x-icon.png"
                  alt="X"
                  width={20}
                  height={20}
                  className="size-5"
                />
              </button>

              {/* Right: Navigation menu - only show if not minimal */}
              {!minimal && (
                <button
                  onClick={handleNavClick}
                  className="size-12 flex items-center justify-center cursor-pointer bg-transparent border-none rounded-[27px]"
                  aria-label="Open navigation menu"
                >
                  <Image
                    src="https://statics.bloomprotocol.ai/icon/v2-mobile-burger.png"
                    alt="navigation menu"
                    width={20}
                    height={20}
                    className="size-5"
                  />
                </button>
              )}
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden desktop:flex items-center gap-4">
            {/* Center: Glass-morphism Navigation Pills (Primary) - only show if not minimal */}
            {!minimal && (
              <div className={styles.navigationContainer}>
                {menuContext.items
                  .filter(item => !item.external && item.order !== 0 && (item.order ?? 0) < 10)
                  .filter(item => !item.requiresAuth || isAuthenticated)
                  .map((item) => {
                    const isActive = menuContext.context.pathname === item.href;
                    return (
                      <Link
                        key={item.id}
                        className={`${styles.navPill} ${isActive ? styles.navPillActive : ""}`}
                        href={item.href}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
              </div>
            )}

            {/* Right: Secondary Navigation + Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Secondary nav removed in v4 — only 2 pills now */}

              {/* Notification Bell */}
              {menuContext.showNotificationBell && (
                <button
                  className={styles.iconButton}
                  onClick={() => {
                    // TODO: Handle notifications
                  }}
                >
                  <Image
                    src="https://statics.bloomprotocol.ai/icon/yoona-notification-bell.svg"
                    alt="Notifications"
                    width={24}
                    height={24}
                  />
                </button>
              )}

              {/* Points/Drops Display */}
              {menuContext.showDrops && dashboardData && (
                <div className={styles.pointsDisplay}>
                  <Image
                    src="https://statics.bloomprotocol.ai/logo/water-drop-icon.svg"
                    alt="drops"
                    width={24}
                    height={24}
                  />
                  <span className="font-['Outfit'] font-semibold text-[14px] text-[#393f49]">
                    {dashboardData.statistics?.totalPoints || 0}
                  </span>
                </div>
              )}

              {/* Auth Button - hide in minimal mode and on homepage */}
              {shouldShowAuthButton && (
                isLoading ? (
                  <button disabled className={styles.authButtonLoading}>
                    Connecting
                  </button>
                ) : menuContext.showProfileButton ? (
                  <div className={styles.profileDropdownContainer} ref={dropdownRef}>
                    <button
                      className={styles.authButtonProfile}
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    >
                      <Image
                        src="https://statics.bloomprotocol.ai/logo/bloom-protocol-avatar.png"
                        alt="avatar"
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <span>{shortAddr}</span>
                      <span className={styles.dropdownArrow}>▾</span>
                    </button>

                    {/* Profile Dropdown Menu */}
                    {isProfileDropdownOpen && (
                      <div className={styles.profileDropdownMenu}>
                        <Link
                          href="/my-agent"
                          className={styles.dropdownItemDashboard}
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <Home className="w-5 h-5" strokeWidth={2} />
                          <div className="flex-1">
                            <span>My Agent</span>
                            {agentData?.identity?.personalityType && (
                              <span className="block text-[11px] font-normal opacity-60 mt-0.5">
                                {agentData.identity.personalityType}
                              </span>
                            )}
                          </div>
                        </Link>
                        <div className={styles.dropdownDivider} />
                        <button
                          className={styles.dropdownItem}
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            menuContext.handleAction("openProfileModal");
                          }}
                        >
                          <Settings className="w-5 h-5 text-[#696f8c]" strokeWidth={2} />
                          <span>Settings</span>
                        </button>
                        <button
                          className={styles.dropdownItem}
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            menuContext.handleAction("logout");
                          }}
                        >
                          <LogOut className="w-5 h-5 text-[#696f8c]" strokeWidth={2} />
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : menuContext.showConnectButton ? (
                  isHomepage ? (
                    <button
                      className="bg-[#eb7cff]/15 backdrop-blur-md text-[#696f8c] font-['Outfit'] font-normal text-[14px] leading-none px-4 py-3 rounded-[27px] border border-[#eb7cff]/20 shadow-[0_2px_4px_rgba(235,124,255,0.08)] hover:bg-[#eb7cff]/25 hover:border-[#eb7cff]/30 hover:text-[#393f49] transition-all h-12"
                      onClick={() => menuContext.handleAction("connect")}
                    >
                      Login
                    </button>
                  ) : (
                    <button
                      className="bg-[#eb7cff] text-[#ffffff] font-['Outfit'] font-normal text-[14px] leading-none px-4 py-3 rounded-[27px] shadow-[0px_4px_0px_-1px_#b97bc4] h-12"
                      onClick={() => menuContext.handleAction("connect")}
                    >
                      Connect
                    </button>
                  )
                ) : null
              )}

              {/* X/Twitter Button - Moved to the right of Get Started */}
              <Link
                href="https://x.com/Bloom__protocol"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.iconButton}
              >
                <Image
                  src="https://statics.bloomprotocol.ai/icon/desktop-menu-x-icon.svg"
                  alt="X"
                  width={20}
                  height={20}
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
