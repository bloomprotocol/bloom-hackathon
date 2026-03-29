import { useState, useEffect } from 'react';

/**
 * Platform detection utilities
 */

export interface PlatformInfo {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  screenWidth: number;
}

/**
 * Get current platform information
 * Mobile is defined as screen width < 1280px
 */
export const getPlatform = (): PlatformInfo => {
  const width = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : '';

  return {
    isMobile: width < 1280,
    isIOS: /iphone|ipad|ipod/.test(userAgent),
    isAndroid: /android/.test(userAgent),
    screenWidth: width
  };
};

/**
 * Check if running on mobile device (< 1280px)
 */
export const isMobile = (): boolean => {
  return getPlatform().isMobile;
};

/**
 * Hook to track platform changes
 */
export const usePlatform = () => {
  const [platform, setPlatform] = useState(getPlatform);

  useEffect(() => {
    const handleResize = () => {
      setPlatform(getPlatform());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return platform;
};