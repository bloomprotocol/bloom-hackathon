/**
 * JWT 刷新逻辑测试 - P0 认证核心业务逻辑
 * 
 * 业务规则：
 * 1. 角色切换后必须重新认证获取新的 JWT
 * 2. 必须更新 cookie 中的 auth-token
 * 3. 必须清除 React Query 缓存
 */

import { extractJwtRefreshLogic } from './jwt-refresh-logic';

describe('JWT 刷新逻辑 - 核心业务逻辑', () => {
  let mockLoginWithWallet: jest.Mock;
  let mockSetCookie: jest.Mock;
  let mockInvalidateQueries: jest.Mock;

  beforeEach(() => {
    mockLoginWithWallet = jest.fn();
    mockSetCookie = jest.fn();
    mockInvalidateQueries = jest.fn();
  });

  test('角色切换后必须重新认证获取新 JWT', async () => {
    // Given: 用户要切换到 BUILDER 角色
    const walletAddress = '0x1234567890123456789012345678901234567890';
    const newRole = 'BUILDER';
    mockLoginWithWallet.mockResolvedValue(true);

    // When: 执行 JWT 刷新
    const result = await extractJwtRefreshLogic({
      walletAddress,
      newRole,
      loginWithWallet: mockLoginWithWallet,
      setCookie: mockSetCookie,
      invalidateQueries: mockInvalidateQueries,
    });

    // Then: 必须调用重新登录
    expect(mockLoginWithWallet).toHaveBeenCalledWith(walletAddress);
    expect(mockLoginWithWallet).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
  });

  test('登录成功后必须更新 auth-token cookie', async () => {
    // Given: 登录会成功
    const walletAddress = '0x1234567890123456789012345678901234567890';
    const newRole = 'USER';
    mockLoginWithWallet.mockResolvedValue(true);

    // When: 执行 JWT 刷新
    await extractJwtRefreshLogic({
      walletAddress,
      newRole,
      loginWithWallet: mockLoginWithWallet,
      setCookie: mockSetCookie,
      invalidateQueries: mockInvalidateQueries,
    });

    // Then: 必须设置新的 auth-token
    expect(mockSetCookie).toHaveBeenCalledWith('auth-token', expect.stringContaining(newRole));
    expect(mockSetCookie).toHaveBeenCalledTimes(1);
  });

  test('更新 JWT 后必须清除 React Query 缓存', async () => {
    // Given: 登录会成功
    mockLoginWithWallet.mockResolvedValue(true);

    // When: 执行 JWT 刷新
    await extractJwtRefreshLogic({
      walletAddress: '0x123',
      newRole: 'BUILDER',
      loginWithWallet: mockLoginWithWallet,
      setCookie: mockSetCookie,
      invalidateQueries: mockInvalidateQueries,
    });

    // Then: 必须清除缓存
    expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
  });

  test('登录失败时不应该更新 cookie 或清除缓存', async () => {
    // Given: 登录会失败
    mockLoginWithWallet.mockResolvedValue(false);

    // When: 执行 JWT 刷新
    const result = await extractJwtRefreshLogic({
      walletAddress: '0x123',
      newRole: 'BUILDER',
      loginWithWallet: mockLoginWithWallet,
      setCookie: mockSetCookie,
      invalidateQueries: mockInvalidateQueries,
    });

    // Then: 不应该执行后续操作
    expect(result.success).toBe(false);
    expect(mockSetCookie).not.toHaveBeenCalled();
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });

  test('没有提供 invalidateQueries 时应该正常工作', async () => {
    // Given: 没有提供 invalidateQueries 函数
    mockLoginWithWallet.mockResolvedValue(true);

    // When: 执行 JWT 刷新
    const result = await extractJwtRefreshLogic({
      walletAddress: '0x123',
      newRole: 'USER',
      loginWithWallet: mockLoginWithWallet,
      setCookie: mockSetCookie,
      // 不提供 invalidateQueries
    });

    // Then: 应该正常完成其他步骤
    expect(result.success).toBe(true);
    expect(mockSetCookie).toHaveBeenCalled();
    // 不会抛出错误
  });
});