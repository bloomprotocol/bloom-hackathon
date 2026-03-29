'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import HumanVerificationModal from '@/components/ui/HumanVerificationModal';
import MobileBurgerMenu from '@/components/ui/MobileBurgerMenu';
import ProfileModalWrapper from '@/components/ui/ProfileModalWrapper';
import AuthModal from '@/components/ui/AuthModal';
import { useAuth } from '@/lib/context/AuthContext';

interface ModalContextType {
  openHumanVerificationModal: () => void;
  closeHumanVerificationModal: () => void;
  onVerificationComplete?: () => void;
  setOnVerificationComplete: (callback: (() => void) | undefined) => void;
  // Mobile Burger Menu 相關方法
  openMobileBurgerMenu: () => void;
  closeMobileBurgerMenu: () => void;
  // Profile Modal 相關方法 - 新增
  // Profile Modal 相關方法 - 新增
  openProfileModal: () => void;
  closeProfileModal: () => void;
  // Auth Modal 相關方法
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isHVMOpen, setIsHVMOpen] = useState(false);
  const [isMobileBurgerOpen, setIsMobileBurgerOpen] = useState(false);
  const [onVerificationComplete, setOnVerificationComplete] = useState<(() => void) | undefined>();
  // Profile Modal 狀態 - 新增
  // Profile Modal 狀態 - 新增
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  // Auth Modal 狀態
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  

  const openHumanVerificationModal = useCallback(() => {
    setIsHVMOpen(true);
  }, []);

  const closeHumanVerificationModal = useCallback(() => {
    setIsHVMOpen(false);
  }, []);

  const openMobileBurgerMenu = useCallback(() => {
    setIsMobileBurgerOpen(true);
  }, []);

  const closeMobileBurgerMenu = useCallback(() => {
    setIsMobileBurgerOpen(false);
  }, []);

  const handleSetOnVerificationComplete = useCallback((callback: (() => void) | undefined) => {
    setOnVerificationComplete(() => callback);
  }, []);

  // Profile Modal 相關方法 - 新增
  // Profile Modal 相關方法 - 新增
  const openProfileModal = useCallback(() => {
    setIsProfileModalOpen(true);
  }, []);

  // Profile Modal 相關方法 - 新增
  // Profile Modal 相關方法 - 新增
  const closeProfileModal = useCallback(() => {
    setIsProfileModalOpen(false);
  }, []);

  // Auth Modal 相關方法
  const openAuthModal = useCallback(() => {
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    // Clean up mobile wallet connecting state when modal is closed
    sessionStorage.removeItem('mobile_wallet_connecting');
  }, []);

  // Access auth context to check mobile wallet return state
  const { phantomHookState, okxHookState, isAuthenticated } = useAuth();

  // Auto-open AuthModal when returning from mobile wallet app
  // Two cases:
  // 1. Same tab return (OKX): sessionStorage has 'mobile_wallet_connecting'
  // 2. New tab return (Phantom): No sessionStorage, but phantomHookState has publicKey without signature
  useEffect(() => {
    if (isAuthenticated) return;

    const connectingWallet = sessionStorage.getItem('mobile_wallet_connecting');

    // Case 1: Same tab return - use sessionStorage to determine wallet type
    if (connectingWallet) {
      const hookState = connectingWallet === 'phantom' ? phantomHookState : okxHookState;
      if (hookState?.publicKey && !hookState?.lastSignature) {
        setIsAuthModalOpen(true);
      }
      return;
    }

    // Case 2: New tab return (Phantom opens new tab)
    // Detect by checking if Phantom has publicKey but no signature, and no sessionStorage
    if (phantomHookState?.publicKey && !phantomHookState?.lastSignature) {
      // Set sessionStorage so AuthModal knows which wallet flow to show
      sessionStorage.setItem('mobile_wallet_connecting', 'phantom');
      setIsAuthModalOpen(true);
    }
  }, [phantomHookState?.publicKey, okxHookState?.publicKey, phantomHookState?.lastSignature, okxHookState?.lastSignature, isAuthenticated]);


  const contextValue = useMemo(() => ({
    openHumanVerificationModal, 
    closeHumanVerificationModal,
    onVerificationComplete,
    setOnVerificationComplete: handleSetOnVerificationComplete,
    openMobileBurgerMenu,
    closeMobileBurgerMenu,
    openProfileModal,
    closeProfileModal,
    openAuthModal,
    closeAuthModal
  }), [
    openHumanVerificationModal,
    closeHumanVerificationModal,
    onVerificationComplete,
    handleSetOnVerificationComplete,
    openMobileBurgerMenu,
    closeMobileBurgerMenu,
    openProfileModal,
    closeProfileModal,
    openAuthModal,
    closeAuthModal
  ]);

  return (
    <ModalContext.Provider value={contextValue}
    >
      {children}
      {/* Modal渲染在最顶层 - 使用条件渲染避免重复加载 */}
      {isHVMOpen && (
        <HumanVerificationModal 
          isOpen={isHVMOpen}
          onClose={closeHumanVerificationModal}
          onVerificationComplete={onVerificationComplete}
        />
      )}
      {isMobileBurgerOpen && (
        <MobileBurgerMenu
          isOpen={isMobileBurgerOpen}
          onClose={closeMobileBurgerMenu}
        />
      )}
      {/* Profile Modal - 新增 */}
      {isProfileModalOpen && (
        <ProfileModalWrapper
          isOpen={isProfileModalOpen}
          onClose={closeProfileModal}
        />
      )}
      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={closeAuthModal}
        />
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    // SSR 安全的 fallback，避免預渲染錯誤
    return {
      openHumanVerificationModal: () => {},
      closeHumanVerificationModal: () => {},
      onVerificationComplete: undefined,
      setOnVerificationComplete: () => {},
      openMobileBurgerMenu: () => {},
      closeMobileBurgerMenu: () => {},
      openProfileModal: () => {},
      closeProfileModal: () => {},
      openAuthModal: () => {},
      closeAuthModal: () => {}
    } as ModalContextType;
  }
  return context;
}