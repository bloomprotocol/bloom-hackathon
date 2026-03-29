'use client';

import { useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useModal } from '@/lib/context/ModalContext';

/**
 * 統一的認證處理 Hook
 * 提供一致的登入/連接錢包行為
 */
export function useUnifiedAuth() {
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const { openMobileBurgerMenu, openProfileModal, openAuthModal } = useModal();

    /**
     * 統一的連接/登入處理方法
     * 根據當前狀態和頁面位置決定行為
     */
    const handleUnifiedConnect = useCallback(() => {
        if (pathname === '/dashboard') {
            // 在 Profile 頁面時，打開 ProfileModal
            openProfileModal();
        } else if (isAuthenticated) {
            // 已認證，打開 ProfileModal
            openProfileModal();
        } else {
            // 未認證，打開認證模態框
            openAuthModal();
        }
    }, [pathname, isAuthenticated, router, openAuthModal, openProfileModal]);

    return {
        handleUnifiedConnect
    };
}