/**
 * Advanced L1/L2 Cache with Stale-While-Revalidate
 * --------------------------------------------------
 * L1: In-memory Map (instant, per-page-load)
 * L2: localStorage  (persists across tabs/reloads)
 *
 * SWR: Returns stale data immediately while refreshing
 *      in the background, so the UI never waits.
 */

export const TTL = {
  SHORT: 300,       // 5 minutes
  MEDIUM: 1800,     // 30 minutes
  LONG: 7200,       // 2 hours
} as const;

// SWR window = how long past expiry we still serve stale data
const SWR_MULTIPLIER = 2; // serve stale for up to 2× TTL

interface CacheItem<T> {
  value: T;
  expiry: number;      // when the item becomes "stale"
  hardExpiry: number;   // when the item is truly dead (stale window passed)
}

const isServer = typeof window === 'undefined';
const SYNC_KEY = 'cache:sync_invalidation';
const CACHE_VERSION = 'v2';
const MAX_L1_ITEMS = 100;

// L1 Cache: In-memory (fastest)
const memoryCache = new Map<string, CacheItem<any>>();

// Deduplication: prevent identical concurrent fetches
const pendingRequests = new Map<string, Promise<any>>();

const getVersionedKey = (key: string) => `repsupply:${CACHE_VERSION}:${key}`;

// --- Cross-tab invalidation ---
if (!isServer) {
  window.addEventListener('storage', (event) => {
    if (event.key === SYNC_KEY && event.newValue) {
      const prefix = event.newValue;
      for (const key of memoryCache.keys()) {
        if (key.startsWith(prefix)) {
          memoryCache.delete(key);
        }
      }
    }
  });
}

// --- LRU eviction ---
function evictL1IfNeeded(): void {
  if (memoryCache.size < MAX_L1_ITEMS) return;

  const now = Date.now();
  // First pass: remove expired items
  for (const [key, item] of memoryCache) {
    if (now > item.hardExpiry) {
      memoryCache.delete(key);
    }
  }

  // If still over limit, evict oldest entries
  if (memoryCache.size >= MAX_L1_ITEMS) {
    const keysToEvict = Array.from(memoryCache.keys()).slice(0, Math.floor(MAX_L1_ITEMS / 4));
    keysToEvict.forEach(k => memoryCache.delete(k));
  }
}

// --- Core Get/Set ---

export function cacheGet<T>(key: string): { value: T; isStale: boolean } | null {
  if (isServer) return null;
  const vKey = getVersionedKey(key);

  // 1. Check L1 (memory)
  const memItem = memoryCache.get(vKey);
  if (memItem) {
    const now = Date.now();
    if (now > memItem.hardExpiry) {
      memoryCache.delete(vKey);
    } else {
      return { value: memItem.value as T, isStale: now > memItem.expiry };
    }
  }

  // 2. Check L2 (localStorage)
  try {
    const itemStr = localStorage.getItem(vKey);
    if (!itemStr) return null;

    const item: CacheItem<T> = JSON.parse(itemStr);
    const now = Date.now();

    if (now > item.hardExpiry) {
      localStorage.removeItem(vKey);
      return null;
    }

    // Promote to L1
    evictL1IfNeeded();
    memoryCache.set(vKey, item);
    return { value: item.value, isStale: now > item.expiry };
  } catch {
    return null;
  }
}

export function cacheSet<T>(key: string, value: T, ttlSeconds: number = TTL.MEDIUM): void {
  if (isServer) return;
  const vKey = getVersionedKey(key);
  const now = Date.now();
  const ttlMs = ttlSeconds * 1000;

  const item: CacheItem<T> = {
    value,
    expiry: now + ttlMs,
    hardExpiry: now + ttlMs * SWR_MULTIPLIER,
  };

  evictL1IfNeeded();
  memoryCache.set(vKey, item);

  try {
    localStorage.setItem(vKey, JSON.stringify(item));
  } catch {
    // localStorage full — clear old repsupply keys
    cleanupLocalStorage();
    try {
      localStorage.setItem(vKey, JSON.stringify(item));
    } catch {
      // Still full, give up on L2 for this item
    }
  }
}

function cleanupLocalStorage(): void {
  const prefix = `repsupply:`;
  const now = Date.now();
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) {
      try {
        const item = JSON.parse(localStorage.getItem(key) || '');
        if (now > item.hardExpiry) {
          keysToRemove.push(key);
        }
      } catch {
        keysToRemove.push(key);
      }
    }
  }

  keysToRemove.forEach(k => localStorage.removeItem(k));
}

// --- Invalidation ---

export function cacheInvalidatePrefix(prefix: string): void {
  if (isServer) return;
  const vPrefix = getVersionedKey(prefix);

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
    if (key?.startsWith(vPrefix)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));

  // Notify other tabs
  try {
    localStorage.setItem(SYNC_KEY, prefix);
    setTimeout(() => {
      if (localStorage.getItem(SYNC_KEY) === prefix) {
        localStorage.removeItem(SYNC_KEY);
      }
    }, 100);
  } catch { /* ignore */ }
}

// --- Smart Fetch with SWR ---

/**
 * Stale-While-Revalidate fetch:
 * 1. If fresh cache → return immediately
 * 2. If stale cache → return stale + refresh in background
 * 3. If no cache → fetch, cache, and return
 * 4. Deduplicates concurrent identical requests
 */
export async function smartFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = TTL.MEDIUM
): Promise<T> {
  // 1. Check cache
  const cached = cacheGet<T>(key);

  if (cached) {
    if (!cached.isStale) {
      // Fresh — return immediately
      return cached.value;
    }

    // Stale — return immediately, refresh in background
    if (!pendingRequests.has(key)) {
      const bgRefresh = fetchFn()
        .then((data) => {
          cacheSet(key, data, ttlSeconds);
          pendingRequests.delete(key);
          return data;
        })
        .catch(() => {
          pendingRequests.delete(key);
          // Keep stale data on error
        });
      pendingRequests.set(key, bgRefresh);
    }

    return cached.value;
  }

  // 2. No cache — check if already fetching
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key) as Promise<T>;
  }

  // 3. Fresh fetch
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
