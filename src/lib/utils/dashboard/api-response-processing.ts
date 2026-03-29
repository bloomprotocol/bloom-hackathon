/**
 * API Response Processing Logic for Dashboard Data
 * Extracted from profileService.ts for unit testing
 * 
 * Core Business Rules:
 * 1. API responses must be validated and transformed
 * 2. Query parameter construction must be type-safe
 * 3. URL building must handle optional parameters correctly
 * 4. Error responses must be handled gracefully
 * 5. Data transformation must maintain type safety
 */

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  error: string | null;
}

export interface ProfileInitialDataResponse {
  missions: any[];
  statistics: {
    completedTaskCount: number;
    totalPoints: number;
    miniPoints: number;
    totalClicks: number;
    totalReferrals: number;
  };
  userInfo: {
    role: string | null;
    referralCode: string | null;
    walletAddress: string | null;
  };
}

export interface PublicMissionsParams {
  status?: string;
  page?: number;
  limit?: number;
}

export interface PublicMissionsResponse {
  missions: any[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ActivityStatusParams {
  limit?: number;
}

/**
 * Validates API response structure
 * Business Rule: All API responses must have success, statusCode, and data fields
 */
export function validateApiResponse<T>(response: any): {
  isValid: boolean;
  data?: T;
  error?: string;
} {
  if (!response) {
    return { isValid: false, error: 'Empty response' };
  }

  if (typeof response.success !== 'boolean') {
    return { isValid: false, error: 'Missing or invalid success field' };
  }

  if (typeof response.statusCode !== 'number') {
    return { isValid: false, error: 'Missing or invalid statusCode field' };
  }

  if (!response.data) {
    return { isValid: false, error: 'Missing data field' };
  }

  return { isValid: true, data: response.data };
}

/**
 * Builds query parameters for public missions endpoint
 * Business Rule: Parameters must be properly encoded and validated
 */
export function buildPublicMissionsQuery(params?: PublicMissionsParams): string {
  if (!params) return '';

  const queryParams = new URLSearchParams();
  
  if (params.status && params.status.trim()) {
    queryParams.append('status', params.status.trim());
  }
  
  if (params.page && params.page > 0) {
    queryParams.append('page', params.page.toString());
  }
  
  if (params.limit && params.limit > 0 && params.limit <= 100) { // Reasonable limit cap
    queryParams.append('limit', params.limit.toString());
  }

  return queryParams.toString();
}

/**
 * Builds complete URL with query parameters
 * Business Rule: URLs must be properly formatted with optional query strings
 */
export function buildApiUrl(basePath: string, queryString: string): string {
  if (!basePath) {
    throw new Error('Base path is required');
  }

  if (!queryString) {
    return basePath;
  }

  return `${basePath}?${queryString}`;
}

/**
 * Validates public missions response structure
 * Business Rule: Public missions response must contain required pagination fields
 */
export function validatePublicMissionsResponse(data: any): {
  isValid: boolean;
  validated?: PublicMissionsResponse;
  error?: string;
} {
  if (!data) {
    return { isValid: false, error: 'No data provided' };
  }

  if (!Array.isArray(data.missions)) {
    return { isValid: false, error: 'Missions must be an array' };
  }

  if (typeof data.total !== 'number' || data.total < 0) {
    return { isValid: false, error: 'Total must be a non-negative number' };
  }

  if (typeof data.page !== 'number' || data.page < 1) {
    return { isValid: false, error: 'Page must be a positive number' };
  }

  if (typeof data.totalPages !== 'number' || data.totalPages < 1) {
    return { isValid: false, error: 'TotalPages must be a positive number' };
  }

  // Validate pagination logic
  if (data.page > data.totalPages) {
    return { isValid: false, error: 'Page number cannot exceed total pages' };
  }

  return {
    isValid: true,
    validated: {
      missions: data.missions,
      total: data.total,
      page: data.page,
      totalPages: data.totalPages
    }
  };
}

/**
 * Validates profile initial data response structure
 * Business Rule: Profile data must contain all required sections
 */
export function validateProfileInitialData(data: any): {
  isValid: boolean;
  validated?: ProfileInitialDataResponse;
  error?: string;
} {
  if (!data) {
    return { isValid: false, error: 'No profile data provided' };
  }

  // Validate missions array is required
  if (!data.missions) {
    return { isValid: false, error: 'Missions array is required' };
  }

  if (!Array.isArray(data.missions)) {
    return { isValid: false, error: 'Missions must be an array' };
  }

  // Validate statistics structure
  if (!data.statistics || typeof data.statistics !== 'object') {
    return { isValid: false, error: 'Statistics section is required' };
  }

  const requiredStatFields = ['completedTaskCount', 'totalPoints', 'miniPoints', 'totalClicks', 'totalReferrals'];
  for (const field of requiredStatFields) {
    if (typeof data.statistics[field] !== 'number') {
      return { isValid: false, error: `Statistics.${field} must be a number` };
    }
  }

  // Validate userInfo structure
  if (!data.userInfo || typeof data.userInfo !== 'object') {
    return { isValid: false, error: 'UserInfo section is required' };
  }

  return { isValid: true, validated: data as ProfileInitialDataResponse };
}

/**
 * Builds activity status URL with optional parameters
 * Business Rule: Activity status endpoint supports optional limit parameter
 */
export function buildActivityStatusUrl(params?: ActivityStatusParams): string {
  const basePath = '/users/activity/status';
  
  if (!params || params.limit === undefined) {
    return basePath;
  }

  if (params.limit <= 0 || params.limit > 1000) { // Reasonable limits
    throw new Error('Limit must be between 1 and 1000');
  }

  return `${basePath}?limit=${params.limit}`;
}

/**
 * Processes mission detail slug for URL construction
 * Business Rule: Mission slugs must be URL-safe and non-empty
 */
export function processMissionSlug(slug: string): {
  isValid: boolean;
  processedSlug?: string;
  error?: string;
} {
  if (!slug || typeof slug !== 'string') {
    return { isValid: false, error: 'Slug must be a non-empty string' };
  }

  const trimmedSlug = slug.trim();
  if (!trimmedSlug) {
    return { isValid: false, error: 'Slug must be a non-empty string' };
  }

  // Basic URL safety check - allow alphanumeric, hyphens, underscores
  const urlSafePattern = /^[a-zA-Z0-9\-_]+$/;
  if (!urlSafePattern.test(trimmedSlug)) {
    return { isValid: false, error: 'Slug contains invalid characters' };
  }

  return { isValid: true, processedSlug: trimmedSlug };
}

/**
 * Calculates pagination metadata
 * Business Rule: Pagination calculations must be consistent and logical
 */
export function calculatePaginationInfo(
  total: number,
  page: number,
  limit: number
): {
  isValid: boolean;
  info?: {
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    startIndex: number;
    endIndex: number;
  };
  error?: string;
} {
  if (total < 0 || page < 1 || limit < 1) {
    return { isValid: false, error: 'Invalid pagination parameters' };
  }

  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(startIndex + limit - 1, total - 1);

  if (page > totalPages && total > 0) {
    return { isValid: false, error: 'Page number exceeds available pages' };
  }

  return {
    isValid: true,
    info: {
      totalPages,
      hasNextPage,
      hasPrevPage,
      startIndex,
      endIndex
    }
  };
}

/**
 * Transforms API error response to user-friendly message
 * Business Rule: Error messages should be informative but not expose internal details
 */
export function transformApiError(error: any): string {
  if (!error) {
    return 'An unexpected error occurred';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error.message) {
    return error.message;
  }

  if (error.error) {
    return error.error;
  }

  return 'An unexpected error occurred';
}