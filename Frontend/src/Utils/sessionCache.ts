/**
 * GameStation In-Memory Session Cache
 * Powers 0ms instant transitions on warm routes while protecting cold boots with laser skeletons.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

const memoryStore = new Map<string, CacheEntry<any>>();

/**
 * Retrieve cached data if present and within TTL.
 */
export function getCachedData<T>(key: string): T | null {
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttlMs) {
    memoryStore.delete(key);
    return null;
  }
  return entry.data as T;
}

/**
 * Store data in session memory (default 2-minute TTL).
 */
export function setCachedData<T>(key: string, data: T, ttlMs = 120_000): void {
  if (!data) return;
  memoryStore.set(key, {
    data,
    timestamp: Date.now(),
    ttlMs,
  });
}

/**
 * Invalidate a specific key or all keys matching a prefix.
 */
export function invalidateCache(keyOrPrefix?: string): void {
  if (!keyOrPrefix) {
    memoryStore.clear();
    return;
  }
  for (const key of memoryStore.keys()) {
    if (key.startsWith(keyOrPrefix)) {
      memoryStore.delete(key);
    }
  }
}

