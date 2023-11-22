const multer = require("multer");
const path = require("path");

const Storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({
  storage: Storage,
  fileFilter: (req, file, cb) => {
    const fileType = file.mimetype;
    if (
      fileType === "image/png" ||
      fileType === "image/jpeg" ||
      fileType === "image/jpg" ||
      fileType === "image/webp"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      cb(new Error("Only JPEG, JPG, WEBP format supported"));
    }
  },
  limits: { fileSize: 1024 * 1024 * 2 },
});

module.exports = upload;
