import Redis from "ioredis";
import { env } from "./env.js";

const createRedisClient = () => {
  // Skip connection if no REDIS_URL — app still works, just without cache
  if (!env.REDIS_URL) {
    console.warn("[Redis] REDIS_URL not set — caching disabled");
    return null;
  }

  const client = new Redis(env.REDIS_URL, {
    // Auto reconnect
    retryStrategy: (times) => {
      if (times > 3) return null; // Stop after 3 attempts
      return Math.min(times * 200, 1000);
    },
    lazyConnect: true, // Don't crash if Redis is down
  });

  client.on("connect", () => console.log("[Redis] Connected"));
  client.on("error", (err) => console.error("[Redis] Error:", err.message));

  return client;
};

export const redis = createRedisClient();

// ── Set cache with TTL ─────────────────────────────────────
// key: cache name
// value: data (will be JSON.stringify)
// ttl: expiry in seconds
export const setCache = async (key, value, ttl = 300) => {
  if (!redis) return; // Skip if Redis unavailable
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
  } catch (err) {
    // Don't throw — Redis error won't crash app
    console.error("[Redis] setCache error:", err.message);
  }
};

// ── Get cache ─────────────────────────────────────────────
// Returns null if no cache or error
export const getCache = async (key) => {
  if (!redis) return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error("[Redis] getCache error:", err.message);
    return null;
  }
};

// ── Delete cache by key ────────────────────────────────────
export const deleteCache = async (key) => {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch (err) {
    console.error("[Redis] deleteCache error:", err.message);
  }
};

// ── Delete many cache by pattern ───────────────────────────────
// Example: deletePattern('products:*') delete all cache products
// Use when admin updates/deletes products
export const deletePattern = async (pattern) => {
  if (!redis) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) await redis.del(...keys);
    console.log(`[Redis] Deleted ${keys.length} keys matching: ${pattern}`);
  } catch (err) {
    console.error("[Redis] deletePattern error:", err.message);
  }
};
