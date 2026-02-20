/**
 * Query Optimization Utilities
 * 
 * Simple in-memory cache for expensive queries
 */

/**
 * Cache wrapper for expensive queries
 * Simple in-memory cache with TTL
 */
export class QueryCache {
  private cache = new Map<string, { data: any; expires: number }>();

  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = 60
  ): Promise<T> {
    const cached = this.cache.get(key);
    
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.set(key, {
      data,
      expires: Date.now() + ttlSeconds * 1000,
    });

    return data;
  }

  invalidate(key: string) {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string) {
    const regex = new RegExp(pattern);
    for (const key of Array.from(this.cache.keys())) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear() {
    this.cache.clear();
  }
}

// Global cache instance
export const queryCache = new QueryCache();

// Clear cache every 5 minutes
setInterval(() => {
  queryCache.clear();
}, 5 * 60 * 1000);
