/**
 * 中间件工具测试 - P0 认证相关功能
 * 
 * 业务规则：
 * 1. 正确检测钱包浏览器（移动端认证）
 * 2. 正确设置 cookie 配置
 */

import { detectWalletBrowser, isPrefetchRequest, getWalletBrowserCookieConfig } from './middleware-utils';

describe('中间件工具 - 钱包浏览器检测', () => {
  describe('detectWalletBrowser', () => {
    test('应该检测到 Phantom 钱包浏览器', () => {
      const phantomUserAgents = [
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Phantom/ios',
        'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36 Phantom',
      ];

      phantomUserAgents.forEach(ua => {
        expect(detectWalletBrowser(ua)).toBe(true);
      });
    });

    test('应该检测到 OKX 钱包浏览器', () => {
      const okxUserAgents = [
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 brokerdomain/www.okx.com',
        'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36 okapp',
      ];

      okxUserAgents.forEach(ua => {
        expect(detectWalletBrowser(ua)).toBe(true);
      });
    });

    test('应该检测到 Solflare 钱包浏览器', () => {
      const solflareUserAgents = [
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 solflare-mobile',
        'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36 Solflare',
      ];

      solflareUserAgents.forEach(ua => {
        expect(detectWalletBrowser(ua)).toBe(true);
      });
    });

    test('普通浏览器不应该被检测为钱包浏览器', () => {
      const normalUserAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
      ];

      normalUserAgents.forEach(ua => {
        expect(detectWalletBrowser(ua)).toBe(false);
      });
    });

    test('大小写不敏感检测', () => {
      expect(detectWalletBrowser('PHANTOM/IOS')).toBe(true);
      expect(detectWalletBrowser('OKAPP')).toBe(true);
      expect(detectWalletBrowser('SOLFLARE-MOBILE')).toBe(true);
    });
  });

  describe('isPrefetchRequest', () => {
    test('应该检测到 prefetch 请求', () => {
      const headers1 = new Headers({ 'purpose': 'prefetch' });
      expect(isPrefetchRequest(headers1)).toBe(true);

      const headers2 = new Headers({ 'x-middleware-prefetch': '1' });
      expect(isPrefetchRequest(headers2)).toBe(true);
    });

    test('普通请求不应该被识别为 prefetch', () => {
      const headers = new Headers({ 'content-type': 'application/json' });
      expect(isPrefetchRequest(headers)).toBe(false);
    });
  });

  describe('getWalletBrowserCookieConfig', () => {
    test('生产环境应该设置 secure cookie', () => {
      const config = getWalletBrowserCookieConfig(true);
      expect(config).toMatchObject({
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        httpOnly: false,
        secure: true,
        sameSite: 'lax',
      });
    });

    test('开发环境不应该设置 secure cookie', () => {
      const config = getWalletBrowserCookieConfig(false);
      expect(config).toMatchObject({
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
      });
    });

    test('cookie 必须允许客户端读取', () => {
      // 业务规则：钱包浏览器标识需要在客户端读取
      const config = getWalletBrowserCookieConfig(true);
      expect(config.httpOnly).toBe(false);
    });
  });
});