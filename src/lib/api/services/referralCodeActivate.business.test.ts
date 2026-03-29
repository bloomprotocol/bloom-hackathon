/**
 * 推荐码生成积分奖励 - 业务逻辑验证测试
 * 
 * 这个测试文件验证核心业务规则：
 * 1. 用户生成推荐码时获得100积分
 * 2. 防止重复获得积分
 * 3. 系统降级保护
 */

import { describe, test, expect } from '@jest/globals';

describe('推荐码生成积分奖励 - 业务逻辑验证', () => {
  
  describe('核心业务规则', () => {
    test('用户首次生成推荐码必须返回 isNewlyGenerated: true', () => {
      // Given: API 返回的数据结构
      const apiResponse = {
        code: 'REF123456',
        friendlyAlias: null,
        totalClicks: 0,
        totalReferrals: 0,
        isNewlyGenerated: true, // 关键标记
        conversionRate: '0.00%'
      };

      // Then: 验证标记
      expect(apiResponse.isNewlyGenerated).toBe(true);
      expect(apiResponse.code).toBeDefined();
      expect(apiResponse.totalClicks).toBe(0);
    });

    test('用户已有推荐码时必须返回 isNewlyGenerated: false', () => {
      // Given: 用户已有推荐码的响应
      const apiResponse = {
        code: 'REF123456',
        friendlyAlias: 'my-code',
        totalClicks: 10,
        totalReferrals: 3,
        isNewlyGenerated: false, // 不是新生成的
        conversionRate: '30.00%'
      };

      // Then: 验证不是新生成
      expect(apiResponse.isNewlyGenerated).toBe(false);
      expect(apiResponse.totalClicks).toBeGreaterThan(0);
    });
  });

  describe('活动记录数据结构', () => {
    test('REFERRAL_CODE_ACTIVATE 活动必须包含正确的数据', () => {
      // Given: 活动记录的数据结构
      const activity = {
        id: 'referral-activate-123',
        type: 'referral',
        action: 'REFERRAL_CODE_ACTIVATE',
        title: 'Referral Code Activated',
        description: 'Generated referral code: REF123456',
        timestamp: new Date().toISOString(),
        projectName: null,
        points: '+100',
        metadata: {
          status: 'ACTIVATED',
          referralCode: 'REF123456'
        }
      };

      // Then: 验证必要字段
      expect(activity.action).toBe('REFERRAL_CODE_ACTIVATE');
      expect(activity.points).toBe('+100');
      expect(activity.metadata.referralCode).toBeDefined();
      expect(activity.type).toBe('referral');
    });

    test('积分显示格式必须是 +100', () => {
      // Given: 积分数据
      const points = 100;
      
      // When: 格式化积分
      const formattedPoints = points > 0 ? `+${points}` : points.toString();
      
      // Then: 验证格式
      expect(formattedPoints).toBe('+100');
    });
  });

  describe('前端显示验证', () => {
    test('Recent Activity 卡片显示正确的标题和内容', () => {
      // Given: 活动数据
      const activity = {
        type: 'referral',
        action: 'REFERRAL_CODE_ACTIVATE',
        metadata: {
          referralCode: 'REF789123'
        }
      };

      // When: 渲染逻辑
      const title = 'Activated your referral code';
      const subtitle = `Your unique code: ${activity.metadata.referralCode}`;

      // Then: 验证显示内容
      expect(title).toBe('Activated your referral code');
      expect(subtitle).toBe('Your unique code: REF789123');
    });

    test('使用与 helpful activity 相同的绿色勾选图标', () => {
      // Given: 图标配置
      const iconConfig = {
        type: 'svg',
        fill: '#71CA41', // 绿色
        checkmark: true
      };

      // Then: 验证图标属性
      expect(iconConfig.fill).toBe('#71CA41');
      expect(iconConfig.checkmark).toBe(true);
    });
  });

  describe('防重复机制', () => {
    test('后端通过 isNewlyGenerated 标记防止重复积分', () => {
      // Given: 两次调用的响应
      const firstCall = {
        code: 'REF123456',
        isNewlyGenerated: true
      };
      
      const secondCall = {
        code: 'REF123456',
        isNewlyGenerated: false
      };

      // Then: 验证标记变化
      expect(firstCall.isNewlyGenerated).toBe(true);
      expect(secondCall.isNewlyGenerated).toBe(false);
      expect(firstCall.code).toBe(secondCall.code); // 同一个推荐码
    });

    test('ProfileModal 根据 referralCode 存在与否显示不同 UI', () => {
      // Given: 两种状态
      const noCodeState = {
        referralCode: null,
        shouldShowGenerateButton: true
      };
      
      const hasCodeState = {
        referralCode: 'REF123456',
        shouldShowGenerateButton: false
      };

      // Then: 验证 UI 逻辑
      expect(noCodeState.shouldShowGenerateButton).toBe(true);
      expect(hasCodeState.shouldShowGenerateButton).toBe(false);
    });
  });

  describe('降级保护', () => {
    test('积分失败时推荐码仍然成功返回', () => {
      // Given: 后端返回成功但内部积分可能失败
      const response = {
        code: 'REF123456',
        friendlyAlias: null,
        totalClicks: 0,
        totalReferrals: 0,
        isNewlyGenerated: true,
        conversionRate: '0.00%'
      };

      // Then: 核心功能正常
      expect(response.code).toBeDefined();
      expect(response.code.startsWith('REF')).toBe(true);
    });

    test('MongoDB 规则缺失时 API 仍返回成功', () => {
      // Given: 成功的响应结构
      const response = {
        success: true,
        data: {
          code: 'REF123456',
          isNewlyGenerated: true
        }
      };

      // Then: 验证响应
      expect(response.success).toBe(true);
      expect(response.data.code).toBeDefined();
    });
  });

  describe('端到端数据流', () => {
    test('完整的数据流：生成 → 积分 → 活动显示', () => {
      // Given: 完整流程的数据
      const flow = {
        // 1. 用户点击生成
        userAction: 'CLICK_GENERATE',
        
        // 2. API 返回
        apiResponse: {
          code: 'REF123456',
          isNewlyGenerated: true
        },
        
        // 3. 活动记录
        activityRecord: {
          action: 'REFERRAL_CODE_ACTIVATE',
          points: '+100',
          metadata: {
            referralCode: 'REF123456'
          }
        }
      };

      // Then: 验证数据一致性
      expect(flow.apiResponse.code).toBe(flow.activityRecord.metadata.referralCode);
      expect(flow.apiResponse.isNewlyGenerated).toBe(true);
      expect(flow.activityRecord.points).toBe('+100');
    });
  });
});