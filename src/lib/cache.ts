/**
 * Simple in-memory cache with TTL (time-to-live).
 * Caches data per browser session — resets on page reload.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

/** Default TTLs in milliseconds */
export const TTL = {
  SHORT: 2 * 60 * 1000,    // 2 minutes  — user-specific data
  MEDIUM: 5 * 60 * 1000,   // 5 minutes  — product lists
  LONG: 10 * 60 * 1000,    // 10 minutes — categories, rarely changing data
} as const;

/**
 * Get a cached value. Returns undefined if expired or missing.
 */
export function cacheGet<T>(key: string): T | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.data as T;
}

/**
 * Store a value in cache with a TTL.
 */
export function cacheSet<T>(key: string, data: T, ttlMs: number = TTL.MEDIUM): void {
  store.set(key, { data, expiresAt: Date.now() + ttlMs });
}

/**
 * Invalidate a specific cache key.
 */
export function cacheInvalidate(key: string): void {
  store.delete(key);
}

/**
 * Invalidate all cache keys that start with a given prefix.
 */
export function cacheInvalidatePrefix(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
}

/**
 * Clear the entire cache.
 */
export function cacheClear(): void {
  store.clear();
}
