/**
 * 路由守卫测试 - 受保护路由访问权限
 *
 * 业务规则：
 * 1. Dashboard 路由必须要求认证
 * 2. Dashboard 子路由也必须要求认证
 * 3. Profile 路由必须要求认证
 * 4. Profile 子路由也必须要求认证
 * 5. 公开路由不需要认证
 */

import { isProtectedRoute, requiredRolesForRoute } from './routeGuard';

describe('路由守卫 - 受保护路由访问权限', () => {
  describe('isProtectedRoute', () => {
    test('Dashboard 主路由必须要求认证', () => {
      expect(isProtectedRoute('/dashboard')).toBe(true);
    });

    test('Dashboard 子路由必须要求认证', () => {
      const dashboardSubRoutes = [
        '/dashboard/missions',
        '/dashboard/projects',
        '/dashboard/settings',
        '/dashboard/builder-inbox',
        '/dashboard/any-sub-route',
      ];

      dashboardSubRoutes.forEach(route => {
        expect(isProtectedRoute(route)).toBe(true);
      });
    });

    test('Profile 主路由必须要求认证', () => {
      expect(isProtectedRoute('/profile')).toBe(true);
    });

    test('Profile 子路由必须要求认证', () => {
      const profileSubRoutes = [
        '/profile/x402',
        '/profile/settings',
        '/profile/any-sub-route',
      ];

      profileSubRoutes.forEach(route => {
        expect(isProtectedRoute(route)).toBe(true);
      });
    });

    test('公开路由不需要认证', () => {
      const publicRoutes = [
        '/',
        '/projects',
        '/project/some-project',
        '/missions/daily-checkin',
        '/about',
        '/legacy',
      ];

      publicRoutes.forEach(route => {
        expect(isProtectedRoute(route)).toBe(false);
      });
    });

    test('类似 dashboard 但不是 dashboard 的路由不应被保护', () => {
      expect(isProtectedRoute('/dashboards')).toBe(false);
      expect(isProtectedRoute('/my-dashboard')).toBe(false);
      expect(isProtectedRoute('/dashboard-info')).toBe(false);
    });

    test('类似 profile 但不是 profile 的路由不应被保护', () => {
      expect(isProtectedRoute('/profiles')).toBe(false);
      expect(isProtectedRoute('/my-profile')).toBe(false);
      expect(isProtectedRoute('/profile-info')).toBe(false);
    });

    test('空路径不需要认证', () => {
      expect(isProtectedRoute('')).toBe(false);
    });

    test('通配符匹配应该正确工作', () => {
      // dashboard/* 应该匹配所有子路由
      expect(isProtectedRoute('/dashboard/a/b/c')).toBe(true);
      expect(isProtectedRoute('/dashboard/')).toBe(true);

      // profile/* 应该匹配所有子路由
      expect(isProtectedRoute('/profile/x402/settings')).toBe(true);
      expect(isProtectedRoute('/profile/')).toBe(true);

      // 但不应该匹配不以 /dashboard 或 /profile 开头的路由
      expect(isProtectedRoute('/other/dashboard/sub')).toBe(false);
      expect(isProtectedRoute('/other/profile/sub')).toBe(false);
    });
  });

  describe('requiredRolesForRoute', () => {
    test('Dashboard 路由不需要特定角色', () => {
      // 当前配置中 dashboard 没有角色限制，任何认证用户都可以访问
      expect(requiredRolesForRoute('/dashboard')).toBeUndefined();
      expect(requiredRolesForRoute('/dashboard/missions')).toBeUndefined();
    });

    test('Profile 路由不需要特定角色', () => {
      // 当前配置中 profile 没有角色限制，任何认证用户都可以访问
      expect(requiredRolesForRoute('/profile')).toBeUndefined();
      expect(requiredRolesForRoute('/profile/x402')).toBeUndefined();
    });

    test('公开路由返回 undefined', () => {
      expect(requiredRolesForRoute('/')).toBeUndefined();
      expect(requiredRolesForRoute('/projects')).toBeUndefined();
    });
  });
});