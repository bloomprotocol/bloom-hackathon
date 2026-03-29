'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import HumanVerificationModal from '@/components/ui/HumanVerificationModal';
import MobileNavigationModal from '@/components/ui/MobileBurgerMenu';

interface ModalContextType {
  openHumanVerificationModal: () => void;
  closeHumanVerificationModal: () => void;
  onVerificationComplete?: () => void;
  setOnVerificationComplete: (callback: (() => void) | undefined) => void;
  // 新增 Mobile Navigation Modal 相關方法
  openMobileNavigationModal: () => void;
  closeMobileNavigationModal: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isHVMOpen, setIsHVMOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [onVerificationComplete, setOnVerificationComplete] = useState<(() => void) | undefined>();

  const openHumanVerificationModal = useCallback(() => {
    setIsHVMOpen(true);
  }, []);

  const closeHumanVerificationModal = useCallback(() => {
    setIsHVMOpen(false);
  }, []);

  const openMobileNavigationModal = useCallback(() => {
    setIsMobileNavOpen(true);
  }, []);

  const closeMobileNavigationModal = useCallback(() => {
    setIsMobileNavOpen(false);
  }, []);

  const handleSetOnVerificationComplete = useCallback((callback: (() => void) | undefined) => {
    setOnVerificationComplete(() => callback);
  }, []);

  return (
    <ModalContext.Provider 
      value={{ 
        openHumanVerificationModal, 
        closeHumanVerificationModal,
        onVerificationComplete,
        setOnVerificationComplete: handleSetOnVerificationComplete,
        openMobileNavigationModal,
        closeMobileNavigationModal
      }}
    >
      {children}
      {/* Modal渲染在最顶层 */}
      <HumanVerificationModal 
        isOpen={isHVMOpen}
        onClose={closeHumanVerificationModal}
        onVerificationComplete={onVerificationComplete}
      />
      <MobileNavigationModal
        isOpen={isMobileNavOpen}
        onClose={closeMobileNavigationModal}
      />
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}