'use client';

import React, { createContext, useContext, useMemo, useCallback, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useModal } from '@/lib/context/ModalContext';
import { useUnifiedAuth } from '@/lib/hooks/useUnifiedAuth';
import { UserRole as AuthUserRole } from '@/lib/types/auth';
import { resolveMenuConfig, analyzePageContext } from './menuResolver';
import { useMenuItems } from '@/lib/hooks/useMenuItems';
import type { 
  MenuContext as MenuContextType,
  MenuConfiguration,
  UseMenuReturn,
  MenuProviderProps,
  MenuItem,
  Breakpoint,
  UserRole,
  DashboardView
} from './menuTypes';

// 創建 Context
const MenuContext = createContext<UseMenuReturn | null>(null);

// Optimized breakpoint hook
function useBreakpoint(): Breakpoint {
  // Default to desktop for SSR
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated
    setIsHydrated(true);

    const checkBreakpoint = () => {
      const newBreakpoint = window.innerWidth < 1280 ? 'mobile' : 'desktop';
      setBreakpoint(newBreakpoint);
    };

    // Debounce function
    let timeoutId: NodeJS.Timeout;
    const debouncedCheckBreakpoint = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkBreakpoint, 100); // 100ms 防抖
    };

    // 初始檢查
    checkBreakpoint();

    // 監聽變化（防抖）
    window.addEventListener('resize', debouncedCheckBreakpoint);
    
    return () => {
      window.removeEventListener('resize', debouncedCheckBreakpoint);
      clearTimeout(timeoutId);
    };
  }, []);

  // 服務端渲染時保持默認值
  return isHydrated ? breakpoint : 'desktop';
}

