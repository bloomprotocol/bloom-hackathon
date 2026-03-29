/**
 * 钱包连接流程测试 - P0 认证核心业务逻辑
 * 
 * 业务规则：
 * 1. 必须按照正确的顺序执行：showInitiating → connectWallet → handleClose
 * 2. connectWallet 必须在 showInitiating 后 100ms 执行
 * 3. handleClose 必须紧跟 connectWallet 执行
 */

import { 
  createWalletConnectionFlow, 
  isValidConnectionSequence, 
  isValidConnectionTiming 
} from './walletConnectionFlow';

describe('钱包连接流程 - 核心业务逻辑', () => {
  // 使用 Jest 的 fake timers 来测试时间相关逻辑
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('createWalletConnectionFlow', () => {
    test('必须按照正确顺序执行连接流程', () => {
      // Given: 准备 mock handlers
      const executionOrder: string[] = [];
      const handlers = {
        showInitiating: jest.fn(() => executionOrder.push('showInitiating')),
        connectWallet: jest.fn(() => executionOrder.push('connectWallet')),
        handleClose: jest.fn(() => executionOrder.push('handleClose')),
      };

      // When: 执行连接流程
      const flow = createWalletConnectionFlow(handlers);
      flow();

      // Then: 立即执行 showInitiating
      expect(handlers.showInitiating).toHaveBeenCalledTimes(1);
      expect(executionOrder).toEqual(['showInitiating']);

      // 100ms 后执行 connectWallet 和 handleClose
      jest.advanceTimersByTime(100);
      expect(handlers.connectWallet).toHaveBeenCalledTimes(1);
      expect(handlers.handleClose).toHaveBeenCalledTimes(1);
      expect(executionOrder).toEqual(['showInitiating', 'connectWallet', 'handleClose']);
    });

    test('connectWallet 必须在 100ms 后执行', () => {
      // Given: 准备 handlers
      const handlers = {
        showInitiating: jest.fn(),
        connectWallet: jest.fn(),
        handleClose: jest.fn(),
      };

      // When: 执行连接流程
      const flow = createWalletConnectionFlow(handlers);
      flow();

      // Then: 99ms 时还未执行 connectWallet
      jest.advanceTimersByTime(99);
      expect(handlers.connectWallet).not.toHaveBeenCalled();

      // 100ms 时执行 connectWallet
      jest.advanceTimersByTime(1);
      expect(handlers.connectWallet).toHaveBeenCalledTimes(1);
    });
  });

  describe('isValidConnectionSequence', () => {
    test('正确的连接顺序应该返回 true', () => {
      const validSequence = ['showInitiating', 'connectWallet', 'handleClose'];
      expect(isValidConnectionSequence(validSequence)).toBe(true);
    });

    test('错误的连接顺序应该返回 false', () => {
      // 顺序错误
      expect(isValidConnectionSequence(['connectWallet', 'showInitiating', 'handleClose'])).toBe(false);
      
      // 缺少步骤
      expect(isValidConnectionSequence(['showInitiating', 'connectWallet'])).toBe(false);
      
      // 多余步骤
      expect(isValidConnectionSequence(['showInitiating', 'connectWallet', 'handleClose', 'extra'])).toBe(false);
    });
  });

  describe('isValidConnectionTiming', () => {
    test('正确的时间间隔应该返回 true', () => {
      const validTimestamps = {
        showInitiating: 1000,
        connectWallet: 1100, // 100ms 后
        handleClose: 1105,   // 5ms 后
      };
      expect(isValidConnectionTiming(validTimestamps)).toBe(true);
    });

    test('connectWallet 执行过早应该返回 false', () => {
      const timestamps = {
        showInitiating: 1000,
        connectWallet: 1050,  // 只有 50ms
        handleClose: 1055,
      };
      expect(isValidConnectionTiming(timestamps)).toBe(false);
    });

    test('connectWallet 执行过晚应该返回 false', () => {
      const timestamps = {
        showInitiating: 1000,
        connectWallet: 1200,  // 200ms 太晚了
        handleClose: 1205,
      };
      expect(isValidConnectionTiming(timestamps)).toBe(false);
    });

    test('handleClose 延迟过多应该返回 false', () => {
      const timestamps = {
        showInitiating: 1000,
        connectWallet: 1100,
        handleClose: 1150,    // 50ms 太晚了
      };
      expect(isValidConnectionTiming(timestamps)).toBe(false);
    });
  });
});