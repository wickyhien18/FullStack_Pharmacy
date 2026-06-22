// ================================================================
// redis.js — Kết nối Redis / Redis connection
//
// Redis dùng để cache / Redis is used for caching:
//   - Danh sách thuốc / product list
//   - Categories
//   - Bất kỳ data nào ít thay đổi / Any rarely-changing data
//
// Luồng hoạt động / Flow:
//   Request → Check Redis cache
//     ├── Cache hit  → Trả về ngay (~1ms) / Return immediately
//     └── Cache miss → Query DB → Lưu vào cache → Trả về / Save to cache then return
// ================================================================
import Redis from "ioredis";
import { env } from "./env.js";

// Không kết nối nếu không có REDIS_URL
// Skip connection if no REDIS_URL — app still works, just without cache
const createRedisClient = () => {
  if (!env.REDIS_URL) {
    console.warn("[Redis] REDIS_URL not set — caching disabled");
    return null;
  }

  const client = new Redis(env.REDIS_URL, {
    // Tự reconnect / Auto reconnect
    retryStrategy: (times) => {
      if (times > 3) return null; // Dừng sau 3 lần / Stop after 3 attempts
      return Math.min(times * 200, 1000);
    },
    lazyConnect: true, // Không crash app nếu Redis down / Don't crash if Redis is down
  });

  client.on("connect", () => console.log("[Redis] Connected"));
  client.on("error", (err) => console.error("[Redis] Error:", err.message));

  return client;
};

export const redis = createRedisClient();

// ── Helper: Set cache với TTL ─────────────────────────────────────
// key: tên cache / cache name
// value: data (sẽ JSON.stringify / will be JSON.stringify)
// ttl: thời gian hết hạn tính bằng giây / expiry in seconds
export const setCache = async (key, value, ttl = 300) => {
  if (!redis) return; // Bỏ qua nếu Redis không có / Skip if Redis unavailable
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
  } catch (err) {
    // Không throw — Redis lỗi không làm crash app / Don't throw — Redis error won't crash app
    console.error("[Redis] setCache error:", err.message);
  }
};

// ── Helper: Get cache ─────────────────────────────────────────────
// Trả về null nếu không có cache hoặc lỗi / Returns null if no cache or error
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

// ── Helper: Xoá cache theo key ────────────────────────────────────
export const deleteCache = async (key) => {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch (err) {
    console.error("[Redis] deleteCache error:", err.message);
  }
};

// ── Helper: Xoá cache theo pattern ───────────────────────────────
// VD / Example: deletePattern('products:*') xoá tất cả cache products
// Dùng khi admin sửa/xoá sản phẩm / Use when admin updates/deletes products
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
