// Menu 系統類型定義

export type Breakpoint = 'mobile' | 'desktop';
export type UserRole = 'user' | 'builder' | null;
export type DashboardView = 'supporter' | 'builder' | null;

export enum MenuType {
  // 移動端類型
  MOBILE_NAVIGATION = 'mobile-navigation',  // 導航 burger（主頁、項目頁等）
  MOBILE_PROFILE = 'mobile-profile',        // DEPRECATED - ProfileModal is not a menu
  
  // 桌面端類型
  DESKTOP_NAVBAR = 'desktop-navbar'         // 完整導航條
}

// Menu 項目定義
export interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  requiresAuth?: boolean;
  requiresRole?: UserRole;
  disabled?: boolean;
  external?: boolean;
  order?: number;
}

// Menu 動作定義
export interface MenuAction {
  id: string;
  handler: (params?: any) => void | Promise<void>;
}

// 頁面上下文分析結果
export interface PageContext {
  isHomePage: boolean;
  isDashboardPage: boolean;
  isProjectPage: boolean;
  isProjectListPage: boolean;
  isLegacyPage: boolean;
  isCreateProjectPage: boolean;
  isProfilePage: boolean;
  isToolPage: boolean;
  projectId: string | null;
}

// Menu 上下文輸入
export interface MenuContext {
  breakpoint: Breakpoint;
  pathname: string;
  isAuthenticated: boolean;
  userRole: UserRole;
  dashboardView: DashboardView;
  pageContext?: PageContext; // 可選的頁面上下文信息
}

// Menu 配置輸出
export interface MenuConfiguration {
  // 基本配置
  type: MenuType;
  items: MenuItem[];
  actions: Record<string, MenuAction>;
  
  // 顯示控制
  showNavigationBurger: boolean;
  showProfileBurger: boolean;
  showConnectButton: boolean;
  showProfileButton: boolean;
  showDrops: boolean;
  showBuilderBadge: boolean;
  canSwitchView: boolean;
  showNotificationBell: boolean;
  
  // 特殊配置
  specialMenuType?: string;      // 特殊頁面的 menu 類型
  pageMenuType?: string;         // 頁面特定的 menu 類型
  currentProjectId?: string;     // 當前項目 ID
  specialFeatures?: {
    dashboardMenu?: boolean;     // Dashboard 專用 menu
    createProjectMenu?: boolean; // 創建項目專用 menu
    projectActions?: boolean;    // 項目詳情頁動作
    profileMenu?: boolean;       // Profile 頁面 menu
  };
}

// Menu Provider Props
export interface MenuProviderProps {
  children: React.ReactNode;
}

// Menu Hook 返回值
export interface UseMenuReturn extends MenuConfiguration {
  // 上下文數據
  context: MenuContext;
  menuConfig: MenuConfiguration;
  
  // 狀態更新方法
  setContext: (context: Partial<MenuContext>) => void;
  setAuthState: (auth: { isAuthenticated: boolean; userRole: UserRole }) => void;
  setNetworkStatus?: (online: boolean) => void;
  
  // 動作處理
  handleAction: (actionId: string, params?: any) => void;
  handleNavigation: (item: MenuItem) => void;
  handleAuthError?: (error: Error) => void;
  
  // 性能監控（開發用）
  onRender?: () => void;
  onModalOpen?: () => void;
  onModalClose?: () => void;
}

// 路由配置
export interface MenuRouteConfig {
  navigationBurger: string[];
  profileBurger: string[];
  specialPages: Record<string, string | { type: string; config?: any }>;
}

// Menu 項目集合
export interface MenuItemCollection {
  [key: string]: MenuItem;
}