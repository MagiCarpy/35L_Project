import { fileTypeFromBuffer } from "file-type";
import multer from "multer";

const ALLOWED_MIMES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

// filter image types (based on content-type header)
const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    return cb(new Error("Only JPEG, PNG, GIF, WebP images allowed"), false);
  }
  cb(null, true);
};

// Multer instance
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

export const validateImgFile = async (fileBuffer) => {
  try {
    const type = await fileTypeFromBuffer(fileBuffer);

    // Checks magic bytes of file (not just content-type)
    if (!type || !ALLOWED_MIMES.includes(type.mime)) {
      return { valid: false, message: "Not a real image file" };
    }
    // SVG XXS (Cross-Site Scripting) prevention
    if (type.mime === "image/svg+xml")
      return { valid: false, message: "SVG files are not allowed" };
  } catch (err) {
    return { valid: false, message: "Invalid or corrupted image" };
  }

  return { valid: true, message: "Valid image" };
};
