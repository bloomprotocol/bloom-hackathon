'use client';

import { useEffect } from 'react';
import { useMenu } from '@/lib/context/MenuContext';
import { useMobileMenu } from '@/lib/context/MobileMenuContext';

interface UseMobileMenuIntegrationOptions {
  showProfileBurger?: boolean;
}

export const useMobileMenuIntegration = (options: UseMobileMenuIntegrationOptions = {}) => {
  const { setMenuProps } = useMenu();
  const { isMobileMenuOpen, toggleMobileMenu } = useMobileMenu();
  const { showProfileBurger = true } = options;

  useEffect(() => {
    setMenuProps({
      showProfileBurger,
      onProfileBurgerClick: toggleMobileMenu,
      isMobileMenuOpen
    });

    return () => {
      setMenuProps({
        showProfileBurger: false,
        onProfileBurgerClick: undefined,
        isMobileMenuOpen: false
      });
    };
  }, [setMenuProps, showProfileBurger, toggleMobileMenu, isMobileMenuOpen]);

  return {
    isMobileMenuOpen,
    toggleMobileMenu
  };
};