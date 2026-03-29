'use client';

import React, { ReactNode } from 'react';
import { BaseModal } from '@/components/ui/BaseModal';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ 
  isOpen, 
  onClose, 
  children,
  className = ''
}) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      className={`mobile-menu block mobile:block desktop:hidden ${className}`}
      logo={{
        src: "https://statics.bloomprotocol.ai/images/modal_logo.png",
        alt: "Bloom Protocol",
        width: 50,
        height: 50
      }}
      caption="Create Project"
    >
      {children}
    </BaseModal>
  );
};