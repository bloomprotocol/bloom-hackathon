import { apiPost, apiGet } from '../apiConfig';
import { logger } from '@/lib/utils/logger';

// API 响应接口
export interface ApiResponse<T = unknown> {
  success: boolean;  // API业务逻辑是否成功的标志
  data?: T;
  error?: string;
  token?: string;
  [key: string]: unknown;
}

// Network type for wallet addresses
export type NetworkType = 'solana' | 'evm';

// 登入用戶信息
export interface LoginUserInfo {
  sub: string;
  walletAddress: string;
  role: string;
  name?: string;
  networkType?: NetworkType;
}

// 登入響應數據
export interface LoginResponseData {
  token: string;
  user: LoginUserInfo;
}

// 注册用户参数接口
interface RegisterUserParams {
  walletAddress: string;
  email?: string;
  referralCode?: string;
  turnstileToken?: string;
  networkType?: NetworkType;
}

// 钱包登录参数接口
interface WalletLoginParams {
  address: string;
  email?: string;
  signature?: string;
  message?: string;
  networkType?: NetworkType;
}

// Privy 登录参数接口
interface PrivyLoginParams {
  privyAccessToken?: string;
  walletAddress: string;
  email?: string;
  referralCode?: string;
}

// 获取用户信息参数接口
interface GetUserInfoParams {
  sub: string;
}

/**
 * 注册用户
 * @param params 包含钱包地址的参数对象
 * @returns Promise 包含 API 响应
 */
export const registerUser = async (
  params: RegisterUserParams
): Promise<ApiResponse> => {
  const { walletAddress, email, referralCode, turnstileToken, networkType } = params;
  const requestBody: { walletAddress: string; email?: string; referralCode?: string; turnstileToken?: string; networkType?: NetworkType } = { walletAddress };

  // 如果有 email，加入請求體
  if (email) {
    requestBody.email = email;
  }

  // 如果有 referralCode，加入請求體
  if (referralCode) {
    requestBody.referralCode = referralCode;
  }

  // 如果有 turnstileToken，加入請求體
  if (turnstileToken) {
    requestBody.turnstileToken = turnstileToken;
  }

  // 如果有 networkType，加入請求體
  if (networkType) {
    requestBody.networkType = networkType;
  }
  
  logger.debug('[AUTH SERVICE DEBUG] registerUser request', {
    url: '/users',
    body: requestBody,
    baseURL: process.env.NEXT_PUBLIC_API_URL
  });
  
  try {
    const response = await apiPost<ApiResponse>('/users', requestBody);
    logger.debug('[AUTH SERVICE DEBUG] registerUser response', { response });
    return response;
  } catch (error) {
    logger.error('[AUTH SERVICE DEBUG] registerUser error', { error });
    throw error;
  }
};

/**
 * 使用钱包地址登录
 * @param params 包含钱包地址的参数对象
 * @returns Promise 包含 API 响应
 */
export const loginWithWallet = async (
  params: WalletLoginParams
): Promise<ApiResponse<LoginResponseData>> => {
  const { address, email, signature, message, networkType } = params;
  const requestBody: WalletLoginParams = { address };

  // 如果有 email，加入請求體
  if (email) {
    requestBody.email = email;
  }

  // 如果有簽名，加入請求體
  if (signature) {
    requestBody.signature = signature;
  }

  // 如果有消息，加入請求體
  if (message) {
    requestBody.message = message;
  }

  // 如果有 networkType，加入請求體
  if (networkType) {
    requestBody.networkType = networkType;
  }

  return apiPost<ApiResponse<LoginResponseData>>('/auth/user/wallet/login', requestBody);
};

/**
 * @deprecated Privy auth replaced by Thirdweb Connect. Backend endpoint still exists for legacy.
 * 使用 Privy 登录（Email/Google）
 * @param params 包含 Privy access token 和钱包地址的参数对象
 * @returns Promise 包含 API 响应
 */
export const loginWithPrivy = async (
  params: PrivyLoginParams
): Promise<ApiResponse<LoginResponseData>> => {
  const { privyAccessToken, walletAddress, email, referralCode } = params;
  const requestBody: PrivyLoginParams = { privyAccessToken, walletAddress };

  if (email) {
    requestBody.email = email;
  }

  if (referralCode) {
    requestBody.referralCode = referralCode;
  }

  logger.debug('[AUTH SERVICE DEBUG] loginWithPrivy request', {
    url: '/auth/user/privy/login',
    hasToken: !!privyAccessToken,
    walletAddress,
    hasEmail: !!email,
  });

  try {
    const response = await apiPost<ApiResponse<LoginResponseData>>('/auth/user/privy/login', requestBody);
    logger.debug('[AUTH SERVICE DEBUG] loginWithPrivy response', { success: response.success });
    return response;
  } catch (error) {
    logger.error('[AUTH SERVICE DEBUG] loginWithPrivy error', { error });
    throw error;
  }
};

/**
 * 获取用户信息
 * @param params 包含用户subject的参数对象
 * @returns Promise 包含 API 响应
 */
export const getUserInfo = async (
  params: GetUserInfoParams
): Promise<ApiResponse> => {
  const { sub } = params;
  return apiGet<ApiResponse>(`/users/${sub}`);
};

/**
 * 切换用户角色（在 USER 和 BUILDER 之间切换）
 * 如果当前是 USER → 切换到 BUILDER
 * 如果当前是 BUILDER → 切换到 USER
 * @returns Promise 包含更新后的用户信息
 */
export const switchToBuilder = async (): Promise<ApiResponse> => {
  return apiPost<ApiResponse>('/users/switch-to-builder');
};

/**
 * 刷新 JWT Token
 * 使用現有有效的 token 獲取新的 token
 * @returns Promise 包含新的 token
 */
export const refreshToken = async (): Promise<ApiResponse<{ token: string }>> => {
  return apiPost<ApiResponse<{ token: string }>>('/auth/refresh', {});
};

/**
 * 用戶登出
 * 通知後端記錄登出時間，使舊 token 無法刷新
 * @returns Promise 包含登出結果
 */
export const logout = async (): Promise<ApiResponse<{ message: string }>> => {
  return apiPost<ApiResponse<{ message: string }>>('/auth/logout', {});
};

// 导出所有API函数
const auth = {
  registerUser,
  loginWithWallet,
  loginWithPrivy,
  getUserInfo,
  switchToBuilder,
  refreshToken,
  logout,
};

export default auth; 