import multer from "multer";
import { promisify } from "util";

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

// Change Promise function to Async/Await function
const uploadMultipleAsync = promisify(uploadMultiple);

export const handleUpload = async (req, res) => {
  try {
    await uploadMultipleAsync(req, res);
  } catch (err) {
    throw { status: 400, message: err.message };
  }
};
