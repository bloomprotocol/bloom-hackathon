"use client";

import { useEffect, useLayoutEffect, useCallback } from 'react';
import { logger } from '@/lib/utils/logger';

// Button styles
const menuStyles = {
  container: {
    paddingTop: '20px',
    paddingBottom: '20px',
    paddingLeft: '16px',
    paddingRight: '16px',
    height: '12vh',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    maxWidth: '1440px',
    margin: '0 auto',
  },
  inner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    display: 'inline-block',
    height: '40px',
    lineHeight: '40px',
    textDecoration: 'none',
    padding: '0 16px',
    border: 'none',
    outline: 'none',
    borderRadius: '20px',
    fontWeight: 'bold',
  },
  cta: {
    backgroundColor: '#2D174A',
    color: '#fff',
  },
  processing: {
    backgroundColor: '#C496FF',
    color: '#FFFFFF',
  },
  authenticated: {
    backgroundColor: '#8E38FF',
    color: '#fff',
  },
  xButton: {
    marginRight: '12px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '1px solid rgba(0, 0, 0, 0.2)',
    backgroundColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
};

// Safe style application helper to avoid TypeScript errors
const safelyApplyStyles = (element: HTMLElement | null, styles: Record<string, any>) => {
  if (!element) return;
  
  // Apply each style property safely
  Object.keys(styles).forEach(key => {
    try {
      // Convert camelCase to kebab-case for CSS properties
      const styleKey = key.replace(/([A-Z])/g, match => `-${match.toLowerCase()}`);
      element.style.setProperty(styleKey, styles[key]);
    } catch (e) {
      logger.error(`Failed to set style property ${key}`, { error: e });
    }
  });
};

// Use a layout effect for client-side rendering
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function MenuStyleFixer() {
  // Function to apply styles to menu elements
  const applyMenuStyles = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Query all menu elements
    const container = document.querySelector('.menu-container') as HTMLElement | null;
    const inner = document.querySelector('.menu-inner') as HTMLElement | null;
    const buttons = document.querySelectorAll('.menu-connect-button');
    const xButton = document.querySelector('.menu-x-button') as HTMLElement | null;
    
    // Apply container styles
    safelyApplyStyles(container, menuStyles.container);
    
    // Apply inner styles
    safelyApplyStyles(inner, menuStyles.inner);
    
    // Apply button styles
    buttons.forEach(btn => {
      const button = btn as HTMLElement;
      
      // Apply base styles
      safelyApplyStyles(button, menuStyles.button);
      
      // Apply specific styles based on class
      if (btn.classList.contains('menu-link-cta')) {
        safelyApplyStyles(button, menuStyles.cta);
      } else if (btn.classList.contains('menu-processing')) {
        safelyApplyStyles(button, menuStyles.processing);
      } else if (btn.classList.contains('menu-authenticated')) {
        safelyApplyStyles(button, menuStyles.authenticated);
      }
    });
    
    // Apply X button styles
    safelyApplyStyles(xButton, menuStyles.xButton);
  }, []);

  // Apply styles using layout effect (runs before painting)
  useIsomorphicLayoutEffect(() => {
    // Apply immediately
    applyMenuStyles();
    
    // Create a retry mechanism to ensure styles are applied
    let retryCount = 0;
    const maxRetries = 10; // 10 retries with 100ms intervals = 1 second total
    
    const retryInterval = setInterval(() => {
      applyMenuStyles();
      retryCount++;
      
      if (retryCount >= maxRetries) {
        clearInterval(retryInterval);
      }
    }, 100);
    
    // Clean up interval on unmount
    return () => clearInterval(retryInterval);
  }, [applyMenuStyles]);

  // Also monitor navigation events
  useEffect(() => {
    const handleRouteChange = () => {
      setTimeout(applyMenuStyles, 50);
    };

    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [applyMenuStyles]);

  // This component doesn't render anything visible
  return null;
} 