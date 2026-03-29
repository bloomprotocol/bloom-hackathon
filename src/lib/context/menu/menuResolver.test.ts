import { describe, it, expect } from '@jest/globals';
import { resolveMenuConfig, MenuContext, MenuConfiguration } from './menuResolver';

describe('Menu 決策引擎測試', () => {
  describe('移動端 Menu 類型決策', () => {
    it('移動端（< 1280px）未登入用戶在主頁應該看到導航 burger 按鈕', () => {
      const context: MenuContext = {
        breakpoint: 'mobile',
        pathname: '/',
        isAuthenticated: false,
        userRole: null,
        dashboardView: null
      };
      
      const config = resolveMenuConfig(context);
      expect(config.type).toBe('mobile-navigation');
      expect(config.showNavigationBurger).toBe(true);
      expect(config.showProfileBurger).toBe(false);
    });

    it('移動端（< 1280px）未登入用戶在 /spotlight 應該看到導航 burger 按鈕', () => {
      const context: MenuContext = {
        breakpoint: 'mobile',
        pathname: '/spotlight',
        isAuthenticated: false,
        userRole: null,
        dashboardView: null
      };
      
      const config = resolveMenuConfig(context);
      expect(config.type).toBe('mobile-navigation');
      expect(config.showNavigationBurger).toBe(true);
    });

    it('移動端（< 1280px）所有頁面都使用 navigation menu', () => {
      const context: MenuContext = {
        breakpoint: 'mobile',
        pathname: '/dashboard',
        isAuthenticated: true,
        userRole: 'builder',
        dashboardView: 'builder'
      };
      
      const config = resolveMenuConfig(context);
      expect(config.type).toBe('mobile-navigation');
      expect(config.showNavigationBurger).toBe(true);
      // ProfileModal is triggered by profile button, not a burger menu
      expect(config.showProfileButton).toBe(true);
    });

    // Removed test - all mobile pages now use navigation menu

    it('移動端（< 1280px）在工具頁面應該看到導航模式（提供完整功能，不再有殘缺的標準模式）', () => {
      const context: MenuContext = {
        breakpoint: 'mobile',
        pathname: '/_wallet-detect',
        isAuthenticated: false,
        userRole: null,
        dashboardView: null
      };
      
      const config = resolveMenuConfig(context);
      expect(config.type).toBe('mobile-navigation');
      expect(config.showNavigationBurger).toBe(true);
      expect(config.showProfileBurger).toBe(false);
    });
  });

  describe('桌面端 Menu 配置', () => {
    it('桌面端（>= 1280px）未登入用戶應該看到完整導航條（無 burger）', () => {
      const context: MenuContext = {
        breakpoint: 'desktop',
        pathname: '/',
        isAuthenticated: false,
        userRole: null,
        dashboardView: null
      };
      
      const config = resolveMenuConfig(context);
      expect(config.type).toBe('desktop-navbar');
      expect(config.showNavigationBurger).toBe(false);
      expect(config.showProfileBurger).toBe(false);
      expect(config.showConnectButton).toBe(true);
      expect(config.showProfileButton).toBe(false);
    });

    it('桌面端（>= 1280px）已登入用戶應該看到完整導航條 + Drops + Profile（無 burger）', () => {
      const context: MenuContext = {
        breakpoint: 'desktop',
        pathname: '/',
        isAuthenticated: true,
        userRole: 'user',
        dashboardView: 'supporter'
      };
      
      const config = resolveMenuConfig(context);
      expect(config.type).toBe('desktop-navbar');
      expect(config.showDrops).toBe(true);
      expect(config.showProfileButton).toBe(true);
      expect(config.showConnectButton).toBe(false);
    });
  });

  describe('Menu 項目和認證狀態', () => {
    it('未登入用戶應該能看到 My Agent 選項', () => {
      const context: MenuContext = {
        breakpoint: 'mobile',
        pathname: '/',
        isAuthenticated: false,
        userRole: null,
        dashboardView: null
      };

      const config = resolveMenuConfig(context);
      const myAgentItem = config.items.find(item => item.id === 'my-agent');
      expect(myAgentItem).toBeDefined();
    });

    it('已登入用戶看到的 My Agent 選項應該可以點擊', () => {
      const context: MenuContext = {
        breakpoint: 'mobile',
        pathname: '/',
        isAuthenticated: true,
        userRole: 'user',
        dashboardView: 'supporter'
      };

      const config = resolveMenuConfig(context);
      const myAgentItem = config.items.find(item => item.id === 'my-agent');
      expect(myAgentItem).toBeDefined();
      expect(myAgentItem?.disabled).not.toBe(true);
    });
  });

  describe('動態路由匹配', () => {
    it('移動端（< 1280px）/missions/* 路徑應該顯示導航 burger 按鈕', () => {
      const context: MenuContext = {
        breakpoint: 'mobile',
        pathname: '/missions/daily-checkin',
        isAuthenticated: true,
        userRole: 'user',
        dashboardView: 'supporter'
      };
      
      const config = resolveMenuConfig(context);
      expect(config.type).toBe('mobile-navigation');
      expect(config.showNavigationBurger).toBe(true);
    });

    it('移動端（< 1280px）/project/* 路徑應該顯示導航 burger 按鈕', () => {
      const context: MenuContext = {
        breakpoint: 'mobile',
        pathname: '/project/abc-123',
        isAuthenticated: false,
        userRole: null,
        dashboardView: null
      };
      
      const config = resolveMenuConfig(context);
      expect(config.type).toBe('mobile-navigation');
      expect(config.showNavigationBurger).toBe(true);
    });
  });

  describe('特殊頁面配置', () => {
    it('移動端（< 1280px）create-project 頁面使用 navigation menu', () => {
      const context: MenuContext = {
        breakpoint: 'mobile',
        pathname: '/create-project',
        isAuthenticated: true,
        userRole: 'builder',
        dashboardView: 'builder'
      };
      
      const config = resolveMenuConfig(context);
      expect(config.type).toBe('mobile-navigation');
      expect(config.showNavigationBurger).toBe(true);
      expect(config.specialMenuType).toBe('create-project');
    });

    // Removed mission detail test - missions page is disabled
  });

  describe('Menu 配置完整性', () => {
    it('相同輸入（斷點、路徑、認證、角色）應該產生相同的 Menu 配置', () => {
      const context: MenuContext = {
        breakpoint: 'mobile',
        pathname: '/dashboard',
        isAuthenticated: true,
        userRole: 'builder',
        dashboardView: 'builder'
      };
      
      const config1 = resolveMenuConfig(context);
      const config2 = resolveMenuConfig(context);
      
      // 比較除了 actions 以外的配置（actions 每次創建新函數引用）
      const { actions: actions1, ...rest1 } = config1;
      const { actions: actions2, ...rest2 } = config2;
      
      expect(rest1).toEqual(rest2);
      
      // 驗證 actions 有相同的結構
      expect(Object.keys(actions1)).toEqual(Object.keys(actions2));
      expect(Object.keys(actions1)).toContain('connect');
      expect(Object.keys(actions1)).toContain('logout');
    });

    it('不同輸入應該產生不同的 Menu 配置', () => {
      const context1: MenuContext = {
        breakpoint: 'mobile',
        pathname: '/',
        isAuthenticated: false,
        userRole: null,
        dashboardView: null
      };
      
      const context2: MenuContext = {
        breakpoint: 'desktop',
        pathname: '/',
        isAuthenticated: true,
        userRole: 'builder',
        dashboardView: 'builder'
      };
      
      const config1 = resolveMenuConfig(context1);
      const config2 = resolveMenuConfig(context2);
      
      expect(config1.type).not.toBe(config2.type);
    });

    it('Menu 配置應該包含所有必要的渲染信息（type、items、actions、布爾標誌）', () => {
      const context: MenuContext = {
        breakpoint: 'mobile',
        pathname: '/',
        isAuthenticated: true,
        userRole: 'builder',
        dashboardView: 'builder'
      };
      
      const config = resolveMenuConfig(context);
      
      // 必要的屬性
      expect(config).toHaveProperty('type');
      expect(config).toHaveProperty('items');
      expect(config).toHaveProperty('actions');
      expect(config).toHaveProperty('showNavigationBurger');
      expect(config).toHaveProperty('showProfileBurger');
      expect(config).toHaveProperty('showConnectButton');
      expect(config).toHaveProperty('showProfileButton');
      expect(config).toHaveProperty('showDrops');
      expect(config).toHaveProperty('showBuilderBadge');
      expect(config).toHaveProperty('canSwitchView');
      
      // items 應該是數組
      expect(Array.isArray(config.items)).toBe(true);
      
      // 每個 item 應該有必要的屬性
      config.items.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('label');
        expect(item).toHaveProperty('href');
      });
    });
  });
});