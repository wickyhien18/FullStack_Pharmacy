// ================================================================
// imageUrl.js — Utility tối ưu ảnh từ Supabase Storage
// Supabase hỗ trợ transform ảnh on-the-fly qua /render/image/
// Thay vì load ảnh gốc (2-5MB), chỉ load ảnh đã resize + compress
// ================================================================

const FALLBACK = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&auto=format";

/**
 * Transform Supabase Storage URL để resize + optimize ảnh
 * @param {string} url - URL gốc từ Supabase Storage
 * @param {object} options - { width, height, quality, format }
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url) return FALLBACK;

  // Chỉ transform ảnh từ Supabase Storage
  if (!url.includes("supabase.co/storage")) return url;

  const {
    width   = 400,
    quality = 80,
    format  = "webp", // webp nhỏ hơn jpg ~30%
  } = options;

  // Đổi /object/public/ → /render/image/public/
  const transformedUrl = url.replace(
    "/storage/v1/object/public/",
    "/storage/v1/render/image/public/"
  );

  // Thêm transform params
  const params = new URLSearchParams({
    width,
    quality,
    format,
  });

  return `${transformedUrl}?${params.toString()}`;
};

// Preset sizes cho từng context
export const productCardImage  = (url) => getOptimizedImageUrl(url, { width: 400,  quality: 80 });
export const productThumb      = (url) => getOptimizedImageUrl(url, { width: 80,   quality: 70 });
export const productDetailMain = (url) => getOptimizedImageUrl(url, { width: 800,  quality: 85 });
export const productDetailThumb= (url) => getOptimizedImageUrl(url, { width: 160,  quality: 70 });
export const adminTableImage   = (url) => getOptimizedImageUrl(url, { width: 80,   quality: 70 });
