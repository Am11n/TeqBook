/**
 * Cache Service Tests
 * Task Group 23: Caching Strategy
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  createCache,
  cacheGet,
  cacheSet,
  cacheDelete,
  cacheClear,
  cacheHas,
  cacheGetOrSet,
  getCacheStats,
  getCacheHitRatio,
  runCacheCleanup,
  cacheInvalidateByPrefix,
  CacheKeys,
  CacheTTL,
} from "@/lib/services/cache-service";

describe("Cache Service", () => {
  beforeEach(() => {
    // Clear global cache before each test
    cacheClear();
  });

  describe("createCache (isolated instance)", () => {
    it("should create a new cache instance", () => {
      const cache = createCache({ maxSize: 10, defaultTTL: 1000 });
      expect(cache).toBeDefined();
    });

    it("should respect maxSize option", () => {
      const cache = createCache({ maxSize: 3 });
      
      cache.set("key1", "value1");
      cache.set("key2", "value2");
      cache.set("key3", "value3");
      cache.set("key4", "value4"); // Should evict oldest

      const stats = cache.getStats();
      expect(stats.currentSize).toBe(3);
      expect(stats.evictions).toBe(1);
    });
  });

  describe("cacheGet and cacheSet", () => {
    it("should store and retrieve values", () => {
      cacheSet("test-key", "test-value");
      const result = cacheGet<string>("test-key");
      expect(result).toBe("test-value");
    });

    it("should return undefined for non-existent keys", () => {
      const result = cacheGet<string>("non-existent");
      expect(result).toBeUndefined();
    });

    it("should handle complex objects", () => {
      const complexObject = {
        id: 1,
        name: "Test",
        nested: { data: [1, 2, 3] },
      };
      
      cacheSet("complex", complexObject);
      const result = cacheGet<typeof complexObject>("complex");
      
      expect(result).toEqual(complexObject);
    });

    it("should expire entries after TTL", async () => {
      cacheSet("short-lived", "value", 50); // 50ms TTL
      
      expect(cacheGet("short-lived")).toBe("value");
      
      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 60));
      
      expect(cacheGet("short-lived")).toBeUndefined();
    });
  });

  describe("cacheDelete", () => {
    it("should delete existing keys", () => {
      cacheSet("to-delete", "value");
      expect(cacheGet("to-delete")).toBe("value");
      
      const result = cacheDelete("to-delete");
      
      expect(result).toBe(true);
      expect(cacheGet("to-delete")).toBeUndefined();
    });

    it("should return false for non-existent keys", () => {
      const result = cacheDelete("non-existent");
      expect(result).toBe(false);
    });
  });

  describe("cacheClear", () => {
    it("should remove all entries", () => {
      cacheSet("key1", "value1");
      cacheSet("key2", "value2");
      cacheSet("key3", "value3");
      
      cacheClear();
      
      expect(cacheGet("key1")).toBeUndefined();
      expect(cacheGet("key2")).toBeUndefined();
      expect(cacheGet("key3")).toBeUndefined();
    });
  });

  describe("cacheHas", () => {
    it("should return true for existing keys", () => {
      cacheSet("exists", "value");
      expect(cacheHas("exists")).toBe(true);
    });

    it("should return false for non-existent keys", () => {
      expect(cacheHas("not-exists")).toBe(false);
    });

    it("should return false for expired keys", async () => {
      cacheSet("expired", "value", 50);
      await new Promise((resolve) => setTimeout(resolve, 60));
      expect(cacheHas("expired")).toBe(false);
    });
  });

  describe("cacheGetOrSet", () => {
    it("should return cached value if exists", async () => {
      cacheSet("cached", "original");
      
      const factory = vi.fn().mockResolvedValue("new-value");
      const result = await cacheGetOrSet("cached", factory);
      
      expect(result).toBe("original");
      expect(factory).not.toHaveBeenCalled();
    });

    it("should call factory and cache result if not exists", async () => {
      const factory = vi.fn().mockResolvedValue("factory-value");
      const result = await cacheGetOrSet("new-key", factory);
      
      expect(result).toBe("factory-value");
      expect(factory).toHaveBeenCalledTimes(1);
      expect(cacheGet("new-key")).toBe("factory-value");
    });

    it("should call factory again after expiration", async () => {
      const factory = vi.fn()
        .mockResolvedValueOnce("first")
        .mockResolvedValueOnce("second");
      
      const result1 = await cacheGetOrSet("expiring", factory, 50);
      expect(result1).toBe("first");
      
      await new Promise((resolve) => setTimeout(resolve, 60));
      
      const result2 = await cacheGetOrSet("expiring", factory, 50);
      expect(result2).toBe("second");
      expect(factory).toHaveBeenCalledTimes(2);
    });
  });

  describe("cacheInvalidateByPrefix", () => {
    it("should invalidate all keys with matching prefix", () => {
      cacheSet("salon:123:feature1", "value1");
      cacheSet("salon:123:feature2", "value2");
      cacheSet("salon:456:feature1", "value3");
      
      const count = cacheInvalidateByPrefix("salon:123:");
      
      expect(count).toBe(2);
      expect(cacheGet("salon:123:feature1")).toBeUndefined();
      expect(cacheGet("salon:123:feature2")).toBeUndefined();
      expect(cacheGet("salon:456:feature1")).toBe("value3");
    });
  });

  describe("getCacheStats", () => {
    it("should track hits and misses", () => {
      cacheSet("key", "value");
      
      cacheGet("key"); // hit
      cacheGet("key"); // hit
      cacheGet("missing"); // miss
      
      const stats = getCacheStats();
      
      expect(stats.hits).toBeGreaterThanOrEqual(2);
      expect(stats.misses).toBeGreaterThanOrEqual(1);
    });

    it("should track sets and deletes", () => {
      const initialStats = getCacheStats();
      const initialSets = initialStats.sets;
      
      cacheSet("key1", "value1");
      cacheSet("key2", "value2");
      cacheDelete("key1");
      
      const stats = getCacheStats();
      
      expect(stats.sets).toBe(initialSets + 2);
      expect(stats.deletes).toBeGreaterThanOrEqual(1);
    });
  });

  describe("getCacheHitRatio", () => {
    it("should calculate hit ratio correctly on isolated cache", () => {
      const cache = createCache({ maxSize: 10 });
      cache.set("key", "value");
      
      cache.get("key"); // hit
      cache.get("key"); // hit
      cache.get("missing"); // miss
      
      const ratio = cache.getHitRatio();
      
      // 2 hits / 3 total = 0.666...
      expect(ratio).toBeGreaterThan(0.6);
      expect(ratio).toBeLessThan(0.7);
    });

    it("should return 0 when no operations", () => {
      const cache = createCache();
      expect(cache.getHitRatio()).toBe(0);
    });
  });

  describe("runCacheCleanup", () => {
    it("should remove expired entries", async () => {
      cacheSet("expired1", "value", 50);
      cacheSet("expired2", "value", 50);
      cacheSet("valid", "value", 10000);
      
      await new Promise((resolve) => setTimeout(resolve, 60));
      
      const removed = runCacheCleanup();
      
      expect(removed).toBe(2);
      expect(cacheGet("valid")).toBe("value");
    });
  });

  describe("CacheKeys", () => {
    it("should generate consistent cache keys", () => {
      const salonId = "salon-123";
      const userId = "user-456";
      
      expect(CacheKeys.salonFeatures(salonId)).toBe("features:salon:salon-123");
      expect(CacheKeys.planLimits(salonId)).toBe("limits:salon:salon-123");
      expect(CacheKeys.salonSettings(salonId)).toBe("settings:salon:salon-123");
      expect(CacheKeys.userProfile(userId)).toBe("profile:user:user-456");
    });
  });

  describe("CacheTTL constants", () => {
    it("should have correct TTL values", () => {
      expect(CacheTTL.SHORT).toBe(60000); // 1 minute
      expect(CacheTTL.MEDIUM).toBe(300000); // 5 minutes
      expect(CacheTTL.LONG).toBe(900000); // 15 minutes
      expect(CacheTTL.VERY_LONG).toBe(3600000); // 1 hour
    });
  });

  describe("LRU eviction", () => {
    it("should evict items when max size is reached", () => {
      const cache = createCache({ maxSize: 3 });
      
      cache.set("key1", "value1");
      cache.set("key2", "value2");
      cache.set("key3", "value3");
      
      // Add new item, should evict one of the existing items
      cache.set("key4", "value4");
      
      const stats = cache.getStats();
      expect(stats.currentSize).toBe(3);
      expect(stats.evictions).toBe(1);
      
      // key4 should definitely exist
      expect(cache.get("key4")).toBe("value4");
    });
  });
});
