import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { env } from "../config/env.config.js";

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
  realtime: { params: { eventsPerSecond: 0 } },
});
const bucket = env.SUPABASE_STORAGE_BUCKET || "product-images";

const sanitizeName = (name) =>
  String(name || "product")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "product";

//── UPLOAD IMAGE ────────────────────────────────────────────────
// Upload a file buffer to Supabase Storage and return its public URL.
export const uploadImage = async (buffer, filename, mimetype) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    throw {
      status: 500,
      message: "Missing Supabase image upload configuration",
    };
  }

  const ext = mimetype === "image/jpeg" ? "jpg" : mimetype.split("/")[1];
  const uniqueName = `${Date.now()}-${randomUUID()}-${sanitizeName(filename)}.${ext}`;
  const path = `products/${uniqueName}`;

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: mimetype,
    upsert: false,
  });

  if (error) throw { status: 500, message: `Upload failed: ${error.message}` };

  // Get public URL.
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return data.publicUrl;
};

//── DELETE IMAGE ────────────────────────────────────────────────
// Delete an image from Supabase Storage by public URL.
export const deleteImage = async (url) => {
  try {
    // Extract path from URL.
    // URL shape: https://xxx.supabase.co/storage/v1/object/public/{bucket}/products/xxx.jpg
    const { pathname } = new URL(url);
    const marker = `/${bucket}/`;
    const path = pathname.includes(marker)
      ? decodeURIComponent(pathname.split(marker)[1])
      : null;
    if (!path) return;

    await supabase.storage.from(bucket).remove([path]);
  } catch {
    // Do not throw if image deletion fails; it is not critical.
    console.error("[Storage] Failed to delete image:", url);
  }
};
