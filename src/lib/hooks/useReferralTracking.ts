'use client';

import { useEffect } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import apiInstance from '@/lib/api/apiConfig';
import { setCookie, COOKIE_KEYS } from '@/lib/utils/storage/cookieService';
import { logger } from '@/lib/utils/logger';

export function useReferralTracking() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    const code = searchParams.get('code');
    
    if (code) {
      // Save referral code to cookie
      setCookie(COOKIE_KEYS.REFERRAL_CODE, code, {
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        sameSite: 'lax' as const,
      });
      
      // Detect if this is a project page
      const projectMatch = pathname.match(/^\/project\/([^\/]+)/);
      const projectSlug = projectMatch ? projectMatch[1] : undefined;
      
      // Construct the current URL
      const currentUrl = typeof window !== 'undefined' 
        ? window.location.href 
        : `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

      // Record the referral click
      recordReferralClick(code, currentUrl, projectSlug);
    }
  }, [searchParams, pathname]);
}

async function recordReferralClick(
  referralCode: string, 
  currentUrl: string, 
  projectSlug?: string
) {
  try {
    await apiInstance.post('/referral/click', {
      referralCode,
      currentUrl,
      projectSlug
    });
    
    console.log('Referral click recorded successfully');
  } catch (error) {
    logger.error('Failed to record referral click', { error });
  }
}