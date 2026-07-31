import multer from "multer";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB / image
const MAX_FILES = 3;

const uploadMultiple = multer({
  //Images store in RAM
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_BYTES, files: MAX_FILES },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file JPG, PNG, WEBP"), false);
    }
  },
}).array("images", MAX_FILES);

export const handleUpload = (req, res) =>
  new Promise((resolve, reject) => {
    uploadMultiple(req, res, (err) => {
      if (err) reject({ status: 400, message: err.message });
      else resolve();
    });
  });
