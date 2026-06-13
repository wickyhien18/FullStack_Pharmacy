
// ================================================================
// cache.middleware.js — Middleware tự động cache response
// Automatically cache GET responses
//
// Cách dùng / Usage:
//   router.get('/medicines', cacheResponse(300), controller.getMedicines)
//
// Luồng / Flow:
//   Request đến → Check cache
//     ├── Có cache → Trả về ngay, KHÔNG vào controller / Return immediately
//     └── Không có → Vào controller → Bắt response → Lưu cache
// ================================================================
import { getCache, setCache } from '../config/redis.js';

// ttl: thời gian cache tính bằng giây / cache duration in seconds
export const cacheResponse = (ttl = 300) =>
  async (req, res, next) => {
    // Cache key = URL + query string
    // VD / Example: cache:api/medicines?page=1&limit=20&search=vitamin
    const key = `cache:${req.originalUrl}`;

    // Check cache trước / Check cache first
    const cached = await getCache(key);
    if (cached) {
      // Cache hit — trả về ngay / Return immediately
      return res.json({ success: true, message: 'OK', data: cached });
    }

    // Cache miss — monkey-patch res.json để bắt response
    // Intercept res.json to capture the response before sending
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      // Chỉ cache response thành công / Only cache successful responses
      if (body?.success && body?.data) {
        setCache(key, body.data, ttl); // fire and forget — không await
      }
      return originalJson(body);
    };

    return next();
  };
