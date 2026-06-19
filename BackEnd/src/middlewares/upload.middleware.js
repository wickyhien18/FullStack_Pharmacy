
// ================================================================
// upload.middleware.js — Multer config để handle file upload
// Dùng memory storage vì ta upload lên Supabase, không lưu local
// ================================================================
import multer from "multer";

const ALLOWED_TYPES  = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export const uploadSingle = multer({
  storage: multer.memoryStorage(), // lưu file trong RAM, không lưu disk
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file JPG, PNG, WEBP"), false);
    }
  },
}).single("image"); // field name trong form-data

// Wrapper để dùng với async/await
export const handleUpload = (req, res) =>
  new Promise((resolve, reject) => {
    uploadSingle(req, res, (err) => {
      if (err) reject({ status: 400, message: err.message });
      else resolve();
    });
  });
