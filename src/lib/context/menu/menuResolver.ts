import { 
  MenuContext, 
  MenuConfiguration, 
  MenuType, 
  MenuItem,
  MenuRouteConfig,
  MenuItemCollection,
  UserRole,
  PageContext
} from './menuTypes';

// Import fallback configurations from config file
import { FALLBACK_MENU_ITEMS, FALLBACK_MENU_ROUTES, HAMBURGER_ONLY_ITEMS } from '@/lib/config/menuItems';

// 重新導出類型給測試使用
export type { MenuContext, MenuConfiguration } from './menuTypes';

// Re-export from config file for backward compatibility
export const MENU_ROUTES = FALLBACK_MENU_ROUTES;
export const MENU_ITEMS = FALLBACK_MENU_ITEMS;

// 增強的 Menu 配置解析函數
export function resolveMenuConfig(context: MenuContext, menuItems?: MenuItemCollection): MenuConfiguration {
  const { breakpoint, pathname, isAuthenticated, userRole, dashboardView, pageContext } = context;
  
  // 決定 Menu 類型
  const menuType = determineMenuType(breakpoint, pathname);
  
  // 獲取 Menu 項目 - pass menuItems if available
  const items = getMenuItems(menuType, context, menuItems);
  
  // 獲取 Menu 動作
  const actions = getMenuActions(context);
  
  // 特殊頁面配置
  const specialConfig = getSpecialPageConfig(pathname, pageContext);
  
  // 智能顯示控制
  const displayConfig = getDisplayConfiguration(breakpoint, pathname, isAuthenticated, userRole, pageContext);
  
  // 構建完整配置
  return {
    type: menuType,
    items,
    actions,
    ...displayConfig,
    ...specialConfig
  };
}

// 新增：智能顯示配置函數
function getDisplayConfiguration(
  breakpoint: 'mobile' | 'desktop',
  pathname: string,
  isAuthenticated: boolean, 
  userRole: UserRole,
  pageContext?: PageContext
) {
  // 直接根據條件構建配置對象，避免重複賦值
  return {
    // 基本顯示控制 - 移動端
    showNavigationBurger: breakpoint === 'mobile',
    showProfileBurger: false,
    
    // 基本顯示控制 - 桌面端和移動端共用
    showConnectButton: !isAuthenticated,
    showProfileButton: isAuthenticated,
    showDrops: isAuthenticated,
    
    // 角色相關
    showBuilderBadge: userRole === 'builder',
    canSwitchView: userRole === 'builder',
    
    // 通知鈴鐺
    showNotificationBell: false,  // 暫時隱藏通知鈴鐺，待後續實施
  };
}

// 決定 Menu 類型
function determineMenuType(breakpoint: 'mobile' | 'desktop', pathname: string): MenuType {
  return breakpoint === 'desktop' ? MenuType.DESKTOP_NAVBAR : MenuType.MOBILE_NAVIGATION;
}

// 增強的路由匹配函數
function matchRoute(pathname: string, route: string): boolean {
  // 精確匹配
  if (route === pathname) return true;
  
  // 通配符匹配
  if (route.endsWith('/*')) {
    const prefix = route.slice(0, -2);
    return pathname.startsWith(prefix + '/') || pathname === prefix;
  }
  
  // 可選的查詢參數匹配
  if (route.includes('?')) {
    const baseRoute = route.split('?')[0];
    return pathname === baseRoute || pathname.startsWith(baseRoute + '?');
  }
  
  return false;
}

// 優化的頁面類型判斷函數
export function isNavigationBurgerPage(pathname: string): boolean {
  // 空路徑特殊處理
  if (pathname === '' || pathname === '/') return true;
  
  return MENU_ROUTES.navigationBurger.some(route => matchRoute(pathname, route));
}

export function isProfileBurgerPage(pathname: string): boolean {
  return MENU_ROUTES.profileBurger.some(route => matchRoute(pathname, route));
}


// Removed getMissionSlugFromPath - missions page is disabled

export function getProjectIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/project\/([^\/]+)$/);
  return match ? match[1] : null;
}

// 新增：頁面類型分析
export function analyzePageContext(pathname: string) {
  return {
    isHomePage: pathname === '/' || pathname === '',
    isDashboardPage: isDashboardPage(pathname),
    isProjectPage: pathname.startsWith('/project/'),
    isProjectListPage: pathname === '/spotlight',
    isLegacyPage: false,
    isCreateProjectPage: pathname === '/create-project',
    isProfilePage: pathname.startsWith('/profile'),
    isToolPage: pathname.startsWith('/_'),
    projectId: getProjectIdFromPath(pathname)
  };
}

