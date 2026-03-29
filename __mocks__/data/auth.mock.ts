/**
 * Auth Mock Data - P0 认证流程测试数据
 * 包含：JWT tokens, wallet addresses, 认证响应
 */

export const mockTokens = {
  validToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEwMDEsIndhbGxldF9hZGRyZXNzIjoiMHgxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDA4NjQwMH0.mock_signature',
  expiredToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEwMDEsIndhbGxldF9hZGRyZXNzIjoiMHgxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDA4NjQwMH0.expired_signature',
  refreshToken: 'refresh_token_mock_123456',
  newAccessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEwMDEsIndhbGxldF9hZGRyZXNzIjoiMHgxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3MDAwMDQwMDAsImV4cCI6MTcwMDA5MDQwMH0.new_mock_signature',
};

export const mockWalletAddresses = {
  user1: '0x1234567890123456789012345678901234567890',
  user2: '0x0987654321098765432109876543210987654321',
  builder: '0xabcdef1234567890abcdef1234567890abcdef12',
  admin: '0xadmin1234567890123456789012345678901234',
};

export const mockAuthResponses = {
  // 成功的登录响应
  loginSuccess: {
    success: true,
    statusCode: 200,
    data: {
      user: {
        uid: 1001,
        wallet_address: mockWalletAddresses.user1,
        email: null,
        username: 'test_user',
        role: 'USER',
        points: 1000,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      access_token: mockTokens.validToken,
      refresh_token: mockTokens.refreshToken,
    },
  },

  // 新用户注册响应
  registerSuccess: {
    success: true,
    statusCode: 201,
    data: {
      user: {
        uid: 1002,
        wallet_address: mockWalletAddresses.user2,
        email: null,
        username: null,
        role: 'USER',
        points: 0,
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
      },
    },
  },

  // JWT 刷新响应
  refreshSuccess: {
    success: true,
    statusCode: 200,
    data: {
      access_token: mockTokens.newAccessToken,
      refresh_token: mockTokens.refreshToken,
    },
  },

  // 认证失败响应
  unauthorized: {
    success: false,
    statusCode: 401,
    data: null,
    message: 'Unauthorized',
  },

  // 用户信息响应（用于验证登录状态）
  userProfileSuccess: {
    success: true,
    statusCode: 200,
    data: {
      uid: 1001,
      wallet_address: mockWalletAddresses.user1,
      email: null,
      username: 'test_user',
      role: 'USER',
      points: 1000,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  },
};

// 认证场景
export const authScenarios = {
  // 场景1：新用户注册
  newUserRegistration: {
    walletAddress: mockWalletAddresses.user2,
    expectedFlow: ['register', 'login'],
  },

  // 场景2：已存在用户直接登录
  existingUserLogin: {
    walletAddress: mockWalletAddresses.user1,
    expectedFlow: ['login'],
  },

  // 场景3：JWT 过期需要刷新
  tokenRefresh: {
    expiredToken: mockTokens.expiredToken,
    refreshToken: mockTokens.refreshToken,
    expectedNewToken: mockTokens.newAccessToken,
  },

  // 场景4：登出
  logout: {
    expectedClearedCookies: ['access_token', 'refresh_token'],
    expectedRedirect: '/',
  },
};

// Cookie 模拟数据
export const mockCookies = {
  withValidToken: {
    access_token: mockTokens.validToken,
    refresh_token: mockTokens.refreshToken,
  },
  withExpiredToken: {
    access_token: mockTokens.expiredToken,
    refresh_token: mockTokens.refreshToken,
  },
  empty: {},
};