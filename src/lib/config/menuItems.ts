import { MenuItemCollection, MenuRouteConfig, UserRole } from '../context/menu/menuTypes';

/**
 * Fallback menu items configuration
 * Used when API fails or is unavailable
 * This data should match the MongoDB seed data structure
 */

// Menu items fallback configuration
// v4: 2 main nav pills (Discover, My Agent) + hamburger-only items
export const FALLBACK_MENU_ITEMS: MenuItemCollection = {
  // Primary navigation (desktop pills — order < 10)
  tribes: {
    id: 'tribes',
    label: 'Tribes',
    href: '/tribes',
    icon: 'hi-user-group',
    order: 1
  },
  discover: {
    id: 'discover',
    label: 'Discover',
    href: '/discover',
    icon: 'hi-magnifying-glass',
    order: 2
  },
  'my-agent': {
    id: 'my-agent',
    label: 'My Agent',
    href: '/my-agent',
    icon: 'hi-cpu-chip',
    order: 3
  },

  // Social links
  x: {
    id: 'x',
    label: 'X',
    href: 'https://x.com/Bloom__protocol',
    external: true,
    icon: 'pika-x-com',
    order: 0
  }
};

// Items that only appear in the hamburger / mobile menu
export const HAMBURGER_ONLY_ITEMS: MenuItemCollection = {
  'launch-committee': {
    id: 'launch-committee',
    label: 'Launch Committee',
    href: '/launch-committee',
    icon: 'hi-rocket-launch',
    order: 19
  },
  missions: {
    id: 'missions',
    label: 'Missions',
    href: '/spotlight',
    icon: 'hi-viewfinder-circle',
    order: 20
  },
  about: {
    id: 'about',
    label: 'About',
    href: '/about',
    icon: 'hi-information-circle',
    order: 21
  },
};

// Route configuration fallback
export const FALLBACK_MENU_ROUTES: MenuRouteConfig = {
  // Navigation burger pages (mobile)
  navigationBurger: [
    '/',
    '/tribes',
    '/discover',
    '/my-agent',
    '/launch-committee',
    '/spotlight',
    '/about',
  ],

  // Profile burger pages (mobile) - DEPRECATED
  profileBurger: [],

  // Special pages configuration
  specialPages: {
    '/dashboard': 'dashboard',
    '/create-project': 'create-project',
  }
};

/**
 * MongoDB structure for menu items
 * This is what the API will return
 */
export interface MenuItemsApiData {
  items: Array<{
    id: string;
    label: string;
    href: string;
    icon?: string;
    requiresAuth?: boolean;
    requiresRole?: string;
    external?: boolean;
    order: number;
  }>;
  lastUpdated: string;
}

/**
 * Convert API response to MenuItemCollection
 */
export function convertApiToMenuItems(apiData: MenuItemsApiData): MenuItemCollection {
  const menuItems: MenuItemCollection = {};
  
  apiData.items
    .forEach(item => {
      // Convert requiresRole string to UserRole type
      let requiresRole: UserRole | undefined;
      if (item.requiresRole === 'user' || item.requiresRole === 'builder') {
        requiresRole = item.requiresRole as UserRole;
      } else if (item.requiresRole) {
        // If it's any other string, default to 'user' or ignore
        requiresRole = undefined;
      }
      
      menuItems[item.id] = {
        id: item.id,
        label: item.label,
        href: item.href,
        icon: item.icon,
        requiresAuth: item.requiresAuth,
        requiresRole: requiresRole,
        external: item.external,
        order: item.order
      };
    });
  
  return menuItems;
}