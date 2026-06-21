// ================================================================
// upload.middleware.js — Multer config, hỗ trợ TỐI ĐA 3 ảnh / request
// Dùng memory storage vì ta upload lên Supabase, không lưu local
// ================================================================
import multer from "multer";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB / ảnh
const MAX_FILES = 3;

const uploadMultiple = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_BYTES, files: MAX_FILES },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file JPG, PNG, WEBP"), false);
    }
  },
}).array("images", MAX_FILES); // SỬA: field name đổi từ "image" → "images" (số nhiều), tối đa 3 file

// SỬA: đổi tên export cho rõ nghĩa, đổi nội dung dùng uploadMultiple
// req.file (số ít) KHÔNG còn tồn tại nữa — phải dùng req.files (mảng)
export const handleUpload = (req, res) =>
  new Promise((resolve, reject) => {
    uploadMultiple(req, res, (err) => {
      if (err) reject({ status: 400, message: err.message });
      else resolve();
    });
  });
