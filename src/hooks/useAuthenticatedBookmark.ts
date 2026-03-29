'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useModal } from '@/lib/context/ModalContext';
import { useProjectSave } from './useProjectSave';
import { setCookie, getCookie, deleteCookie, COOKIE_KEYS } from '@/lib/utils/storage/cookieService';
import { logger } from '@/lib/utils/logger';

interface UseAuthenticatedBookmarkOptions {
  projectId: string;
  projectName?: string;
  onSuccess?: () => void;
}

export function useAuthenticatedBookmark({ 
  projectId, 
  projectName,
  onSuccess 
}: UseAuthenticatedBookmarkOptions) {
  const { user, isAuthenticated } = useAuth();
  const { openAuthModal } = useModal();
  const { isSaved, saveCount, toggleSave, isLoading } = useProjectSave(projectId);
  

  const handleBookmarkClick = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent navigation to project detail
    }
    
    if (!user) {
      
      // Store bookmark intent in cookie for persistence
      const pendingData = {
        projectId,
        projectName,
        timestamp: Date.now()
      };
      setCookie(COOKIE_KEYS.PENDING_BOOKMARK, JSON.stringify(pendingData), {
        maxAge: 300, // 5 minutes
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });
      
      // Open authentication modal
      openAuthModal();
      return;
    }
    
    // User is authenticated, proceed with bookmark
    toggleSave();
  }, [user, openAuthModal, toggleSave, projectId, projectName]);

  // Check for pending bookmark when user changes (from null to authenticated)
  useEffect(() => {
    // Only proceed if we have a user (just logged in)
    if (user && isAuthenticated) {
      // Small delay to ensure auth process is complete
      const timer = setTimeout(() => {
        const pendingBookmarkCookie = getCookie(COOKIE_KEYS.PENDING_BOOKMARK);
        
        if (pendingBookmarkCookie) {
          try {
            const bookmark = JSON.parse(pendingBookmarkCookie as string);
            // Check if this is the same project
            if (bookmark.projectId === projectId) {
                
              // Execute the bookmark
              toggleSave().then(() => {
                // Delete the cookie after successful bookmark
                deleteCookie(COOKIE_KEYS.PENDING_BOOKMARK);
                onSuccess?.();
              }).catch(error => {
                logger.error('Failed to bookmark after auth', { error });
                // Keep the cookie for retry
              });
            }
          } catch (error) {
            logger.error('Error parsing pending bookmark', { error });
            deleteCookie(COOKIE_KEYS.PENDING_BOOKMARK);
          }
        }
      }, 500); // Give auth process time to complete
      
      return () => clearTimeout(timer);
    }
  }, [user, isAuthenticated, projectId, toggleSave, onSuccess]);

  return {
    isSaved,
    saveCount,
    isLoading,
    handleBookmarkClick
  };
}