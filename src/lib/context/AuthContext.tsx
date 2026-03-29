'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { setCookie, getCookie, deleteCookie, COOKIE_KEYS } from '@/lib/utils/storage';
import auth, { type LoginResponseData } from '@/lib/api/services/authService';
import { useAuthFingerprint } from '@/hooks/auth/useAuthFingerprint';
import { useTokenRefresh } from '@/hooks/auth/useTokenRefresh';
import { UserRole, LoginResponse, type AuthMethod, type NetworkType } from '@/lib/types/auth';
import { useThirdwebAuth } from '@/hooks/auth-providers/useThirdwebAuth';
import { usePhantomApp } from '@/hooks/auth-providers/usePhantomApp';
import { useOKXApp } from '@/hooks/auth-providers/useOKXApp';
import { useMetaMaskApp } from '@/hooks/auth-providers/useMetaMaskApp';
import { useWalletConnectApp } from '@/hooks/auth-providers/useWalletConnectApp';
import { useDesktopWalletConnect } from '@/hooks/useDesktopWalletConnect';
import type { DetectedWallet } from '@/hooks/useWalletDetection';
import { getPlatform } from '@/lib/utils/platform';
import { logger } from '@/lib/utils/logger';

// 認證提供者類型 - 為未來替換做準備
export enum AuthProvider {
  THIRDWEB = 'thirdweb',
  WALLET_CONNECT = 'wallet_connect',
}

// 用戶結果數據類型
interface UserResultData {
  uid: string;
  [key: string]: unknown;
}

// 認證上下文類型
export interface AuthContextType {
  // 狀態
  isAuthenticated: boolean;
  isLoading: boolean;
  authProvider: AuthProvider;
  user: {
    uid: string;
    walletAddress: string;
    roles: UserRole[];
    email?: string | null;
  } | null;

  // 方法
  connectWithWallet: (walletName: string, network?: NetworkType, evmProvider?: any, solanaProvider?: any, walletId?: string) => Promise<void>;  // 直接連接指定錢包
  connectWithEmail: () => void;  // 觸發 Thirdweb 登入，後端登入由 ThirdwebAuthHandler 處理
  loginWithWallet: (walletAddress: string, email?: string, signature?: string, message?: string, networkType?: NetworkType) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  
  // 工具方法
  getToken: () => string | null;
  getUserId: () => string | null;
  hasRole: (role: string | string[]) => boolean;
  getWalletAddress: () => string | null;

  // Mobile wallet methods
  triggerMobileSign: (walletType: 'phantom' | 'okx' | 'metamask' | 'walletconnect') => void;

  // Hook states for AuthModal
  phantomHookState: {
    publicKey: string | null;
    lastSignature: string | null;
    lastMessage: string | null;
    isConnecting: boolean;
    isSigning: boolean;
    error: string | null;
  };
  okxHookState: {
    isReady: boolean;
    publicKey: string | null;
    connectedNetwork: NetworkType | null;
    lastSignature: string | null;
    lastMessage: string | null;
    isConnecting: boolean;
    isSigning: boolean;
    error: string | null;
  };
  metamaskHookState: {
    isReady: boolean;
    publicKey: string | null;
    lastSignature: string | null;
    lastMessage: string | null;
    isConnecting: boolean;
    isSigning: boolean;
    error: string | null;
  };
  walletConnectHookState: {
    isReady: boolean;
    publicKey: string | null;
    selectedNetwork: NetworkType | null;
    lastSignature: string | null;
    lastMessage: string | null;
    isConnecting: boolean;
    isSigning: boolean;
    error: string | null;
  };
}

// 創建上下文
const AuthContext = createContext<AuthContextType | null>(null);

