// Cloudflare Turnstile type definitions
declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: TurnstileOptions) => string | undefined;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
      getResponse: (widgetId: string) => string | undefined;
    };
  }
}

interface TurnstileOptions {
  sitekey: string;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
  callback?: (token: string) => void;
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
  'timeout-callback'?: () => void;
  retry?: 'auto' | 'never';
  'retry-interval'?: number;
  language?: string;
  appearance?: 'always' | 'execute' | 'interaction-only';
  'response-field'?: boolean;
  'response-field-name'?: string;
  tabindex?: number;
}

export {}; 