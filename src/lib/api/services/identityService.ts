import { apiGet } from '../apiConfig';

/**
 * Dimension scores for Identity Card V2
 */
export interface DimensionScores {
  conviction: number;    // 0-100: Conviction (high) ← → Curiosity (low)
  intuition: number;     // 0-100: Intuition (high) ← → Analysis (low)
  contribution: number;  // 0-100: Contribution behavior score
}

/**
 * Mint source for distinguishing Web vs OpenClaw cards
 */
export type MintSource = 'Web' | 'OpenClaw';

/**
 * Identity Card data structure (V2 with dimensions)
 */
export interface IdentityCardData {
  tokenId: number;
  owner: string;
  personalityType: string;
  customTagline: string;
  customDescription: string;
  mainCategories: string[];
  subCategories: string[];
  dimensions: DimensionScores | null; // null for Web mints
  mintedVia: MintSource;
  mintedAt: string; // ISO date string
  blockNumber: number;
  imageUrl?: string; // Generated card image URL
}

/**
 * Gallery item for recent cards
 */
export interface IdentityCardGalleryItem {
  tokenId: number;
  owner: string;
  personalityType: string;
  customTagline: string;
  imageUrl: string;
  mintedVia: MintSource;
  mintedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  error: string | null;
}

/**
 * Identity Card Service
 */
export const identityService = {
  /**
   * Get identity card by token ID
   * @endpoint GET /api/v1/identity/cards/{tokenId}
   */
  getCard: async (tokenId: number): Promise<IdentityCardData> => {
    const response = await apiGet<ApiResponse<IdentityCardData>>(`/identity/cards/${tokenId}`);
    return response.data;
  },

  /**
   * Get recent identity cards (gallery)
   * @endpoint GET /api/v1/identity/cards?limit=9&offset=0
   */
  getRecentCards: async (limit: number = 9, offset: number = 0): Promise<{
    items: IdentityCardGalleryItem[];
    total: number;
  }> => {
    const response = await apiGet<ApiResponse<{
      items: IdentityCardGalleryItem[];
      total: number;
    }>>(`/identity/cards?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  /**
   * Check if user has an identity card
   * @endpoint GET /api/v1/identity/check?wallet={address}
   */
  checkUserCard: async (wallet: string): Promise<{
    hasCard: boolean;
    tokenId?: number;
  }> => {
    const response = await apiGet<ApiResponse<{
      hasCard: boolean;
      tokenId?: number;
    }>>(`/identity/check?wallet=${wallet}`);
    return response.data;
  },
};
