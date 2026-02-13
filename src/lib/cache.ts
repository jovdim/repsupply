export const TTL = {
  SHORT: 60,       // 1 minute
  MEDIUM: 300,     // 5 minutes
  LONG: 3600,      // 1 hour
};

interface CacheItem<T> {
  value: T;
  expiry: number;
}

const isServer = typeof window === 'undefined';
const SYNC_KEY = 'cache:sync_invalidation';
const CACHE_VERSION = 'v1'; // Increment this when data structures change
const MAX_L1_ITEMS = 50;    // Prevent memory leaks in very long sessions

// L1 Cache: In-memory (Fastest, per-page-load)
const memoryCache = new Map<string, CacheItem<any>>();

// Helper to get versioned key
const getVersionedKey = (key: string) => `repsupply:${CACHE_VERSION}:${key}`;

// Listen for invalidation from other tabs
if (!isServer) {
  window.addEventListener('storage', (event) => {
    if (event.key === SYNC_KEY && event.newValue) {
      const prefix = event.newValue;
      // Clear L1 only (L2 is already cleared by the originating tab)
      for (const key of memoryCache.keys()) {
        if (key.startsWith(prefix)) {
          memoryCache.delete(key);
        }
      }
    }
  });
}

// Deduplication: Track pending requests to avoid double-fetching
const pendingRequests = new Map<string, Promise<any>>();

export function cacheGet<T>(key: string): T | null {
  if (isServer) return null;
  const vKey = getVersionedKey(key);

  // 1. Check Memory (L1)
  const memItem = memoryCache.get(vKey);
  if (memItem) {
    if (Date.now() < memItem.expiry) {
      return memItem.value as T;
    } else {
      memoryCache.delete(vKey);
    }
  }

  // 2. Check LocalStorage (L2)
  try {
    const itemStr = localStorage.getItem(vKey);
    if (!itemStr) return null;

    const item: CacheItem<T> = JSON.parse(itemStr);
    const now = Date.now();

    if (now > item.expiry) {
      localStorage.removeItem(vKey);
      return null;
    }

    // Populate L1 from L2 (with limit check)
    if (memoryCache.size >= MAX_L1_ITEMS) {
      const firstKey = memoryCache.keys().next().value;
      if (firstKey) memoryCache.delete(firstKey);
    }
    memoryCache.set(vKey, item);
    return item.value;
  } catch (err) {
    console.warn('Cache get error:', err);
    return null;
  }
}

export function cacheSet<T>(key: string, value: T, ttlSeconds: number = TTL.MEDIUM): void {
  if (isServer) return;
  const vKey = getVersionedKey(key);

  try {
    const now = Date.now();
    const item: CacheItem<T> = {
      value,
      expiry: now + ttlSeconds * 1000,
    };

    // Set L1 (with limit check)
    if (memoryCache.size >= MAX_L1_ITEMS) {
      const firstKey = memoryCache.keys().next().value;
      if (firstKey) memoryCache.delete(firstKey);
    }
    memoryCache.set(vKey, item);

    // Set L2
    localStorage.setItem(vKey, JSON.stringify(item));
  } catch (err) {
    console.warn('Cache set error:', err);
  }
}

export function cacheInvalidatePrefix(prefix: string): void {
  if (isServer) return;
  const vPrefix = getVersionedKey(prefix);

  try {
    // Clear L1
    for (const key of memoryCache.keys()) {
      if (key.startsWith(vPrefix)) {
        memoryCache.delete(key);
      }
    }

    // Clear L2
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(vPrefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Notify other tabs
    localStorage.setItem(SYNC_KEY, prefix);
    // Immediately clear to allow same-prefix subsequent triggers
    setTimeout(() => {
      if (localStorage.getItem(SYNC_KEY) === prefix) {
        localStorage.removeItem(SYNC_KEY);
      }
    }, 100);
  } catch (err) {
    console.warn('Cache invalidate error:', err);
  }
}

/**
 * Smart Fetch: 
 * 1. Checks L1 Cache (Memory)
 * 2. Checks L2 Cache (Session)
 * 3. Checks In-Flight Requests (Deduplication)
 * 4. Fetches & Caches if needed
 */
export async function smartFetch<T>(
  key: string, 
  fetchFn: () => Promise<T>, 
  ttlSeconds: number = TTL.MEDIUM
): Promise<T> {
  // 1. Check existing cache
  const cached = cacheGet<T>(key);
  if (cached) return cached;

  // 2. Check pending requests
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key) as Promise<T>;
  }

  // 3. Initiate Fetch
  const promise = fetchFn()
    .then((data) => {
      cacheSet(key, data, ttlSeconds);
      pendingRequests.delete(key);
      return data;
    })
    .catch((err) => {
      pendingRequests.delete(key);
      throw err;
    });

  pendingRequests.set(key, promise);
  return promise;
}
