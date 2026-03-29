/**
 * AuthGuard business logic extracted for testability
 */

/**
 * Determine if user should see loading state
 * @param isLoading Auth context loading state
 * @param isAuthorized Authorization determination state
 * @returns Whether to show loading UI
 */
export function shouldShowLoadingState(
  isLoading: boolean,
  isAuthorized: boolean | null
): boolean {
  return isLoading || isAuthorized === null;
}

/**
 * Determine if user is authorized to access content
 * @param isAuthenticated React auth state
 * @param hasAuthCookie Cookie-based auth state
 * @param requiresAuth Whether route requires authentication
 * @param hasRequiredRole Whether user has required role
 * @returns Authorization result
 */
export function determineAuthorization(
  isAuthenticated: boolean,
  hasAuthCookie: boolean,
  requiresAuth: boolean,
  hasRequiredRole: boolean = true
): { authorized: boolean; reason?: string } {
  // Non-protected routes are always accessible
  if (!requiresAuth) {
    return { authorized: true };
  }

  // Protected routes require authentication
  if (!isAuthenticated && !hasAuthCookie) {
    return { authorized: false, reason: 'authentication_required' };
  }

  // Check role requirements
  if (!hasRequiredRole) {
    return { authorized: false, reason: 'insufficient_role' };
  }

  return { authorized: true };
}

/**
 * Get welcome message for loading state
 * @param messages Array of possible welcome messages
 * @returns Random welcome message
 */
export function getWelcomeMessage(messages: string[]): string {
  if (messages.length === 0) return 'Loading...';
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}

/**
 * Determine redirect action based on authorization
 * @param authorized Whether user is authorized
 * @param currentPath Current pathname
 * @param homePath Home page path
 * @returns Redirect information
 */
export function getRedirectAction(
  authorized: boolean,
  currentPath: string,
  homePath: string = '/'
): { shouldRedirect: boolean; redirectTo?: string } {
  if (!authorized) {
    return { shouldRedirect: true, redirectTo: homePath };
  }
  
  return { shouldRedirect: false };
}