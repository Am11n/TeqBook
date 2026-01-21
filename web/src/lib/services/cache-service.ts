// =====================================================
// Cache Service
// =====================================================
// In-memory caching with TTL support
// Task Group 23: Caching Strategy (without Redis)
// 
// Features:
// - TTL (time-to-live) support
// - Maximum size limit to prevent memory issues
// - LRU-style eviction when size limit is reached
// - Cache statistics for monitoring

// =====================================================
// Types
// =====================================================

type CacheEntry<T> = {
  value: T;
  expiresAt: number; // Unix timestamp in ms
  accessedAt: number; // For LRU eviction
};

type CacheStats = {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  evictions: number;
  currentSize: number;
  maxSize: number;
};

type CacheOptions = {
  maxSize?: number; // Maximum number of entries
  defaultTTL?: number; // Default TTL in milliseconds
};

// =====================================================
// Cache Class
// =====================================================

class MemoryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private stats: CacheStats;
  private maxSize: number;
  private defaultTTL: number;

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize ?? 1000;
    this.defaultTTL = options.defaultTTL ?? 5 * 60 * 1000; // 5 minutes
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      currentSize: 0,
      maxSize: this.maxSize,
    };
  }

  /**
   * Get a value from the cache
   * Returns undefined if not found or expired
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return undefined;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      this.stats.misses++;
      return undefined;
    }

    // Update access time for LRU
    entry.accessedAt = Date.now();
    this.stats.hits++;

    return entry.value as T;
  }

  /**
   * Set a value in the cache
   * @param ttl - Time to live in milliseconds (optional, uses default if not provided)
   */
  set<T>(key: string, value: T, ttl?: number): void {
    // Evict if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    const expiresAt = Date.now() + (ttl ?? this.defaultTTL);
    
    this.cache.set(key, {
      value,
      expiresAt,
      accessedAt: Date.now(),
    });

    this.stats.sets++;
    this.stats.currentSize = this.cache.size;
  }

  /**
   * Delete a specific key from the cache
   */
  delete(key: string): boolean {
    const existed = this.cache.delete(key);
    if (existed) {
      this.stats.deletes++;
      this.stats.currentSize = this.cache.size;
    }
    return existed;
  }

  /**
   * Clear all entries from the cache
   */
  clear(): void {
    this.cache.clear();
    this.stats.currentSize = 0;
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get hit ratio (0-1)
   */
  getHitRatio(): number {
    const total = this.stats.hits + this.stats.misses;
    if (total === 0) return 0;
    return this.stats.hits / total;
  }

  /**
   * Remove expired entries (cleanup)
   */
  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removed++;
      }
    }

    this.stats.currentSize = this.cache.size;
    return removed;
  }

  /**
   * Get or set pattern - returns cached value or calls factory function
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * Invalidate all keys matching a pattern (prefix match)
   */
  invalidateByPrefix(prefix: string): number {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        count++;
      }
    }
    this.stats.currentSize = this.cache.size;
    return count;
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessedAt < oldestTime) {
        oldestTime = entry.accessedAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
      this.stats.currentSize = this.cache.size;
    }
  }
}

// =====================================================
// Global Cache Instance
// =====================================================

// Create a singleton cache instance for the application
const globalCache = new MemoryCache({
  maxSize: 500, // 500 entries max
  defaultTTL: 5 * 60 * 1000, // 5 minutes default
});

// =====================================================
// Cache Key Generators
// =====================================================

export const CacheKeys = {
  // Feature flags
  salonFeatures: (salonId: string) => `features:salon:${salonId}`,
  planFeatures: (planType: string) => `features:plan:${planType}`,
  
  // Plan limits
  planLimits: (salonId: string) => `limits:salon:${salonId}`,
  
  // Salon settings
  salonSettings: (salonId: string) => `settings:salon:${salonId}`,
  salonById: (salonId: string) => `salon:${salonId}`,
  
  // User profile
  userProfile: (userId: string) => `profile:user:${userId}`,
};

// =====================================================
// TTL Constants (in milliseconds)
// =====================================================

export const CacheTTL = {
  SHORT: 1 * 60 * 1000,      // 1 minute - for frequently changing data
  MEDIUM: 5 * 60 * 1000,     // 5 minutes - for semi-static data
  LONG: 15 * 60 * 1000,      // 15 minutes - for rarely changing data
  VERY_LONG: 60 * 60 * 1000, // 1 hour - for static data
};

// =====================================================
// Exported Functions
// =====================================================

/**
 * Get a value from the global cache
 */
export function cacheGet<T>(key: string): T | undefined {
  return globalCache.get<T>(key);
}

/**
 * Set a value in the global cache
 */
export function cacheSet<T>(key: string, value: T, ttl?: number): void {
  globalCache.set(key, value, ttl);
}

/**
 * Delete a value from the global cache
 */
export function cacheDelete(key: string): boolean {
  return globalCache.delete(key);
}

/**
 * Clear all values from the global cache
 */
export function cacheClear(): void {
  globalCache.clear();
}

/**
 * Check if a key exists in the cache
 */
export function cacheHas(key: string): boolean {
  return globalCache.has(key);
}

/**
 * Get or set pattern
 */
export async function cacheGetOrSet<T>(
  key: string,
  factory: () => Promise<T>,
  ttl?: number
): Promise<T> {
  return globalCache.getOrSet(key, factory, ttl);
}

/**
 * Invalidate all keys with a prefix
 */
export function cacheInvalidateByPrefix(prefix: string): number {
  return globalCache.invalidateByPrefix(prefix);
}

/**
 * Invalidate cache for a specific salon
 */
export function invalidateSalonCache(salonId: string): void {
  globalCache.invalidateByPrefix(`features:salon:${salonId}`);
  globalCache.invalidateByPrefix(`limits:salon:${salonId}`);
  globalCache.invalidateByPrefix(`settings:salon:${salonId}`);
  globalCache.invalidateByPrefix(`salon:${salonId}`);
}

/**
 * Invalidate cache for a specific user
 */
export function invalidateUserCache(userId: string): void {
  globalCache.invalidateByPrefix(`profile:user:${userId}`);
}

/**
 * Get cache statistics
 */
export function getCacheStats(): CacheStats {
  return globalCache.getStats();
}

/**
 * Get cache hit ratio
 */
export function getCacheHitRatio(): number {
  return globalCache.getHitRatio();
}

/**
 * Run cache cleanup (remove expired entries)
 */
export function runCacheCleanup(): number {
  return globalCache.cleanup();
}

// =====================================================
// Create a new cache instance (for testing or isolation)
// =====================================================

export function createCache(options?: CacheOptions): MemoryCache {
  return new MemoryCache(options);
}

export type { CacheStats, CacheOptions };