// Menu Provider 組件
export function MenuProvider({ children }: MenuProviderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, hasRole, logout } = useAuth();
  const { openMobileBurgerMenu, openProfileModal } = useModal();
  const { handleUnifiedConnect } = useUnifiedAuth();
  const breakpoint = useBreakpoint();
  
  // Fetch menu items from API with React Query
  const { data: menuItems, isLoading: menuItemsLoading, error: menuItemsError } = useMenuItems();
  
  // Dashboard view simplified - always null since we removed view switching
  const dashboardView: DashboardView = null;

  // 🚀 OPTIMIZED: 暫時移除網絡狀態監聽，避免不必要的重新渲染
  // 未來需要時可以重新啟用
  // const [isOnline, setIsOnline] = useState(true);
  // useEffect(() => {
  //   const handleOnline = () => setIsOnline(true);
  //   const handleOffline = () => setIsOnline(false);
  //   window.addEventListener('online', handleOnline);
  //   window.addEventListener('offline', handleOffline);
  //   return () => {
  //     window.removeEventListener('online', handleOnline);
  //     window.removeEventListener('offline', handleOffline);
  //   };
  // }, []);

  // 🚀 OPTIMIZED: 增強的用戶角色檢測 - 優化依賴陣列
  const userRole = useMemo(() => {
    if (!isAuthenticated) return null;
    
    // 檢查多種可能的 Builder 角色格式
    if (hasRole('BUILDER') || hasRole('builder') || hasRole('Builder')) {
      return 'builder';
    }
    
    // 檢查 user 物件中的 roles 陣列
    if (user?.roles?.includes(AuthUserRole.BUILDER)) {
      return 'builder';
    }
    
    return 'user';
  }, [isAuthenticated, hasRole, user?.roles]); // 🚀 優化：只監聽 roles 陣列而非整個 user 物件

  // 🚀 OPTIMIZED: 緩存頁面上下文分析，避免每次重新計算
  const pageContext = useMemo(() => {
    return analyzePageContext(pathname);
  }, [pathname]);
  
  // 構建增強的 Menu 上下文
  const context: MenuContextType = useMemo(() => {
    return {
      breakpoint,
      pathname,
      isAuthenticated,
      userRole,
      dashboardView,
      // 添加頁面上下文信息
      pageContext
    };
  }, [breakpoint, pathname, isAuthenticated, userRole, pageContext]);

  // Menu configuration now uses dynamic menu items from API
  // The hook already handles caching, polling, and fallback
  const menuConfig = useMemo(() => {
    // menuItems will be the fallback data initially, then API data when loaded
    return resolveMenuConfig(context, menuItems);
  }, [context, menuItems]);

  // 動作處理器
  const handleAction = useCallback((actionId: string, params?: any) => {
    switch (actionId) {
      case 'connect':
        handleUnifiedConnect();
        break;
        
      case 'openMobileBurgerMenu':
        openMobileBurgerMenu();
        break;
        
      case 'openProfileModal':
        openProfileModal();
        break;
        
      case 'logout':
        // 調用 AuthContext 的 logout 方法來清理所有認證狀態
        logout().then(() => {
          // 登出成功後跳轉到首頁
          router.push('/');
        });
        break;
        
      case 'switchView':
        // View switching has been removed - dashboard always shows supporter view
        break;
        
      case 'navigate':
        if (params?.href) {
          router.push(params.href);
        }
        break;
        
      case 'navigateToMission':
        // 跳轉到任務詳情頁，使用 slug
        if (params?.missionTitle) {
          const { generateSlug } = require('@/lib/utils/slugUtils');
          const slug = generateSlug(params.missionTitle);
          router.push(`/missions/${slug}`);
        } else if (params?.slug) {
          router.push(`/missions/${params.slug}`);
        }
        break;
        
      case 'openMissionNavigation':
        // 打開 Mission Navigation Modal
        // 這個動作會被 mission 詳情頁的組件處理
        // 開啟任務導航 modal
        break;
        
      default:
        // 未知動作，忽略
    }
  }, [router, openMobileBurgerMenu, openProfileModal, handleUnifiedConnect, logout]);

  // 導航處理器
  const handleNavigation = useCallback((item: MenuItem) => {
    // 如果需要認證但未登入
    if (item.requiresAuth && !isAuthenticated) {
      // 認證將由 Menu 組件直接處理
      // 需要認證，開啟登入流程
      return;
    }

    // 如果需要特定角色但不符合
    if (item.requiresRole && !hasRole(item.requiresRole.toUpperCase())) {
      // 可以顯示提示或引導升級
      // 需要特定角色，暫不處理
      return;
    }

    // 如果是外部連結
    if (item.external) {
      window.open(item.href, '_blank');
      return;
    }

    // 正常導航
    router.push(item.href);
  }, [isAuthenticated, hasRole, router]);

  // 狀態更新方法
  const setContext = useCallback((updates: Partial<MenuContextType>) => {
    // Context 是派生狀態，不需要實際 setState
    // 這個方法主要用於測試
    // 更新 context（預留功能）
  }, []);

  const setAuthState = useCallback((auth: { isAuthenticated: boolean; userRole: UserRole }) => {
    // Auth 狀態由 AuthContext 管理
    // 這個方法主要用於測試
    // 更新認證狀態（預留功能）
  }, []);

  // 🚀 OPTIMIZED: 簡化網絡狀態處理，避免不必要的狀態更新
  const setNetworkStatus = useCallback((online: boolean) => {
    // 暫時不處理網絡狀態，避免不必要的重新渲染
    // 網絡狀態變化（暫時不處理）
  }, []);

  const handleAuthError = useCallback((error: Error) => {
    // 認證錯誤處理（預留功能）
    // 不顯示錯誤給用戶，只是保持未登入狀態
  }, []);

  // 組合所有值
  const value: UseMenuReturn = useMemo(() => ({
    // 配置
    ...menuConfig,
    
    // 上下文數據
    context,
    menuConfig,
    
    // 狀態更新方法
    setContext,
    setAuthState,
    setNetworkStatus,
    
    // 動作處理
    handleAction,
    handleNavigation,
    handleAuthError,
    
    // 性能監控（開發用）
    onRender: () => {},
    onModalOpen: () => {},
    onModalClose: () => {}
  }), [
    menuConfig,
    context,
    setContext,
    setAuthState,
    setNetworkStatus,
    handleAction,
    handleNavigation,
    handleAuthError
  ]);

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
}

// 自定義 Hook
export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) {
    // SSR 安全的 fallback，避免預渲染錯誤
    return {
      // 配置
      type: 'desktop-navbar',
      items: [],
      actions: {},
      
      // 顯示控制
      showNavigationBurger: false,
      showProfileBurger: false,
      showConnectButton: false,
      showProfileButton: false,
      showDrops: false,
      showBuilderBadge: false,
      canSwitchView: false,
      showNotificationBell: false,
      
      // 上下文數據
      context: {
        breakpoint: 'desktop' as const,
        pathname: '/',
        isAuthenticated: false,
        userRole: null,
        dashboardView: null
      },
      menuConfig: {
        type: 'desktop-navbar',
        items: [],
        actions: {},
        showNavigationBurger: false,
        showProfileBurger: false,
        showConnectButton: false,
        showProfileButton: false,
        showDrops: false,
        showBuilderBadge: false,
        canSwitchView: false,
        showNotificationBell: false
      },
      
      // 狀態更新方法
      setContext: () => {},
      setAuthState: () => {},
      setNetworkStatus: () => {},
      
      // 動作處理
      handleAction: () => {},
      handleNavigation: () => {},
      handleAuthError: () => {},
      
      // 性能監控
      onRender: () => {},
      onModalOpen: () => {},
      onModalClose: () => {}
    } as UseMenuReturn;
  }
  return context;
}