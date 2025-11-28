import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/delivery";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/delivery");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${req.params.id}${ext}`);
  },
});

const uploadDeliveryPhoto = multer({ storage });

export default uploadDeliveryPhoto;
