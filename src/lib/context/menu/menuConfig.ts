// Menu 配置管理
// 這個文件用於集中管理 Menu 的靜態配置

import { MenuRouteConfig } from './menuTypes';

// 擴展路由配置的輔助函數
export function addNavigationBurgerRoute(route: string) {
  if (!MENU_ROUTES.navigationBurger.includes(route)) {
    MENU_ROUTES.navigationBurger.push(route);
  }
}

export function addProfileBurgerRoute(route: string) {
  if (!MENU_ROUTES.profileBurger.includes(route)) {
    MENU_ROUTES.profileBurger.push(route);
  }
}

// 從 menuResolver 導入配置
import { MENU_ROUTES } from './menuResolver';
export { MENU_ROUTES };

// Menu 翻譯（未來擴展用）
export const MENU_TRANSLATIONS = {
  en: {
    home: 'Home',
    spotlight: 'Spotlight',
    dashboard: 'Dashboard',
    missions: 'Missions',
    profile: 'Profile',
    settings: 'Settings',
    builderInbox: 'Builder Inbox',
    switchToSupporter: 'Switch to Supporter View',
    switchToBuilder: 'Switch to Builder View',
    logout: 'Logout',
    connect: 'Connect',
  },
  zh: {
    home: '首頁',
    spotlight: '聚光燈',
    dashboard: '儀表板',
    missions: '任務',
    profile: '個人檔案',
    settings: '設置',
    builderInbox: '建造者收件箱',
    switchToSupporter: '切換到支持者視圖',
    switchToBuilder: '切換到建造者視圖',
    logout: '登出',
    connect: '連接',
  }
} as const;

// 獲取翻譯文本
export function getMenuLabel(key: string, locale: 'en' | 'zh' = 'en'): string {
  return MENU_TRANSLATIONS[locale][key as keyof typeof MENU_TRANSLATIONS['en']] || key;
}