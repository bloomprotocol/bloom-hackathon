/**
 * Temporary Code Storage (In-Memory)
 *
 * Stores short codes that map to JWT tokens
 *
 * NOTE: For production, replace with Redis or database storage
 * as this will reset on deployment/restart
 */

interface CodeEntry {
  token: string;
  expiresAt: number;
  createdAt: number;
}

class CodeStore {
  private store = new Map<string, CodeEntry>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Clean up expired codes every minute
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 1000);
    }
  }

  /**
   * Generate a random short code (6 characters, alphanumeric)
   */
  private generateCode(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Store a token with a unique short code
   */
  async set(token: string, ttlSeconds: number = 24 * 60 * 60): Promise<string> {
    // Generate unique code
    let code: string;
    let attempts = 0;
    do {
      code = this.generateCode();
      attempts++;
      if (attempts > 10) {
        throw new Error('Failed to generate unique code');
      }
    } while (this.store.has(code));

    // Store with expiration
    const now = Date.now();
    this.store.set(code, {
      token,
      expiresAt: now + ttlSeconds * 1000,
      createdAt: now,
    });

    console.log(`✅ Code created: ${code} (expires in ${ttlSeconds}s)`);
    return code;
  }

  /**
   * Get token by code (single-use - code is deleted after retrieval)
   */
  async get(code: string): Promise<string | null> {
    const entry = this.store.get(code);

    if (!entry) {
      console.log(`❌ Code not found: ${code}`);
      return null;
    }

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      console.log(`❌ Code expired: ${code}`);
      this.store.delete(code);
      return null;
    }

    // Single-use: delete after retrieval
    this.store.delete(code);
    console.log(`✅ Code exchanged: ${code}`);
    return entry.token;
  }

  /**
   * Check if code exists and is valid
   */
  async exists(code: string): Promise<boolean> {
    const entry = this.store.get(code);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(code);
      return false;
    }
    return true;
  }

  /**
   * Clean up expired codes
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [code, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(code);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired codes`);
    }
  }

  /**
   * Get store stats (for debugging)
   */
  getStats() {
    const now = Date.now();
    let active = 0;
    let expired = 0;

    for (const entry of this.store.values()) {
      if (now > entry.expiresAt) {
        expired++;
      } else {
        active++;
      }
    }

    return {
      total: this.store.size,
      active,
      expired,
    };
  }
}

// Singleton instance
export const codeStore = new CodeStore();
