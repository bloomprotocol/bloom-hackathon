import { logger } from './logger';

export function setupGlobalErrorHandlers(): void {
  if (typeof window === 'undefined') return;

  // 未捕獲的錯誤
  window.onerror = (message, source, lineno, colno, error) => {
    logger.error(
      'Uncaught error',
      {
        message: String(message),
        source,
        lineno,
        colno,
      },
      error || undefined
    );
  };

  // 未處理的 Promise rejection
  window.onunhandledrejection = (event) => {
    const reason = event.reason;
    logger.error(
      'Unhandled promise rejection',
      {
        reason: reason instanceof Error ? reason.message : String(reason),
      },
      reason instanceof Error ? reason : undefined
    );
  };
}
