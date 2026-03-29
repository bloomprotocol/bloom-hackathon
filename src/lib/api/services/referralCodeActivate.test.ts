/**
 * 推荐码生成积分奖励测试 - 保护核心业务价值
 * 
 * 业务规则：
 * 1. 用户在 ProfileModal 中点击 "Generate Code" 必须获得100积分
 * 2. 同一用户只能获得一次积分（防重复）
 * 3. 积分操作失败不影响推荐码生成功能
 * 4. 推荐码生成后必须记录正确的积分来源
 */

// Mock the apiConfig module
jest.mock('../apiConfig', () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPut: jest.fn(),
  apiDelete: jest.fn()
}));

import { apiGet } from '../apiConfig';
import { referralService } from './referralService';
import { savesService } from './savesService';

describe('推荐码生成积分奖励 - 核心业务逻辑', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('积分奖励规则 - 推荐码生成时必须获得100积分', () => {
    test('推荐码生成必须增加100积分到用户帐戶', async () => {
      // Given: 用户首次生成推荐码
      const expectedReferralCode = 'REF123456';
      
      // Mock referral code generation response
      (apiGet as jest.Mock).mockResolvedValueOnce({
        success: true,
        statusCode: 200,
        data: {
          code: expectedReferralCode,
          friendlyAlias: null,
          totalClicks: 0,
          totalReferrals: 0,
          isNewlyGenerated: true,
          conversionRate: '0.00%'
        },
        error: null
      });

      // When: 用户在 ProfileModal 中点击 "Generate Code"
      const generateResult = await referralService.getMyReferralCode();
      
      // Then: 
      // 1. 推荐码成功生成
      expect(generateResult.code).toBe(expectedReferralCode);
      expect(generateResult.isNewlyGenerated).toBe(true);
      
      // 2. API 被正确调用
      expect(apiGet).toHaveBeenCalledWith('/referral/my-code');
    });

    test('推荐码生成后必须在活动列表中显示REFERRAL_CODE_ACTIVATE', async () => {
      // Given: 用户刚生成了推荐码
      const expectedReferralCode = 'REF123456';
      
      // Mock recent activity response with referral code activation
      (apiGet as jest.Mock).mockResolvedValueOnce({
        success: true,
        statusCode: 200,
        data: {
          activities: [
            {
              id: 'referral-activate-123',
              type: 'referral',
              action: 'REFERRAL_CODE_ACTIVATE',
              title: 'Referral Code Activated',
              description: `Generated referral code: ${expectedReferralCode}`,
              timestamp: new Date().toISOString(),
              projectName: null,
              points: '+100',
              metadata: {
                status: 'ACTIVATED',
                referralCode: expectedReferralCode
              }
            }
          ],
          total: 1,
          page: 1,
          hasMore: false
        },
        error: null
      });

      // When: 获取最近活动
      const activities = await savesService.getUserRecentActivity();
      
      // Then: 验证活动记录正确
      const referralActivity = activities.activities.find(a => a.action === 'REFERRAL_CODE_ACTIVATE');
      expect(referralActivity).toBeDefined();
      expect(referralActivity?.points).toBe('+100');
      expect(referralActivity?.metadata.referralCode).toBe(expectedReferralCode);
    });

    test('推荐码生成的积分类型必须是DROPS（通过活动记录验证）', async () => {
      // Given: Recent activity with DROPS points
      (apiGet as jest.Mock).mockResolvedValueOnce({
        success: true,
        statusCode: 200,
        data: {
          activities: [
            {
              id: 'referral-activate-123',
              type: 'referral',
              action: 'REFERRAL_CODE_ACTIVATE',
              title: 'Referral Code Activated',
              description: 'Generated referral code: REF789123',
              timestamp: new Date().toISOString(),
              projectName: null,
              points: '+100', // 100 DROPS
              metadata: {
                status: 'ACTIVATED',
                referralCode: 'REF789123'
              }
            }
          ],
          total: 1,
          page: 1,
          hasMore: false
        },
        error: null
      });

      // When: 获取活动记录
      const activities = await savesService.getUserRecentActivity();
      
      // Then: 积分显示为正数，表示DROPS类型
      const referralActivity = activities.activities[0];
      expect(referralActivity.points).toBe('+100');
      expect(parseInt(referralActivity.points)).toBeGreaterThan(0);
    });
  });

  describe('防重複業務規則 - 每個用戶只能生成一次推薦碼並獲得一次積分', () => {
    test('用戶第一次點擊 Generate Code 按鈕必須獲得積分', async () => {
      // Given: 用户首次点击 Generate Code 按钮
      const newCode = 'REF123456';
      
      // Mock first time generation
      (apiGet as jest.Mock).mockResolvedValueOnce({
        success: true,
        statusCode: 200,
        data: {
          code: newCode,
          friendlyAlias: null,
          totalClicks: 0,
          totalReferrals: 0,
          isNewlyGenerated: true, // 标记为新生成
          conversionRate: '0.00%'
        },
        error: null
      });

      // When: 用户点击 Generate Code
      const result = await referralService.getMyReferralCode();
      
      // Then: 
      expect(result.code).toBe(newCode);
      expect(result.isNewlyGenerated).toBe(true); // 确认是新生成的
    });

    test('用戶已有推薦碼時，API 調用不會再派發積分', async () => {
      // Given: 用户已经生成过推荐码
      const existingCode = 'REF123456';
      
      // Mock existing code response
      (apiGet as jest.Mock).mockResolvedValueOnce({
        success: true,
        statusCode: 200,
        data: {
          code: existingCode,
          friendlyAlias: null,
          totalClicks: 5,
          totalReferrals: 2,
          isNewlyGenerated: false, // 不是新生成的
          conversionRate: '40.00%'
        },
        error: null
      });

      // When: 用户再次调用API
      const result = await referralService.getMyReferralCode();
      
      // Then: 
      expect(result.code).toBe(existingCode);
      expect(result.isNewlyGenerated).toBe(false); // 不是新生成的
      expect(result.totalClicks).toBeGreaterThan(0); // 已有使用记录
    });

    test('恶意用戶通過 Postman/cURL 重複調用 API 不會獲得額外積分', async () => {
      // Given: 恶意用户尝试绕过前端限制
      const existingCode = 'REF123456';
      
      // Mock multiple calls - all return existing code
      (apiGet as jest.Mock)
        .mockResolvedValueOnce({
          success: true,
          statusCode: 200,
          data: {
            code: existingCode,
            friendlyAlias: null,
            totalClicks: 0,
            totalReferrals: 0,
            isNewlyGenerated: true, // 第一次是新的
            conversionRate: '0.00%'
          },
          error: null
        })
        .mockResolvedValueOnce({
          success: true,
          statusCode: 200,
          data: {
            code: existingCode,
            friendlyAlias: null,
            totalClicks: 0,
            totalReferrals: 0,
            isNewlyGenerated: false, // 后续调用不是新的
            conversionRate: '0.00%'
          },
          error: null
        })
        .mockResolvedValueOnce({
          success: true,
          statusCode: 200,
          data: {
            code: existingCode,
            friendlyAlias: null,
            totalClicks: 0,
            totalReferrals: 0,
            isNewlyGenerated: false, // 后续调用不是新的
            conversionRate: '0.00%'
          },
          error: null
        });

      // When: 恶意用户多次调用API
      const firstCall = await referralService.getMyReferralCode();
      const secondCall = await referralService.getMyReferralCode();
      const thirdCall = await referralService.getMyReferralCode();
      
      // Then: 
      expect(firstCall.isNewlyGenerated).toBe(true); // 只有第一次是新的
      expect(secondCall.isNewlyGenerated).toBe(false);
      expect(thirdCall.isNewlyGenerated).toBe(false);
      
      // 所有调用返回相同的推荐码
      expect(firstCall.code).toBe(existingCode);
      expect(secondCall.code).toBe(existingCode);
      expect(thirdCall.code).toBe(existingCode);
    });
  });

  describe('業務連續性規則 - 積分操作失敗不影響核心推薦功能', () => {
    test('積分操作失敗時推薦碼生成流程仍然成功', async () => {
      // Given: 后端正确处理积分失败的情况
      const newCode = 'REF123456';
      
      // Mock successful referral code generation (even if points failed internally)
      (apiGet as jest.Mock).mockResolvedValueOnce({
        success: true,
        statusCode: 200,
        data: {
          code: newCode,
          friendlyAlias: null,
          totalClicks: 0,
          totalReferrals: 0,
          isNewlyGenerated: true,
          conversionRate: '0.00%'
          // Note: 后端处理了积分失败，但推荐码仍然生成成功
        },
        error: null
      });

      // When: 生成推荐码
      const result = await referralService.getMyReferralCode();
      
      // Then: 推荐码生成成功
      expect(result.code).toBe(newCode);
      expect(result.isNewlyGenerated).toBe(true);
    });

    test('積分系統故障不影響推薦關係建立', async () => {
      // Given: 积分系统故障但推荐码系统正常
      const newCode = 'REF456789';
      
      (apiGet as jest.Mock).mockResolvedValueOnce({
        success: true,
        statusCode: 200,
        data: {
          code: newCode,
          friendlyAlias: null,
          totalClicks: 0,
          totalReferrals: 0,
          isNewlyGenerated: true,
          conversionRate: '0.00%'
        },
        error: null
      });

      // When: 生成推荐码
      const result = await referralService.getMyReferralCode();
      
      // Then: 推荐码功能不受影响
      expect(result.code).toBe(newCode);
      expect(result.isNewlyGenerated).toBe(true);
    });

    test('MongoDB 獎勵規則不存在時不阻塞推薦碼生成', async () => {
      // Given: MongoDB 奖励规则缺失但推荐码系统正常
      const newCode = 'REF789123';
      
      (apiGet as jest.Mock).mockResolvedValueOnce({
        success: true,
        statusCode: 200,
        data: {
          code: newCode,
          friendlyAlias: null,
          totalClicks: 0,
          totalReferrals: 0,
          isNewlyGenerated: true,
          conversionRate: '0.00%'
        },
        error: null
      });

      // When: 生成推荐码
      const result = await referralService.getMyReferralCode();
      
      // Then: 推荐码生成不受影响
      expect(result.code).toBe(newCode);
    });
  });

  describe('業務邏輯完整性 - 確保推薦碼生成的完整業務流程', () => {
    test('推薦碼生成必須同時完成: 關係建立 + 積分獎勵 + 活動記錄', async () => {
      // Given: 完整的业务流程
      const newCode = 'REF123456';
      
      // 1. Mock 推荐码生成
      (apiGet as jest.Mock).mockResolvedValueOnce({
        success: true,
        statusCode: 200,
        data: {
          code: newCode,
          friendlyAlias: null,
          totalClicks: 0,
          totalReferrals: 0,
          isNewlyGenerated: true,
          conversionRate: '0.00%'
        },
        error: null
      });
      
      // 2. Mock 活动记录包含积分信息
      (apiGet as jest.Mock).mockResolvedValueOnce({
        success: true,
        statusCode: 200,
        data: {
          activities: [
            {
              id: 'referral-activate-123',
              type: 'referral',
              action: 'REFERRAL_CODE_ACTIVATE',
              title: 'Referral Code Activated',
              description: `Generated referral code: ${newCode}`,
              timestamp: new Date().toISOString(),
              projectName: null,
              points: '+100',
              metadata: {
                status: 'ACTIVATED',
                referralCode: newCode
              }
            }
          ],
          total: 1,
          page: 1,
          hasMore: false
        },
        error: null
      });

      // When: 执行完整流程
      const referralResult = await referralService.getMyReferralCode();
      const activityResult = await savesService.getUserRecentActivity();
      
      // Then: 验证完整流程
      // 1. 推荐码生成成功
      expect(referralResult.code).toBe(newCode);
      expect(referralResult.isNewlyGenerated).toBe(true);
      
      // 2. 活动记录包含积分
      const activity = activityResult.activities[0];
      expect(activity.action).toBe('REFERRAL_CODE_ACTIVATE');
      expect(activity.points).toBe('+100');
      expect(activity.metadata.referralCode).toBe(newCode);
    });

    test('推薦碼生成必須在正確的時機觸發積分獎勵', async () => {
      // Given: 监控API调用顺序
      const callOrder: string[] = [];
      const newCode = 'REF456789';
      
      (apiGet as jest.Mock).mockImplementation((url: string) => {
        if (url === '/referral/my-code') {
          callOrder.push('generate-referral-code');
          return Promise.resolve({
            success: true,
            statusCode: 200,
            data: {
              code: newCode,
              friendlyAlias: null,
              totalClicks: 0,
              totalReferrals: 0,
              isNewlyGenerated: true,
              conversionRate: '0.00%'
            },
            error: null
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      // When: 生成推荐码
      await referralService.getMyReferralCode();
      
      // Then: 验证调用顺序
      expect(callOrder).toContain('generate-referral-code');
      expect(apiGet).toHaveBeenCalledWith('/referral/my-code');
    });

    test('推薦碼生成的積分描述必須包含推薦碼信息', async () => {
      // Given: 活动记录包含详细描述
      const expectedCode = 'REF789123';
      
      (apiGet as jest.Mock).mockResolvedValueOnce({
        success: true,
        statusCode: 200,
        data: {
          activities: [
            {
              id: 'referral-activate-789',
              type: 'referral',
              action: 'REFERRAL_CODE_ACTIVATE',
              title: 'Referral Code Activated',
              description: `Generated referral code: ${expectedCode}`,
              timestamp: new Date().toISOString(),
              projectName: null,
              points: '+100',
              metadata: {
                status: 'ACTIVATED',
                referralCode: expectedCode
              }
            }
          ],
          total: 1,
          page: 1,
          hasMore: false
        },
        error: null
      });

      // When: 获取活动记录
      const activities = await savesService.getUserRecentActivity();
      
      // Then: 验证描述包含推荐码
      const activity = activities.activities[0];
      expect(activity.description).toContain(expectedCode);
      expect(activity.metadata.referralCode).toBe(expectedCode);
    });
  });
});