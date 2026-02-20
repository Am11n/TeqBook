import { MemoryCache } from "./memory-cache";
export type { CacheStats, CacheOptions } from "./memory-cache";

const globalCache = new MemoryCache({ maxSize: 500, defaultTTL: 5 * 60 * 1000 });

export const CacheKeys = {
  salonFeatures: (salonId: string) => `features:salon:${salonId}`,
  planFeatures: (planType: string) => `features:plan:${planType}`,
  planLimits: (salonId: string) => `limits:salon:${salonId}`,
  salonSettings: (salonId: string) => `settings:salon:${salonId}`,
  salonById: (salonId: string) => `salon:${salonId}`,
  userProfile: (userId: string) => `profile:user:${userId}`,
};

export const CacheTTL = {
  SHORT: 1 * 60 * 1000,
  MEDIUM: 5 * 60 * 1000,
  LONG: 15 * 60 * 1000,
  VERY_LONG: 60 * 60 * 1000,
};

export function cacheGet<T>(key: string): T | undefined { return globalCache.get<T>(key); }
export function cacheSet<T>(key: string, value: T, ttl?: number): void { globalCache.set(key, value, ttl); }
export function cacheDelete(key: string): boolean { return globalCache.delete(key); }
export function cacheClear(): void { globalCache.clear(); }
export function cacheHas(key: string): boolean { return globalCache.has(key); }
export async function cacheGetOrSet<T>(key: string, factory: () => Promise<T>, ttl?: number): Promise<T> { return globalCache.getOrSet(key, factory, ttl); }
export function cacheInvalidateByPrefix(prefix: string): number { return globalCache.invalidateByPrefix(prefix); }

export function invalidateSalonCache(salonId: string): void {
  globalCache.invalidateByPrefix(`features:salon:${salonId}`);
  globalCache.invalidateByPrefix(`limits:salon:${salonId}`);
  globalCache.invalidateByPrefix(`settings:salon:${salonId}`);
  globalCache.invalidateByPrefix(`salon:${salonId}`);
}

export function invalidateUserCache(userId: string): void { globalCache.invalidateByPrefix(`profile:user:${userId}`); }
export function getCacheStats() { return globalCache.getStats(); }
export function getCacheHitRatio(): number { return globalCache.getHitRatio(); }
export function runCacheCleanup(): number { return globalCache.cleanup(); }
export function createCache(options?: { maxSize?: number; defaultTTL?: number }) { return new MemoryCache(options); }
