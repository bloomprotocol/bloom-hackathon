/**
 * MSW handlers for authentication API endpoints
 * P0 认证流程的 API mock
 */

import { http, HttpResponse } from 'msw';
import { mockAuthResponses, mockWalletAddresses } from '../data/auth.mock';

const API_BASE_URL = 'http://localhost:3005';

export const authHandlers = [
  // POST /auth/login - 用户登录
  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as { wallet_address: string };
    
    // 模拟已存在用户登录
    if (body.wallet_address === mockWalletAddresses.user1) {
      return HttpResponse.json(mockAuthResponses.loginSuccess);
    }
    
    // 其他地址返回未授权
    return HttpResponse.json(mockAuthResponses.unauthorized, { status: 401 });
  }),

  // POST /auth/register - 用户注册
  http.post(`${API_BASE_URL}/auth/register`, async ({ request }) => {
    const body = await request.json() as { 
      wallet_address: string;
    };
    
    // 模拟新用户注册
    if (body.wallet_address === mockWalletAddresses.user2) {
      return HttpResponse.json(mockAuthResponses.registerSuccess);
    }
    
    // 已存在的用户不能重复注册
    return HttpResponse.json({
      success: false,
      statusCode: 400,
      message: 'User already exists',
    }, { status: 400 });
  }),

  // POST /auth/refresh - JWT 刷新
  http.post(`${API_BASE_URL}/auth/refresh`, async ({ request }) => {
    const body = await request.json() as { refresh_token: string };
    
    if (body.refresh_token) {
      return HttpResponse.json(mockAuthResponses.refreshSuccess);
    }
    
    return HttpResponse.json(mockAuthResponses.unauthorized, { status: 401 });
  }),

  // GET /auth/profile - 获取用户信息（验证登录状态）
  http.get(`${API_BASE_URL}/auth/profile`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (authHeader && authHeader.includes('Bearer')) {
      return HttpResponse.json(mockAuthResponses.userProfileSuccess);
    }
    
    return HttpResponse.json(mockAuthResponses.unauthorized, { status: 401 });
  }),

  // POST /auth/logout - 用户登出
  http.post(`${API_BASE_URL}/auth/logout`, () => {
    // 登出总是成功
    return HttpResponse.json({
      success: true,
      statusCode: 200,
      message: 'Logged out successfully',
    });
  }),
];