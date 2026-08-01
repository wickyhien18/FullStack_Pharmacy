import { getCache, setCache } from "../config/redis.config.js";

// ttl: cache duration in seconds
export const cacheResponse =
  (ttl = 300) =>
  async (req, res, next) => {
    const startTime = performance.now();
    // Cache key = URL + query string
    const key = `cache:${req.originalUrl}`;

    // Check cache first
    const cached = await getCache(key);
    if (cached) {
      const duration = (performance.now() - startTime).toFixed(2);
      console.log(`[HTTP Cache] HIT: ${key} | Duration: ${duration}ms`);
      //  Return immediately
      return res.json({ success: true, message: "OK", data: cached });
    }

    // Intercept res.json to capture the response before sending
    // Action 1: Extract res.json and create a NEW COPY with 'this' always bound to res
    // → The ORIGINAL res.json remains intact, not yet modified at this line
    // → originalJson is a NEW independent variable, no longer tied to res.json
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      // Action 2: This is the line that ACTUALLY MODIFIES res.json
      // → Assigns a completely different function to the res.json property of the res object
      // → From this line onward, res.json IS NO LONGER THE ORIGINAL FUNCTION
      // Only cache successful responses
      if (body?.success && body?.data) {
        setCache(key, body.data, ttl); // fire and forget
      }
      const duration = (performance.now() - startTime).toFixed(2);
      console.log(`[HTTP Cache] MISS: ${key} | Duration: ${duration}ms`);
      return originalJson(body);
    };

    return next();
  };
