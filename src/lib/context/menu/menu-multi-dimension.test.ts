import { describe, it, expect } from '@jest/globals';
import { resolveMenuConfig, MenuContext } from './menuResolver';

describe('Menu 多維度決策測試', () => {
  describe('完整測試矩陣：斷點 × 認證 × 角色 × 頁面類型', () => {
    const breakpoints = ['mobile', 'desktop'] as const;
    const authStates = [false, true];
    const roles = [null, 'user', 'builder'] as const;
    const pages = ['/', '/dashboard', '/missions/daily', '/_wallet-detect'];

    it('應該覆蓋所有可能的組合（2×2×3×4 = 48 種）', () => {
      const results = new Set();

      breakpoints.forEach(breakpoint => {
        authStates.forEach(isAuthenticated => {
          roles.forEach(userRole => {
            // 只有認證用戶才有角色
            if (!isAuthenticated && userRole !== null) return;
            
            pages.forEach(pathname => {
              const context: MenuContext = {
                breakpoint,
                pathname,
                isAuthenticated,
                userRole,
                dashboardView: userRole === 'builder' ? 'builder' : 'supporter'
              };

              const config = resolveMenuConfig(context);
              const key = `${breakpoint}-${isAuthenticated}-${userRole}-${pathname}`;
              results.add(key);

              // 每個組合都應該有有效的配置
              expect(config.type).toBeTruthy();
              expect(Array.isArray(config.items)).toBe(true);
            });
          });
        });
      });

      // 確保測試了所有有效組合
      expect(results.size).toBeGreaterThan(30); // 排除無效組合後
    });
  });

  describe('優先級規則', () => {
    it('移動端總是使用 navigation menu', () => {
      // 所有移動端頁面都使用 navigation menu
      const context: MenuContext = {
        breakpoint: 'mobile',
        pathname: '/dashboard',
        isAuthenticated: false,
        userRole: null,
        dashboardView: null
      };

      const config = resolveMenuConfig(context);
      expect(config.type).toBe('mobile-navigation');
    });

    it('所有頁面都提供完整導航功能（不再有標準模式）', () => {
      // 工具頁面也應該提供完整的導航功能
      const context: MenuContext = {
        breakpoint: 'mobile',
        pathname: '/_wallet-detect',
        isAuthenticated: true,
        userRole: 'builder',
        dashboardView: 'builder'
      };

      const config = resolveMenuConfig(context);
      expect(config.type).toBe('mobile-navigation');
    });

    it('斷點優先於所有其他條件', () => {
      // 桌面端永遠是 desktop-navbar
      const context: MenuContext = {
        breakpoint: 'desktop',
        pathname: '/dashboard',
        isAuthenticated: true,
        userRole: 'builder',
        dashboardView: 'builder'
      };

      const config = resolveMenuConfig(context);
      expect(config.type).toBe('desktop-navbar');
      expect(config.showNavigationBurger).toBe(false);
      expect(config.showProfileBurger).toBe(false);
    });
  });

  describe('邊緣情況處理', () => {
    it('未知頁面應該降級到導航模式（提供完整功能）', () => {
      const context: MenuContext = {
        breakpoint: 'mobile',
        pathname: '/some-unknown-page',
        isAuthenticated: false,
        userRole: null,
        dashboardView: null
      };

      const config = resolveMenuConfig(context);
      expect(config.type).toBe('mobile-navigation');
    });

    it('空路徑應該被當作主頁處理', () => {
      const context: MenuContext = {
        breakpoint: 'mobile',
        pathname: '',
        isAuthenticated: false,
        userRole: null,
        dashboardView: null
      };

      const config = resolveMenuConfig(context);
      expect(config.type).toBe('mobile-navigation');
    });

    it('無效角色應該被忽略', () => {
      const context: MenuContext = {
        breakpoint: 'mobile',
        pathname: '/',
        isAuthenticated: true,
        userRole: 'invalid-role' as any,
        dashboardView: 'supporter'
      };

      const config = resolveMenuConfig(context);
      expect(config.showBuilderBadge).toBe(false);
      expect(config.canSwitchView).toBe(false);
    });
  });

  describe('功能權限驗證', () => {
    it('只有 Builder 可以看到 Builder 特有功能', () => {
      const builderContext: MenuContext = {
        breakpoint: 'desktop',
        pathname: '/',
        isAuthenticated: true,
        userRole: 'builder',
        dashboardView: 'builder'
      };

      const userContext: MenuContext = {
        breakpoint: 'desktop',
        pathname: '/',
        isAuthenticated: true,
        userRole: 'user',
        dashboardView: 'supporter'
      };

      const builderConfig = resolveMenuConfig(builderContext);
      const userConfig = resolveMenuConfig(userContext);

      // Builder 特有功能
      expect(builderConfig.showBuilderBadge).toBe(true);
      expect(builderConfig.canSwitchView).toBe(true);

      // 普通用戶沒有這些功能
      expect(userConfig.showBuilderBadge).toBe(false);
      expect(userConfig.canSwitchView).toBe(false);
    });

    it('My Agent 對所有用戶可見', () => {
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
      expect(myAgentItem?.disabled).not.toBe(true);
    });

    it('積分（Drops）只對已登入用戶顯示', () => {
      const loggedInContext: MenuContext = {
        breakpoint: 'desktop',
        pathname: '/',
        isAuthenticated: true,
        userRole: 'user',
        dashboardView: 'supporter'
      };

      const loggedOutContext: MenuContext = {
        breakpoint: 'desktop',
        pathname: '/',
        isAuthenticated: false,
        userRole: null,
        dashboardView: null
      };

      const loggedInConfig = resolveMenuConfig(loggedInContext);
      const loggedOutConfig = resolveMenuConfig(loggedOutContext);

      expect(loggedInConfig.showDrops).toBe(true);
      expect(loggedOutConfig.showDrops).toBe(false);
    });
  });

  describe('複雜場景測試', () => {
    it('移動端 Builder 在 Dashboard 的完整配置', () => {
      const context: MenuContext = {
        breakpoint: 'mobile',
        pathname: '/dashboard',
        isAuthenticated: true,
        userRole: 'builder',
        dashboardView: 'builder'
      };

      const config = resolveMenuConfig(context);

      // 應該顯示 navigation menu
      expect(config.type).toBe('mobile-navigation');
      expect(config.showNavigationBurger).toBe(true);
      // Profile button 觸發 ProfileModal
      expect(config.showProfileButton).toBe(true);

      // Builder 特性
      expect(config.showBuilderBadge).toBe(true);
      expect(config.canSwitchView).toBe(true);

      // Dashboard 特有配置
      expect(config.specialMenuType).toBe('dashboard');
    });

    it('桌面端未登入用戶在項目頁的完整配置', () => {
      const context: MenuContext = {
        breakpoint: 'desktop',
        pathname: '/spotlight',
        isAuthenticated: false,
        userRole: null,
        dashboardView: null
      };

      const config = resolveMenuConfig(context);

      // 桌面端導航條
      expect(config.type).toBe('desktop-navbar');

      // 未登入狀態
      expect(config.showConnectButton).toBe(true);
      expect(config.showProfileButton).toBe(false);
      expect(config.showDrops).toBe(false);

      // Menu 項目
      expect(config.items.length).toBeGreaterThan(0);
      expect(config.items.some(item => item.id === 'discover')).toBe(true);
    });

    // Removed mission detail test - missions page is disabled
  });

  describe('配置完整性驗證', () => {
    it('所有配置都應該包含必要的字段', () => {
      const testCases: MenuContext[] = [
        {
          breakpoint: 'mobile',
          pathname: '/',
          isAuthenticated: false,
          userRole: null,
          dashboardView: null
        },
        {
          breakpoint: 'desktop',
          pathname: '/dashboard',
          isAuthenticated: true,
          userRole: 'builder',
          dashboardView: 'builder'
        }
      ];

      testCases.forEach(context => {
        const config = resolveMenuConfig(context);

        // 必須有的字段
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
      });
    });

    it('Menu items 應該有正確的結構', () => {
      const context: MenuContext = {
        breakpoint: 'mobile',
        pathname: '/',
        isAuthenticated: true,
        userRole: 'user',
        dashboardView: 'supporter'
      };

      const config = resolveMenuConfig(context);

      config.items.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('label');
        expect(item).toHaveProperty('href');
        expect(typeof item.id).toBe('string');
        expect(typeof item.label).toBe('string');
        expect(typeof item.href).toBe('string');
      });
    });
  });
});