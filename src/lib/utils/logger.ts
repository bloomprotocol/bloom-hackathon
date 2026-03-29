/**
 * BP-FE Logger
 *
 * 功能：
 * - 開發環境：所有級別日誌顯示在控制台
 * - 生產環境：只有 error 級別顯示在控制台
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogParams = Record<string, unknown>;

// 配置
const CONFIG = {
  // 生產環境或 NEXT_PUBLIC_DEBUG=false 時只顯示 error
  // 開發環境且 NEXT_PUBLIC_DEBUG 未設置或為 true 時顯示所有級別
  minLevelForConsole:
    process.env.NODE_ENV === 'production' ||
    process.env.NEXT_PUBLIC_DEBUG === 'false'
      ? 'error'
      : 'debug',
};

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LEVEL_STYLES: Record<LogLevel, string> = {
  debug: 'color: #9E9E9E',
  info: 'color: #2196F3',
  warn: 'color: #FF9800',
  error: 'color: #F44336; font-weight: bold',
};

class Logger {
  private shouldLog(level: LogLevel): boolean {
    return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[CONFIG.minLevelForConsole as LogLevel];
  }

  private formatForConsole(level: LogLevel, message: string, params?: LogParams, error?: Error): void {
    if (!this.shouldLog(level)) return;

    if (typeof window === 'undefined') {
      // Server-side: Railway logs (JSON format)
      const logData = JSON.stringify({ level, message, params, error: error?.message });
      if (level === 'error') {
        console.error(logData);
      } else if (level === 'warn') {
        console.warn(logData);
      } else {
        console.log(logData);
      }
      return;
    }

    const method = level === 'debug' ? 'debug' : level;
    const args: unknown[] = [
      `%c[${level.toUpperCase()}] ${message}`,
      LEVEL_STYLES[level],
    ];

    if (params && Object.keys(params).length > 0) {
      args.push(params);
    }

    if (error) {
      args.push(error);
    }

    console[method](...args);
  }

  debug(message: string, params?: LogParams): void {
    this.formatForConsole('debug', message, params);
  }

  info(message: string, params?: LogParams): void {
    this.formatForConsole('info', message, params);
  }

  warn(message: string, params?: LogParams): void {
    this.formatForConsole('warn', message, params);
  }

  error(message: string, params?: LogParams, error?: Error): void {
    this.formatForConsole('error', message, params, error);
  }

  // 保留 trace 方法以兼容現有代碼
  trace(message: string, params?: LogParams): void {
    if (this.shouldLog('debug')) {
      console.trace(`[TRACE] ${message}`, params);
    }
  }
}

export const logger = new Logger();

// 全局掛載（僅用於調試）
if (typeof window !== 'undefined') {
  (window as unknown as { logger: Logger }).logger = logger;
}

// TypeScript 類型聲明
declare global {
  interface Window {
    logger: Logger;
  }
}
