/**
 * 认证服务测试 - P0 认证核心业务流程
 * 
 * 业务规则：
 * 1. 新用户必须先注册再登录
 * 2. 既有用户直接登录
 * 3. API 调用必须包含正确的参数
 */

import { registerUser, loginWithWallet } from './authService';
import { mockAuthResponses, mockWalletAddresses } from '../../../../__mocks__/data';

// Mock the apiConfig module
jest.mock('../apiConfig', () => ({
  apiPost: jest.fn(),
  apiGet: jest.fn(),
}));

import { apiPost } from '../apiConfig';

describe('认证服务 - 核心业务流程', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('新用户注册流程', () => {
    test('新用户注册必须传递正确的钱包地址', async () => {
      // Given: 新用户的钱包地址
      const walletAddress = mockWalletAddresses.user2;
      (apiPost as jest.Mock).mockResolvedValue(mockAuthResponses.registerSuccess);

      // When: 调用注册服务
      const result = await registerUser({ walletAddress });

      // Then: 
      // 1. 调用正确的 API 端点
      expect(apiPost).toHaveBeenCalledWith('/users', { walletAddress });
      
      // 2. 返回注册成功的数据
      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        user: {
          wallet_address: walletAddress,
          role: 'USER',
        },
      });
    });

    test('注册时包含邮箱应该传递到 API', async () => {
      // Given: 包含邮箱的注册信息
      const params = {
        walletAddress: mockWalletAddresses.user2,
        email: 'newuser@test.com',
      };
      (apiPost as jest.Mock).mockResolvedValue(mockAuthResponses.registerSuccess);

      // When: 调用注册服务
      await registerUser(params);

      // Then: API 调用包含邮箱
      expect(apiPost).toHaveBeenCalledWith('/users', {
        walletAddress: params.walletAddress,
        email: params.email,
      });
    });

    test('注册时不应该传递 undefined 的参数', async () => {
      // Given: 只有钱包地址，没有邮箱和推荐码
      const params = {
        walletAddress: mockWalletAddresses.user2,
        email: undefined,
        referralCode: undefined,
      };
      (apiPost as jest.Mock).mockResolvedValue(mockAuthResponses.registerSuccess);

      // When: 调用注册服务
      await registerUser(params);

      // Then: 只传递有值的参数
      expect(apiPost).toHaveBeenCalledWith('/users', {
        walletAddress: params.walletAddress,
        // 不应该包含 email 和 referralCode 字段
      });
    });
  });

  describe('用户登录流程', () => {
    test('登录必须使用 address 作为参数名', async () => {
      // Given: 用户钱包地址
      const address = mockWalletAddresses.user1;
      (apiPost as jest.Mock).mockResolvedValue(mockAuthResponses.loginSuccess);

      // When: 调用登录服务
      await loginWithWallet({ address });

      // Then: 使用正确的参数名
      expect(apiPost).toHaveBeenCalledWith('/auth/user/wallet/login', { address });
    });

    test('登录成功应返回用户信息和 tokens', async () => {
      // Given: 既有用户
      const address = mockWalletAddresses.user1;
      (apiPost as jest.Mock).mockResolvedValue(mockAuthResponses.loginSuccess);

      // When: 登录
      const result = await loginWithWallet({ address });

      // Then: 返回完整的认证信息
      expect(result).toEqual(mockAuthResponses.loginSuccess);
      expect(result.data.access_token).toBeDefined();
      expect(result.data.refresh_token).toBeDefined();
      expect(result.data.user.wallet_address).toBe(address);
    });

    test('登录时包含邮箱应该传递到 API', async () => {
      // Given: 包含邮箱的登录信息
      const params = {
        address: mockWalletAddresses.user1,
        email: 'user@test.com',
      };
      (apiPost as jest.Mock).mockResolvedValue(mockAuthResponses.loginSuccess);

      // When: 调用登录服务
      await loginWithWallet(params);

      // Then: API 调用包含邮箱
      expect(apiPost).toHaveBeenCalledWith('/auth/user/wallet/login', {
        address: params.address,
        email: params.email,
      });
    });

    test('API 错误应该正确传递', async () => {
      // Given: API 会返回错误
      const error = new Error('Network error');
      (apiPost as jest.Mock).mockRejectedValue(error);

      // When & Then: 错误应该被抛出
      await expect(loginWithWallet({ address: 'any' })).rejects.toThrow('Network error');
    });
  });
});