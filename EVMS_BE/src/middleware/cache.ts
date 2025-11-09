import { Request, Response, NextFunction } from 'express';

// Simple in-memory cache
interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

/**
 * Cache middleware
 * @param duration - Cache duration in seconds (default: 60 seconds)
 */
export function cacheMiddleware(duration: number = 60) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Chỉ cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl || req.url;
    const cachedEntry = cache.get(key);

    // Kiểm tra cache có tồn tại và còn hạn không
    if (cachedEntry) {
      const age = (Date.now() - cachedEntry.timestamp) / 1000; // seconds
      if (age < duration) {
        console.log(`Cache HIT: ${key} (age: ${age.toFixed(1)}s)`);
        return res.json(cachedEntry.data);
      } else {
        // Cache expired, xóa entry cũ
        cache.delete(key);
      }
    }

    console.log(`Cache MISS: ${key}`);

    // Override res.json để cache response
    const originalJson = res.json.bind(res);
    res.json = function (data: any) {
      // Chỉ cache response thành công
      if (res.statusCode === 200) {
        cache.set(key, {
          data,
          timestamp: Date.now()
        });
      }
      return originalJson(data);
    };

    next();
  };
}

/**
 * Clear cache for specific key or all cache
 */
export function clearCache(key?: string) {
  if (key) {
    cache.delete(key);
    console.log(`Cache cleared for: ${key}`);
  } else {
    cache.clear();
    console.log('All cache cleared');
  }
}

/**
 * Get cache stats
 */
export function getCacheStats() {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
    entries: Array.from(cache.entries()).map(([key, entry]) => ({
      key,
      age: (Date.now() - entry.timestamp) / 1000
    }))
  };
}

