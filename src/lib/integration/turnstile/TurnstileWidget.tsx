'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { TURNSTILE_CONFIG, isTurnstileConfigured } from './turnstile.config';
import { logger } from '@/lib/utils/logger';
import Image from 'next/image';

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: (error: string) => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
  className?: string;
}

type WidgetState = 'loading' | 'ready' | 'verifying' | 'success' | 'error';

export function TurnstileWidget({
  onSuccess,
  onError,
  onExpire,
  theme = TURNSTILE_CONFIG.appearance.theme,
  size = TURNSTILE_CONFIG.appearance.size,
  className = '',
}: TurnstileWidgetProps) {
  const [state, setState] = useState<WidgetState>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const scriptLoadedRef = useRef<boolean>(false);

  // 清理 widget
  const cleanupWidget = useCallback(() => {
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch (e) {
        // 忽略清理錯誤
      }
      widgetIdRef.current = null;
    }
  }, []);

  // 渲染 widget
  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile) return;

    setState('ready');

    try {
      const widgetId = window.turnstile.render(containerRef.current, {
        sitekey: TURNSTILE_CONFIG.siteKey,
        theme: theme,
        size: size,
        appearance: 'interaction-only' as const,
        callback: (token: string) => {
          if (token.startsWith('XXXX.DUMMY.TOKEN')) {
          }
          setState('success');
          setTimeout(() => {
            onSuccess(token);
          }, 200);
        },
        'error-callback': () => {
          logger.error('[Turnstile] Verification error');
          const error = 'Verification failed. Please try again.';
          setState('error');
          setErrorMessage(error);
          onError?.(error);
        },
        'expired-callback': () => {
          logger.warn('[Turnstile] Token expired');
          setState('ready');
          onExpire?.();
        },
      });

      if (widgetId) {
        widgetIdRef.current = widgetId;
      }
    } catch (error) {
      logger.error('[Turnstile] Failed to render widget', { error });
      setState('error');
      setErrorMessage('Failed to load verification widget');
      onError?.('Failed to load verification widget');
    }
  }, [theme, size, onSuccess, onError, onExpire]);

  // 重試
  const retry = useCallback(() => {
    cleanupWidget();
    setState('loading');
    setErrorMessage('');
    setTimeout(renderWidget, 50);
  }, [cleanupWidget, renderWidget]);

  // 加載和初始化
  useEffect(() => {
    if (!isTurnstileConfigured()) return;

    let mounted = true;

    const initializeTurnstile = async () => {
      if (window.turnstile) {
        if (mounted) {
          renderWidget();
        }
        return;
      }

      const existingScript = document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]');
      if (existingScript && !scriptLoadedRef.current) {
        const checkInterval = setInterval(() => {
          if (window.turnstile) {
            clearInterval(checkInterval);
            scriptLoadedRef.current = true;
            if (mounted) {
              renderWidget();
            }
          }
        }, 100);

        setTimeout(() => {
          clearInterval(checkInterval);
          if (!window.turnstile && mounted) {
            setState('error');
            setErrorMessage('Failed to load Turnstile');
          }
        }, 10000);
        return;
      }

      if (!scriptLoadedRef.current) {
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
        script.async = true;
        script.defer = true;

        script.onload = () => {
          scriptLoadedRef.current = true;
          const waitForTurnstile = setInterval(() => {
            if (window.turnstile && mounted) {
              clearInterval(waitForTurnstile);
              renderWidget();
            }
          }, 10);
        };

        script.onerror = () => {
          logger.error('[Turnstile] Script load error');
          if (mounted) {
            setState('error');
            setErrorMessage('Failed to load verification service');
          }
        };

        document.head.appendChild(script);
      }
    };

    initializeTurnstile();

    return () => {
      mounted = false;
      cleanupWidget();
    };
  }, []);

  if (!isTurnstileConfigured()) {
    return (
      <div className={`text-red-500 font-['Outfit'] text-sm ${className}`}>
        Turnstile not configured
      </div>
    );
  }

  return (
    <div className={`turnstile-widget ${className} font-['Outfit']`}>
      {state === 'loading' && (
        <div className="flex items-center h-[65px]">
          <div className="text-gray-500 font-['Outfit'] text-sm">Loading verification...</div>
        </div>
      )}
      
      {state === 'error' && (
        <div className="flex flex-col items-center h-[65px]">
          <div className="text-red-500 text-sm mb-2 font-['Outfit']">{errorMessage}</div>
          <button 
            onClick={retry}
            className="font-['Outfit'] px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      )}
      
      <div 
        ref={containerRef}
        className={state === 'ready' || state === 'verifying' ? 'block' : 'hidden'}
        style={{ minHeight: size === 'normal' ? '65px' : '50px' }}
      />
      
      {state === 'success' && (
        <div className="flex items-center h-full">
          <div className="flex items-center gap-2">
            <Image src="https://statics.bloomprotocol.ai/icon/pika-check-tick-circle-broken.svg" alt="checked" width={20} height={20} className="w-5 h-5" />
            <h3 className="font-['Outfit'] text-[20px] text-[#2d1b69] font-semibold">Initiating</h3>
          </div>
        </div>
      )}
    </div>
  );
}

export function useTurnstile() {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  const handleSuccess = useCallback((token: string) => {
    setToken(token);
    setIsVerified(true);
    setError(null);
  }, []);

  const handleError = useCallback((error: string) => {
    setError(error);
    setIsVerified(false);
    setToken(null);
  }, []);

  const handleExpire = useCallback(() => {
    setIsVerified(false);
    setToken(null);
    setError('Verification expired');
  }, []);

  const reset = useCallback(() => {
    setToken(null);
    setError(null);
    setIsVerified(false);
  }, []);

  return {
    token,
    error,
    isVerified,
    handleSuccess,
    handleError,
    handleExpire,
    reset,
  };
}