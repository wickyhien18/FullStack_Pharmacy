
// ================================================================
// upload.service.js — Upload ảnh lên Supabase Storage
// Cài: npm install @supabase/supabase-js multer
// Thêm vào .env:
//   SUPABASE_URL=https://xxx.supabase.co
//   SUPABASE_SERVICE_KEY=your_service_role_key (không phải anon key)
//   SUPABASE_STORAGE_BUCKET=medicine-images
// ================================================================
import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

// Upload file buffer lên Supabase Storage
// Trả về public URL của ảnh
export const uploadImage = async (buffer, filename, mimetype) => {
  const ext        = mimetype.split("/")[1]; // image/jpeg → jpeg
  const uniqueName = `${Date.now()}-${filename}.${ext}`;
  const path       = `medicines/${uniqueName}`;

  const { error } = await supabase.storage
    .from(env.SUPABASE_STORAGE_BUCKET || "medicine-images")
    .upload(path, buffer, {
      contentType: mimetype,
      upsert: false,
    });

  if (error) throw { status: 500, message: `Upload thất bại: ${error.message}` };

  // Lấy public URL
  const { data } = supabase.storage
    .from(env.SUPABASE_STORAGE_BUCKET || "medicine-images")
    .getPublicUrl(path);

  return data.publicUrl;
};

// Xoá ảnh khỏi Supabase Storage theo URL
export const deleteImage = async (url) => {
  try {
    // Extract path từ URL
    // URL dạng: https://xxx.supabase.co/storage/v1/object/public/medicine-images/medicines/xxx.jpg
    const path = url.split("/medicine-images/")[1];
    if (!path) return;

    await supabase.storage
      .from(env.SUPABASE_STORAGE_BUCKET || "medicine-images")
      .remove([path]);
  } catch {
    // Không throw nếu xoá ảnh thất bại — không critical
    console.error("[Storage] Failed to delete image:", url);
  }
};
