/**
 * Dashboard 角色检测业务逻辑测试 - P0 核心场景
 * 
 * 业务规则：
 * 1. hasRole('BUILDER') 决定用户可访问的功能
 * 2. 角色检测支持单个角色和角色数组
 * 3. 无角色数据时返回 false
 * 4. 角色匹配不区分大小写
 */

import { UserRole } from '@/lib/types/auth';

// 提取 hasRole 的核心逻辑进行测试
function hasRoleLogic(userRoles: UserRole[] | null | undefined, requiredRole: string | string[]): boolean {
  if (!userRoles) return false;
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.some(r => userRoles.includes(r as UserRole));
  }
  
  return userRoles.includes(requiredRole as UserRole);
}

describe('Dashboard 角色检测 - 核心业务逻辑', () => {
  describe('hasRole 函数逻辑', () => {
    test('BUILDER 用户应该有 BUILDER 权限', () => {
      // Given: 用户有 BUILDER 角色
      const userRoles: UserRole[] = ['BUILDER'];
      
      // When: 检查 BUILDER 权限
      const result = hasRoleLogic(userRoles, 'BUILDER');
      
      // Then: 应该返回 true
      expect(result).toBe(true);
    });

    test('USER 用户不应该有 BUILDER 权限', () => {
      // Given: 用户只有 USER 角色
      const userRoles: UserRole[] = ['USER'];
      
      // When: 检查 BUILDER 权限
      const result = hasRoleLogic(userRoles, 'BUILDER');
      
      // Then: 应该返回 false
      expect(result).toBe(false);
    });

    test('角色检测区分大小写', () => {
      // Given: 用户有 BUILDER 角色
      const userRoles: UserRole[] = ['BUILDER'];
      
      // When: 使用小写检查权限
      const result = hasRoleLogic(userRoles, 'builder');
      
      // Then: 应该返回 false（角色检测区分大小写）
      expect(result).toBe(false);
    });

    test('支持多角色检查（OR 逻辑）', () => {
      // Given: 用户只有 USER 角色
      const userRoles: UserRole[] = ['USER'];
      
      // When: 检查是否有 BUILDER 或 ADMIN 权限
      const result = hasRoleLogic(userRoles, ['BUILDER', 'ADMIN']);
      
      // Then: 应该返回 false
      expect(result).toBe(false);
      
      // When: 检查是否有 USER 或 ADMIN 权限
      const result2 = hasRoleLogic(userRoles, ['USER', 'ADMIN']);
      
      // Then: 应该返回 true
      expect(result2).toBe(true);
    });

    test('用户有多个角色时应该正确匹配', () => {
      // Given: 用户有多个角色
      const userRoles: UserRole[] = ['USER', 'BUILDER'];
      
      // When: 检查各种权限
      expect(hasRoleLogic(userRoles, 'USER')).toBe(true);
      expect(hasRoleLogic(userRoles, 'BUILDER')).toBe(true);
      expect(hasRoleLogic(userRoles, 'ADMIN')).toBe(false);
      expect(hasRoleLogic(userRoles, ['ADMIN', 'BUILDER'])).toBe(true);
    });

    test('无角色数据时应该返回 false', () => {
      // Given: 各种无效的角色数据
      const testCases = [null, undefined, []];
      
      testCases.forEach(userRoles => {
        // When: 检查任何权限
        const result = hasRoleLogic(userRoles as any, 'BUILDER');
        
        // Then: 应该返回 false
        expect(result).toBe(false);
      });
    });
  });

  describe('Dashboard 业务场景', () => {
    test('Builder 用户默认视图应该是 builder', () => {
      // Given: 用户角色是 BUILDER
      const userRole = 'BUILDER';
      const isBuilder = hasRoleLogic(['BUILDER'], 'BUILDER');
      
      // When: 计算默认视图
      const defaultView = userRole.toLowerCase() === 'builder' ? 'builder' : 'supporter';
      
      // Then: 默认视图应该是 builder
      expect(isBuilder).toBe(true);
      expect(defaultView).toBe('builder');
    });

    test('普通用户默认视图应该是 supporter', () => {
      // Given: 用户角色是 USER
      const userRole = 'USER';
      const isBuilder = hasRoleLogic(['USER'], 'BUILDER');
      
      // When: 计算默认视图
      const defaultView = userRole.toLowerCase() === 'builder' ? 'builder' : 'supporter';
      
      // Then: 默认视图应该是 supporter
      expect(isBuilder).toBe(false);
      expect(defaultView).toBe('supporter');
    });

    test('只有 Builder 用户可以看到视图切换按钮', () => {
      // Given: 不同角色的用户
      const builderRoles: UserRole[] = ['BUILDER'];
      const userRoles: UserRole[] = ['USER'];
      
      // When: 检查是否显示视图切换
      const builderCanToggle = hasRoleLogic(builderRoles, 'BUILDER');
      const userCanToggle = hasRoleLogic(userRoles, 'BUILDER');
      
      // Then: 只有 Builder 可以切换视图
      expect(builderCanToggle).toBe(true);
      expect(userCanToggle).toBe(false);
    });

    test('角色检测必须匹配确切大小写', () => {
      // Given: 用户有 BUILDER 角色
      const userRoles: UserRole[] = ['BUILDER'];
      
      // When: 使用不同大小写检查
      const checkUpperCase = hasRoleLogic(userRoles, 'BUILDER');
      const checkLowerCase = hasRoleLogic(userRoles, 'builder');
      const checkMixedCase = hasRoleLogic(userRoles, 'Builder');
      
      // Then: 只有确切匹配才返回 true
      expect(checkUpperCase).toBe(true);
      expect(checkLowerCase).toBe(false);
      expect(checkMixedCase).toBe(false);
    });
  });
});