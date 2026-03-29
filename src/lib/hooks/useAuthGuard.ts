import { useEffect, useState } from 'react';
import { getCookie, COOKIE_KEYS } from '@/lib/utils/storage';
import { UserRole } from '@/lib/types/auth';

interface AuthGuardState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  walletAddress: string | null;
  roles: UserRole[];
  hasRole: (role: UserRole) => boolean;
}

/**
 * Hook for fast, synchronous authentication checks using cookies
 * Use this for:
 * - Checking authentication status
 * - Role-based routing decisions
 * - Initial page renders (SSR compatible)
 * - Displaying basic user info (wallet address)
 */
export const useAuthGuard = (): AuthGuardState => {
  const [state, setState] = useState<AuthGuardState>(() => {
    // Initialize from cookies synchronously
    const authToken = getCookie(COOKIE_KEYS.AUTH_TOKEN);
    const userId = getCookie(COOKIE_KEYS.SUB);
    const walletAddress = getCookie(COOKIE_KEYS.WALLET_ADDRESS);
    const roleStr = getCookie(COOKIE_KEYS.ROLE);
    
    // Role is now a single string, convert to array for compatibility
    const roles: UserRole[] = roleStr ? [String(roleStr) as UserRole] : [];

    return {
      isAuthenticated: !!authToken,
      isLoading: false,
      userId: userId ? String(userId) : null,
      walletAddress: walletAddress ? String(walletAddress) : null,
      roles,
      hasRole: (role: UserRole) => roles.includes(role),
    };
  });

  useEffect(() => {
    // Listen for storage changes (login/logout from other tabs)
    const handleStorageChange = () => {
      const authToken = getCookie(COOKIE_KEYS.AUTH_TOKEN);
      const userId = getCookie(COOKIE_KEYS.SUB);
      const walletAddress = getCookie(COOKIE_KEYS.WALLET_ADDRESS);
      const roleStr = getCookie(COOKIE_KEYS.ROLE);
      
      // Role is now a single string, convert to array for compatibility
      const roles: UserRole[] = roleStr ? [String(roleStr) as UserRole] : [];

      setState({
        isAuthenticated: !!authToken,
        isLoading: false,
        userId: userId ? String(userId) : null,
        walletAddress: walletAddress ? String(walletAddress) : null,
        roles,
        hasRole: (role: UserRole) => roles.includes(role),
      });
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return state;
};

/**
 * Hook to check if user has specific role(s)
 * @param requiredRoles - Single role or array of roles (user must have at least one)
 */
export const useHasRole = (requiredRoles: UserRole | UserRole[]): boolean => {
  const { roles } = useAuthGuard();
  const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return rolesArray.some(role => roles.includes(role));
};

/**
 * Hook to check if user has all specified roles
 * @param requiredRoles - Array of roles (user must have all)
 */
export const useHasAllRoles = (requiredRoles: UserRole[]): boolean => {
  const { roles } = useAuthGuard();
  return requiredRoles.every(role => roles.includes(role));
};