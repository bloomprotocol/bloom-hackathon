/**
 * Dashboard navigation business logic extracted for testing
 */

/**
 * Determine if Dashboard menu item should be shown as a link or button
 * @param isAuthenticated Whether the user is authenticated
 * @returns 'link' if authenticated, 'button' if not
 */
export function getDashboardMenuType(isAuthenticated: boolean): 'link' | 'button' {
  return isAuthenticated ? 'link' : 'button';
}

/**
 * Get the redirect path to store before authentication
 * @param targetPath The path user wants to access
 * @returns The path to redirect to after auth
 */
export function getRedirectPath(targetPath: string): string {
  return targetPath;
}

/**
 * Determine if the path requires authentication
 * @param pathname Current pathname
 * @param menuItem Menu item configuration
 * @returns Whether authentication is required
 */
export function requiresAuthForMenuItem(
  pathname: string,
  menuItem: { href: string; requiresAuth?: boolean }
): boolean {
  return menuItem.requiresAuth === true;
}

/**
 * Get the active menu item based on current path
 * @param pathname Current pathname
 * @param menuItems Array of menu items
 * @returns The active menu item ID or null
 */
export function getActiveMenuItem(
  pathname: string,
  menuItems: Array<{ id: string; href: string }>
): string | null {
  const activeItem = menuItems.find(item => item.href === pathname);
  return activeItem?.id || null;
}

/**
 * Determine menu link styling based on active state
 * @param isActive Whether this menu item is active
 * @param activeClass CSS class for active state
 * @param inactiveClass CSS class for inactive state
 * @returns The CSS class to apply
 */
export function getMenuLinkClass(
  isActive: boolean,
  activeClass: string,
  inactiveClass: string
): string {
  return isActive ? activeClass : inactiveClass;
}