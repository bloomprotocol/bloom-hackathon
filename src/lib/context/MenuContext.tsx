'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface MenuContextType {
  showMenu: boolean;
  setShowMenu: (show: boolean) => void;
  menuProps: {
    showProfileBurger?: boolean;
    onProfileBurgerClick?: () => void;
    isMobileMenuOpen?: boolean;
  };
  setMenuProps: (props: MenuContextType['menuProps']) => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [showMenu, setShowMenu] = useState(true);
  const [menuProps, setMenuProps] = useState<MenuContextType['menuProps']>({});

  return (
    <MenuContext.Provider value={{ showMenu, setShowMenu, menuProps, setMenuProps }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) {
    // SSR 安全的 fallback，避免預渲染錯誤
    return {
      showMenu: true,
      setShowMenu: () => {},
      menuProps: {},
      setMenuProps: () => {}
    } as MenuContextType;
  }
  return context;
}