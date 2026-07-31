// ================================================================
// upload.service.js — Upload ảnh lên Supabase Storage
// Cài: npm install @supabase/supabase-js multer
// Thêm vào .env:
//   SUPABASE_URL=https://xxx.supabase.co
//   SUPABASE_SERVICE_KEY=your_service_role_key (không phải anon key)
//   SUPABASE_STORAGE_BUCKET=product-images
// ================================================================
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { env } from "../config/env.config.js";

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
const bucket = env.SUPABASE_STORAGE_BUCKET || "product-images";

const sanitizeName = (name) =>
  String(name || "product")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "product";

// Upload file buffer lên Supabase Storage
// Trả về public URL của ảnh
export const uploadImage = async (buffer, filename, mimetype) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    throw { status: 500, message: "Thiếu cấu hình Supabase upload ảnh" };
  }

  const ext = mimetype === "image/jpeg" ? "jpg" : mimetype.split("/")[1];
  const uniqueName = `${Date.now()}-${randomUUID()}-${sanitizeName(filename)}.${ext}`;
  const path = `products/${uniqueName}`;

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: mimetype,
    upsert: false,
  });

  if (error)
    throw { status: 500, message: `Upload thất bại: ${error.message}` };

  // Lấy public URL
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return data.publicUrl;
};

// Xoá ảnh khỏi Supabase Storage theo URL
export const deleteImage = async (url) => {
  try {
    // Extract path từ URL
    // URL dạng: https://xxx.supabase.co/storage/v1/object/public/{bucket}/products/xxx.jpg
    const { pathname } = new URL(url);
    const marker = `/${bucket}/`;
    const path = pathname.includes(marker)
      ? decodeURIComponent(pathname.split(marker)[1])
      : null;
    if (!path) return;

    await supabase.storage.from(bucket).remove([path]);
  } catch {
    // Không throw nếu xoá ảnh thất bại — không critical
    console.error("[Storage] Failed to delete image:", url);
  }
};