// 認證提供者組件
export function AuthContextProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Auth providers
  const thirdwebAuth = useThirdwebAuth();
  const phantomApp = usePhantomApp();
  const okxApp = useOKXApp();
  const metamaskApp = useMetaMaskApp();
  const walletConnectApp = useWalletConnectApp();

  // Desktop wallet connection hook
  const desktopWalletConnect = useDesktopWalletConnect();

  // 指紋採集 hook
  const fingerprint = useAuthFingerprint();

  // 認證狀態 - 完全基於 auth-token
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authProvider] = useState<AuthProvider>(AuthProvider.THIRDWEB);
  const [userData, setUserData] = useState<{
    uid: string;
    walletAddress: string;
    roles: UserRole[];
    email?: string | null;
  } | null>(null);

  // 跟踪是否正在進行後端認證，避免重複觸發
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Token 簽發時間（用於 useTokenRefresh）
  const [tokenIssuedAt, setTokenIssuedAt] = useState<Date | null>(null);

  // isUserInitiated 用於登出流程
  const isUserInitiated = useRef(false);
  
  
  // 初始化時檢查認證狀態 - 只基於 auth-token + uid
  // Note: walletAddress 對於 X-only Builder 用戶可以是空字符串
  useEffect(() => {
      const token = getCookie(COOKIE_KEYS.AUTH_TOKEN);
      const uid = getCookie(COOKIE_KEYS.SUB);
      const walletAddress = getCookie(COOKIE_KEYS.WALLET_ADDRESS);
      const tia = getCookie(COOKIE_KEYS.TIA);

      // 採集未登入用户基本信息
      fingerprint.collectOnInit();

      // 認證只需要 token + uid，walletAddress 對於 X-only 用戶可以為空
      if (token && uid) {
        setIsAuthenticated(true);
        // Parse role from cookie (now a single string)
        let roles: string[] = [];
        const roleValue = getCookie(COOKIE_KEYS.ROLE);
        if (roleValue) {
          // Role is now a single string, convert to array for compatibility
          roles = [String(roleValue)];
        }

        setUserData({
          uid: String(uid),
          walletAddress: String(walletAddress || ''), // 允許空字符串
          roles: roles as UserRole[],
          email: null
        });
        
        // 设置 token 签发时间
        if (tia && typeof tia === 'string') {
          setTokenIssuedAt(new Date(tia));
        }
        
      } else {
        setIsAuthenticated(false);
        setUserData(null);
      }
      
      setIsLoading(false);
  }, []);

  // 錢包登入方法 - 手動調用的後端認證流程
  const loginWithWallet = useCallback(async (walletAddress: string, email?: string, signature?: string, message?: string, networkType?: NetworkType): Promise<boolean> => {
    try {
      // Auto-detect network type if not provided
      const detectedNetworkType: NetworkType = networkType || (walletAddress.startsWith('0x') && walletAddress.length === 42 ? 'evm' : 'solana');

      // 步驟1: 註冊/檢查用戶
      const registerParams: { walletAddress: string; email?: string; referralCode?: string; networkType?: NetworkType } = { walletAddress, networkType: detectedNetworkType };
      if (email) {
        registerParams.email = email;
      }

      // 從 cookie 中獲取 referral code
      const referralCode = getCookie(COOKIE_KEYS.REFERRAL_CODE)?.toString();
      if (referralCode) {
        registerParams.referralCode = referralCode;
      }

      const userResult = await auth.registerUser(registerParams);

      if (!userResult.success) {
        throw new Error(userResult.error || 'User registration failed');
      }

      const uid = (userResult.data as UserResultData).uid;

      // 步驟2: 獲取JWT (帶簽名驗證)
      const loginParams: { address: string; email?: string; signature?: string; message?: string; networkType?: NetworkType } = { address: walletAddress, networkType: detectedNetworkType };
      if (email) {
        loginParams.email = email;
      }
      if (signature) {
        loginParams.signature = signature;
      }
      if (message) {
        loginParams.message = message;
      }
      const loginResult = await auth.loginWithWallet(loginParams);

      if (!loginResult.success) {
        throw new Error(loginResult.error || 'Wallet login failed');
      }
      
      // 處理新的響應格式 - backend 使用 responseSuccess 包裝，實際數據在 data.data 中
      const responseData = loginResult.data;
      const loginData: LoginResponseData | undefined =
        (responseData && 'data' in responseData)
          ? (responseData as { data: LoginResponseData }).data
          : responseData;
      const token = loginData?.token;
      const userInfo = loginData?.user;

      if (!token || !userInfo) {
        throw new Error('Invalid login response: missing token or user info');
      }
      
      // 保存認證信息到 Cookie（包含角色）
      // 使用 setCookie 函数确保一致性
      setCookie(COOKIE_KEYS.WALLET_ADDRESS, userInfo.walletAddress);
      setCookie(COOKIE_KEYS.SUB, String(userInfo.sub));  // Now using sub from JWT
      setCookie(COOKIE_KEYS.AUTH_TOKEN, token);
      setCookie(COOKIE_KEYS.ROLE, userInfo.role);  // Store as string, not array
      setCookie(COOKIE_KEYS.TIA, new Date().toISOString());
      
      
      // 更新認證狀態
      setIsAuthenticated(true);
      setUserData({
        uid: String(userInfo.sub),  // sub is the user ID
        walletAddress: userInfo.walletAddress,
        roles: [userInfo.role as UserRole],
        email: null  // email no longer in JWT
      });
      setTokenIssuedAt(new Date());

      // 登入成功後的指紋採集
      fingerprint.collectOnLogin(walletAddress);

      // 強制刷新所有查詢，確保 profile 頁面數據正確加載
      queryClient.invalidateQueries();
      
      // 登入成功後自動跳轉到 profile 頁面
      // 使用多重檢查機制確保跳轉
      let redirectAttempts = 0;
      const maxAttempts = 3;
      
      const attemptRedirect = async () => {
        redirectAttempts++;
        
        // 驗證 cookies 已設置 - 直接檢查 document.cookie
        const allCookies = document.cookie;
        const hasAuthToken = allCookies.includes(`${COOKIE_KEYS.AUTH_TOKEN}=`);
        const hasWallet = allCookies.includes(`${COOKIE_KEYS.WALLET_ADDRESS}=`);
        const currentAuthState = hasAuthToken && hasWallet;
        
        
        if (currentAuthState) {
          // 確保查詢緩存已更新
          await queryClient.invalidateQueries();
          
          // Check if there's a redirect destination stored
          const redirectPath = sessionStorage.getItem('redirectAfterAuth');
          if (redirectPath) {
            sessionStorage.removeItem('redirectAfterAuth');
            router.replace(redirectPath);
          } else {
          }
          return true;
        } else if (redirectAttempts < maxAttempts) {
          setTimeout(attemptRedirect, 500);
        } else {
        }
        return false;
      };
      
      // 首次嘗試延遲較長，確保狀態更新
      setTimeout(attemptRedirect, 200);
      
      return true;
    } catch (error) {
      logger.error('[loginWithWallet] Login failed', { error });
      throw error;
    }
  }, [router, queryClient]);

  // NOTE: Removed auto-trigger signMessage for mobile wallets
  // Mobile wallets use deep links which cause page reload, and iOS blocks
  // consecutive Universal Link navigations. AuthModal now handles this manually.
  // Desktop wallets still auto-sign via connectWithWallet flow.

  // Check if Phantom hook has signature - trigger login (Solana)
  useEffect(() => {
    if (phantomApp.publicKey && phantomApp.lastSignature && phantomApp.lastMessage && !isAuthenticated && !isAuthenticating) {
      setIsAuthenticating(true);
      loginWithWallet(phantomApp.publicKey, undefined, phantomApp.lastSignature, phantomApp.lastMessage, 'solana').finally(() => {
        setIsAuthenticating(false);
      });
    }
  }, [phantomApp.publicKey, phantomApp.lastSignature, phantomApp.lastMessage, isAuthenticated, isAuthenticating, loginWithWallet]);

  // NOTE: Removed auto-trigger signMessage for OKX mobile wallet (same reason as Phantom above)

  // Check if OKX hook has signature - trigger login (supports both Solana and EVM)
  useEffect(() => {
    if (okxApp.publicKey && okxApp.lastSignature && okxApp.lastMessage && !isAuthenticated && !isAuthenticating) {
      setIsAuthenticating(true);
      // Use connectedNetwork from hook, or detect from address format as fallback
      const networkType = okxApp.connectedNetwork || (okxApp.publicKey.startsWith('0x') ? 'evm' : 'solana');
      loginWithWallet(okxApp.publicKey, undefined, okxApp.lastSignature, okxApp.lastMessage, networkType).finally(() => {
        setIsAuthenticating(false);
      });
    }
  }, [okxApp.publicKey, okxApp.lastSignature, okxApp.lastMessage, okxApp.connectedNetwork, isAuthenticated, isAuthenticating, loginWithWallet]);

  // Check if MetaMask hook has signature - trigger login (EVM)
  useEffect(() => {
    if (metamaskApp.publicKey && metamaskApp.lastSignature && metamaskApp.lastMessage && !isAuthenticated && !isAuthenticating) {
      setIsAuthenticating(true);
      loginWithWallet(metamaskApp.publicKey, undefined, metamaskApp.lastSignature, metamaskApp.lastMessage, 'evm').finally(() => {
        setIsAuthenticating(false);
      });
    }
  }, [metamaskApp.publicKey, metamaskApp.lastSignature, metamaskApp.lastMessage, isAuthenticated, isAuthenticating, loginWithWallet]);

  // Check if WalletConnect hook has signature - trigger login
  useEffect(() => {
    if (walletConnectApp.publicKey && walletConnectApp.lastSignature && walletConnectApp.lastMessage && !isAuthenticated && !isAuthenticating) {
      setIsAuthenticating(true);
      const networkType = walletConnectApp.selectedNetwork === 'solana' ? 'solana' : 'evm';
      loginWithWallet(walletConnectApp.publicKey, undefined, walletConnectApp.lastSignature, walletConnectApp.lastMessage, networkType).finally(() => {
        setIsAuthenticating(false);
      });
    }
  }, [walletConnectApp.publicKey, walletConnectApp.lastSignature, walletConnectApp.lastMessage, walletConnectApp.selectedNetwork, isAuthenticated, isAuthenticating, loginWithWallet]);


  // 使用指定錢包連接
  // network 參數用於多網絡錢包（如 OKX, MetaMask 等），指定使用 Solana 還是 EVM
  // evmProvider 和 solanaProvider 參數為可選，如果傳入則直接使用
  const connectWithWallet = useCallback(async (
    walletName: string,
    network?: NetworkType,
    evmProvider?: any,
    solanaProvider?: any,
    walletId?: string
  ) => {
    if (isAuthenticated) {
      // Check if there's a redirect destination stored
      const redirectPath = sessionStorage.getItem('redirectAfterAuth');
      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterAuth');
        router.push(redirectPath);
      }
      return;
    }

    try {
      const platform = getPlatform();

      // Determine which network to use
      // For Phantom, Backpack, Solflare: always Solana
      // For other wallets: use the network parameter or default based on wallet type
      const solanaOnlyWallets = ['Phantom', 'Backpack', 'Solflare'];
      const effectiveNetwork: NetworkType = solanaOnlyWallets.includes(walletName)
        ? 'solana'
        : network || 'evm'; // Default to EVM if not specified for multi-network wallets

      // Handle mobile wallets
      if (platform.isMobile) {
        // Store selected network for mobile flow
        if (network) {
          sessionStorage.setItem('selected_network', network);
        }

        switch (walletName) {
          case 'Phantom':
            // Check if we're returning from Phantom with auth data
            if (phantomApp.publicKey && phantomApp.lastSignature && phantomApp.lastMessage) {
              await loginWithWallet(phantomApp.publicKey, undefined, phantomApp.lastSignature, phantomApp.lastMessage, 'solana');
            } else {
              sessionStorage.setItem('mobile_wallet_connecting', 'phantom');
              phantomApp.connect();
            }
            return;

          case 'OKX Wallet':
            if (effectiveNetwork === 'solana') {
              // OKX Solana flow
              if (okxApp.publicKey && okxApp.lastSignature && okxApp.lastMessage) {
                await loginWithWallet(okxApp.publicKey, undefined, okxApp.lastSignature, okxApp.lastMessage, 'solana');
              } else {
                sessionStorage.setItem('mobile_wallet_connecting', 'okx');
                await okxApp.connect('solana');
              }
            } else {
              // OKX EVM flow - use OKX Universal Provider
              if (okxApp.publicKey && okxApp.lastSignature && okxApp.lastMessage && okxApp.connectedNetwork === 'evm') {
                await loginWithWallet(okxApp.publicKey, undefined, okxApp.lastSignature, okxApp.lastMessage, 'evm');
              } else {
                sessionStorage.setItem('mobile_wallet_connecting', 'okx');
                await okxApp.connect('evm');
              }
            }
            break;

          case 'MetaMask':
            if (effectiveNetwork === 'solana') {
              // MetaMask Solana not supported on mobile
              throw new Error(`${walletName} Solana mobile support coming soon`);
            } else {
              // EVM flow
              if (metamaskApp.publicKey && metamaskApp.lastSignature && metamaskApp.lastMessage) {
                await loginWithWallet(metamaskApp.publicKey, undefined, metamaskApp.lastSignature, metamaskApp.lastMessage, 'evm');
              } else {
                sessionStorage.setItem('mobile_wallet_connecting', 'metamask');
                await metamaskApp.connect();
              }
            }
            break;

          case 'WalletConnect':
            // WalletConnect flow - supports both EVM and Solana
            // Note: WalletConnect uses AppKit modal and auto-sign, no need for mobile_wallet_connecting
            // If walletId is provided, directly connect to that wallet without showing modal
            if (walletConnectApp.publicKey && walletConnectApp.lastSignature && walletConnectApp.lastMessage) {
              const wcNetworkType = walletConnectApp.selectedNetwork === 'solana' ? 'solana' : 'evm';
              await loginWithWallet(walletConnectApp.publicKey, undefined, walletConnectApp.lastSignature, walletConnectApp.lastMessage, wcNetworkType);
            } else {
              await walletConnectApp.connect(effectiveNetwork, walletId);
            }
            break;

          default:
            throw new Error(`Mobile wallet ${walletName} not supported`);
        }

      } else {
        // Desktop wallet flow - use useDesktopWalletConnect hook
        // Create a DetectedWallet-like object from the parameters
        const wallet: DetectedWallet = {
          name: walletName,
          supportedNetworks: effectiveNetwork === 'evm' ? 'evm' : 'solana',
          evmProvider: evmProvider,
          solanaProvider: solanaProvider,
        };

        const result = await desktopWalletConnect.connectDesktopWallet(wallet, effectiveNetwork);
        await loginWithWallet(result.address, undefined, result.signature, result.message, result.networkType);
      }

    } catch (error: any) {
      // Check if user cancelled
      if (desktopWalletConnect.isUserCancellation(error)) {
        throw new Error('User cancelled authentication');
      }

      throw error;
    }
  }, [isAuthenticated, router, loginWithWallet, metamaskApp, phantomApp, okxApp, walletConnectApp, desktopWalletConnect]);
  
  /**
   * 使用 Email/Social 登入
   *
   * 觸發 Thirdweb 登入彈窗，實際的後端登入由 ThirdwebAuthHandler 統一處理
   */
  const connectWithEmail = useCallback(() => {
    if (isAuthenticated) {
      // Check if there's a redirect destination stored
      const redirectPath = sessionStorage.getItem('redirectAfterAuth');
      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterAuth');
        router.push(redirectPath);
      }
      return;
    }

    if (!thirdwebAuth.isReady) {
      logger.error('[Auth] Thirdweb is not ready');
      return;
    }

    // 觸發 Thirdweb 登入，後續由 ThirdwebAuthHandler 處理
    thirdwebAuth.triggerLogin();
  }, [isAuthenticated, router, thirdwebAuth]);

  // 登出方法
  const logout = useCallback(async () => {
    // Reset flag
    isUserInitiated.current = false;

    // Step 0: 通知後端用戶已登出（設置 last_logout_at 到 MongoDB）
    // 這樣舊的 token 無法用於刷新
    try {
      await auth.logout();
    } catch (error) {
      // 即使 API 失敗，也繼續清除本地狀態
      logger.warn('[Auth] Logout API failed', { error: error instanceof Error ? error.message : String(error) });
    }

    // Step 1: Clear all authentication cookies
    deleteCookie(COOKIE_KEYS.AUTH_TOKEN);
    deleteCookie(COOKIE_KEYS.WALLET_ADDRESS);
    deleteCookie(COOKIE_KEYS.SUB);
    deleteCookie(COOKIE_KEYS.ROLE);
    deleteCookie(COOKIE_KEYS.USER_ROLES_LEGACY); // Legacy - 待移除
    deleteCookie(COOKIE_KEYS.TIA);
    deleteCookie(COOKIE_KEYS.PENDING_BOOKMARK);
    deleteCookie(COOKIE_KEYS.PENDING_REVIEW);
    
    // Step 2: Reset local auth state
    setIsAuthenticated(false);
    setUserData(null);
    setIsAuthenticating(false);
    setTokenIssuedAt(null);
    
    // Step 3: Clear React Query cache
    queryClient.clear();

    // Step 4: Reset fingerprint session
    fingerprint.resetOnLogout();

    // Step 5: Cleanup auth provider sessions
    // Each hook handles its own cleanup/disconnect logic
    if (thirdwebAuth.cleanup) {
      await thirdwebAuth.cleanup();
    }
    
    if (phantomApp.cleanup) {
      // Don't await - Phantom will redirect
      phantomApp.cleanup();
    }
    
    if (okxApp.cleanup) {
      await okxApp.cleanup();
    }

    // Cleanup MetaMask session
    if (metamaskApp.cleanup) {
      await metamaskApp.cleanup();
    }

    // Cleanup WalletConnect session
    if (walletConnectApp.cleanup) {
      await walletConnectApp.cleanup();
    }
  }, [queryClient, thirdwebAuth, phantomApp, okxApp, metamaskApp, walletConnectApp, userData, fingerprint]);

  // Token 刷新 hook（處理自動刷新、用戶活動刷新、401 錯誤處理）
  const { refreshToken, isRefreshing } = useTokenRefresh({
    userId: userData?.uid || null,
    isAuthenticated,
    tokenIssuedAt,
    onLogout: logout,
  });

  // Removed fallback redirect mechanism - users should only be redirected
  // when explicitly intended (e.g., clicking Dashboard while unauthenticated)
  
  // 工具方法
  const getToken = useCallback(() => {
    return getCookie(COOKIE_KEYS.AUTH_TOKEN)?.toString() || null;
  }, []);
  
  const getUserId = useCallback(() => {
    return userData?.uid || null;
  }, [userData]);
  
  const hasRole = useCallback((role: string | string[]) => {
    
    if (!userData?.roles) return false;
    
    if (Array.isArray(role)) {
      const result = role.some(r => userData.roles.includes(r as UserRole));
      return result;
    }
    const result = userData.roles.includes(role as UserRole);
    return result;
  }, [userData]);
  
  // 獲取當前錢包地址（從認證狀態）
  const getWalletAddress = useCallback(() => {
    return userData?.walletAddress || null;
  }, [userData]);

  // Trigger signMessage for mobile wallets (called from AuthModal)
  const triggerMobileSign = useCallback((walletType: 'phantom' | 'okx' | 'metamask' | 'walletconnect') => {
    if (walletType === 'phantom') {
      phantomApp.signMessage('');
    } else if (walletType === 'okx') {
      okxApp.signMessage('');
    } else if (walletType === 'metamask') {
      metamaskApp.signMessage();
    } else if (walletType === 'walletconnect') {
      walletConnectApp.signMessage();
    }
  }, [phantomApp, okxApp, metamaskApp, walletConnectApp]);

  // 提供者值
  const contextValue: AuthContextType = {
    isAuthenticated,
    isLoading: isLoading || isAuthenticating, // 認證過程中也顯示加載狀態
    authProvider,
    user: userData,

    connectWithWallet,
    connectWithEmail,
    loginWithWallet,
    logout,
    refreshToken,

    getToken,
    getUserId,
    hasRole,
    getWalletAddress,

    // Mobile wallet methods
    triggerMobileSign,

    // Hook states for AuthModal
    phantomHookState: {
      publicKey: phantomApp.publicKey,
      lastSignature: phantomApp.lastSignature,
      lastMessage: phantomApp.lastMessage,
      isConnecting: phantomApp.isConnecting,
      isSigning: phantomApp.isSigning,
      error: phantomApp.error
    },
    okxHookState: {
      isReady: okxApp.isReady,
      publicKey: okxApp.publicKey,
      connectedNetwork: okxApp.connectedNetwork,
      lastSignature: okxApp.lastSignature,
      lastMessage: okxApp.lastMessage,
      isConnecting: okxApp.isConnecting,
      isSigning: okxApp.isSigning,
      error: okxApp.error
    },
    metamaskHookState: {
      isReady: metamaskApp.isReady,
      publicKey: metamaskApp.publicKey,
      lastSignature: metamaskApp.lastSignature,
      lastMessage: metamaskApp.lastMessage,
      isConnecting: metamaskApp.isConnecting,
      isSigning: metamaskApp.isSigning,
      error: metamaskApp.error
    },
    walletConnectHookState: {
      isReady: walletConnectApp.isReady,
      publicKey: walletConnectApp.publicKey,
      selectedNetwork: walletConnectApp.selectedNetwork,
      lastSignature: walletConnectApp.lastSignature,
      lastMessage: walletConnectApp.lastMessage,
      isConnecting: walletConnectApp.isConnecting,
      isSigning: walletConnectApp.isSigning,
      error: walletConnectApp.error
    }
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// useAuth Hook
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
} 