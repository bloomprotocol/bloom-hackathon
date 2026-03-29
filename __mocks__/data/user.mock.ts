/**
 * User Mock Data - 用户数据
 * 包含不同角色的用户：supporter, builder, admin
 */

export const mockUsers = {
  // 普通用户 (Supporter)
  supporter: {
    uid: 1001,
    wallet_address: '0x1234567890123456789012345678901234567890',
    email: null,
    username: 'test_supporter',
    role: 'USER' as const,
    points: 1000,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },

  // Builder 用户
  builder: {
    uid: 2001,
    wallet_address: '0x0987654321098765432109876543210987654321',
    email: 'builder@test.com',
    username: 'test_builder',
    role: 'BUILDER' as const,
    points: 5000,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },

  // 管理员
  admin: {
    uid: 9001,
    wallet_address: '0xadmin1234567890123456789012345678901234',
    email: 'admin@test.com',
    username: 'test_admin',
    role: 'ADMIN' as const,
    points: 99999,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },

  // 新注册用户（没有 username）
  newUser: {
    uid: 1002,
    wallet_address: '0xnew1234567890123456789012345678901234567',
    email: null,
    username: null,
    role: 'USER' as const,
    points: 0,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
};