export function isDashboardPage(pathname: string): boolean {
  return pathname === '/dashboard' || pathname.startsWith('/dashboard/');
}

export function isMainNavigationPage(pathname: string): boolean {
  return ['/', '/spotlight'].includes(pathname);
}

// 獲取 Menu 項目
function getMenuItems(menuType: MenuType, context: MenuContext, menuItems?: MenuItemCollection): MenuItem[] {
  // Use provided menuItems or fallback to hardcoded ones
  const activeMenuItems = menuItems || MENU_ITEMS;
  
  // 將 MenuItemCollection 轉換為陣列
  const allItems = Object.values(activeMenuItems);
  
  // 根據 menu type 過濾項目
  let filteredItems = allItems.filter(item => {
    // Filter out undefined items
    if (!item) return false;
    
    // Filter out items that are explicitly disabled from admin
    if ('enabled' in item && item.enabled === false) return false;
    
    // 桌面端不顯示 home（logo 已經是 home link）
    if (menuType === MenuType.DESKTOP_NAVBAR && item.id === 'home') return false;
    
    // 過濾掉社交連結（如 X/Twitter），它們在組件中單獨處理
    if (item.external && item.id === 'x') return false;
    
    return true;
  });
  
  // 處理認證相關的邏輯
  const processedItems = filteredItems.map(item => {
    // Dashboard is now visible and clickable for all users
    // Non-logged-in users will see the DashboardPreview component
    return item;
  });
  
  // 根據 order 排序（order 越小越靠前）
  const sortedItems = processedItems.sort((a, b) => (a.order || 999) - (b.order || 999));
  
  return sortedItems;
}

// 為了向後兼容，保留這兩個函數但讓它們調用統一的 getMenuItems
export function getMobileNavigationItems(context: MenuContext, menuItems?: MenuItemCollection): MenuItem[] {
  // Merge hamburger-only items into mobile navigation
  const merged = { ...(menuItems || MENU_ITEMS), ...HAMBURGER_ONLY_ITEMS };
  return getMenuItems(MenuType.MOBILE_NAVIGATION, context, merged);
}

function getDesktopNavbarItems(context: MenuContext, menuItems?: MenuItemCollection): MenuItem[] {
  return getMenuItems(MenuType.DESKTOP_NAVBAR, context, menuItems);
}

// 獲取 Menu 動作
function getMenuActions(context: MenuContext): Record<string, any> {
  return {
    connect: { id: 'connect', handler: () => {} }, // 將由 Provider 注入實際處理器
    logout: { id: 'logout', handler: () => {} },
    switchView: { id: 'switchView', handler: () => {} },
    navigate: { id: 'navigate', handler: () => {} }
  };
}

// 增強的特殊頁面配置函數
function getSpecialPageConfig(pathname: string, pageContext?: PageContext): Partial<MenuConfiguration> {
  const config: Partial<MenuConfiguration> = {};
  
  // 根據頁面類型設置配置，優先使用 pageContext，否則降級到路徑匹配
  const isDashboard = pageContext?.isDashboardPage ?? isDashboardPage(pathname);
  const isCreateProject = pageContext?.isCreateProjectPage ?? (pathname === '/create-project');
  const isProfile = pageContext?.isProfilePage ?? false;
  const isProject = pageContext?.isProjectPage ?? false;
  
  // Dashboard 配置
  if (isDashboard) {
    config.specialMenuType = 'dashboard';
    config.specialFeatures = {
      dashboardMenu: true
    };
  }
  
  // 創建項目配置
  if (isCreateProject) {
    config.specialMenuType = 'create-project';
    config.specialFeatures = {
      createProjectMenu: true
    };
  }
  
  // Profile 配置
  if (isProfile) {
    config.specialMenuType = 'profile';
    config.specialFeatures = {
      profileMenu: true
    };
  }
  
  // 項目詳情頁配置
  if (isProject) {
    config.pageMenuType = 'project-detail';
    config.specialFeatures = {
      projectActions: true
    };
    
    // 如果有 project ID，添加到配置中
    if (pageContext?.projectId) {
      config.currentProjectId = pageContext.projectId;
    }
  }
  
  return config;
}