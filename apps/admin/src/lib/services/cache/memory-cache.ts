type CacheEntry<T> = {
  value: T;
  expiresAt: number;
  accessedAt: number;
};

export type CacheStats = {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  evictions: number;
  currentSize: number;
  maxSize: number;
};

export type CacheOptions = {
  maxSize?: number;
  defaultTTL?: number;
};

export class MemoryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private stats: CacheStats;
  private maxSize: number;
  private defaultTTL: number;

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize ?? 1000;
    this.defaultTTL = options.defaultTTL ?? 5 * 60 * 1000;
    this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0, evictions: 0, currentSize: 0, maxSize: this.maxSize };
  }

  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) { this.stats.misses++; return undefined; }
    if (Date.now() > entry.expiresAt) { this.delete(key); this.stats.misses++; return undefined; }
    entry.accessedAt = Date.now();
    this.stats.hits++;
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttl?: number): void {
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) this.evictLRU();
    const expiresAt = Date.now() + (ttl ?? this.defaultTTL);
    this.cache.set(key, { value, expiresAt, accessedAt: Date.now() });
    this.stats.sets++;
    this.stats.currentSize = this.cache.size;
  }

  delete(key: string): boolean {
    const existed = this.cache.delete(key);
    if (existed) { this.stats.deletes++; this.stats.currentSize = this.cache.size; }
    return existed;
  }

  clear(): void { this.cache.clear(); this.stats.currentSize = 0; }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) { this.delete(key); return false; }
    return true;
  }

  getStats(): CacheStats { return { ...this.stats }; }

  getHitRatio(): number {
    const total = this.stats.hits + this.stats.misses;
    return total === 0 ? 0 : this.stats.hits / total;
  }

  cleanup(): number {
    const now = Date.now();
    let removed = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) { this.cache.delete(key); removed++; }
    }
    this.stats.currentSize = this.cache.size;
    return removed;
  }

  async getOrSet<T>(key: string, factory: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) return cached;
    const value = await factory();
    this.set(key, value, ttl);
    return value;
  }

  invalidateByPrefix(prefix: string): number {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) { this.cache.delete(key); count++; }
    }
    this.stats.currentSize = this.cache.size;
    return count;
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessedAt < oldestTime) { oldestTime = entry.accessedAt; oldestKey = key; }
    }
    if (oldestKey) { this.cache.delete(oldestKey); this.stats.evictions++; this.stats.currentSize = this.cache.size; }
  }
}
