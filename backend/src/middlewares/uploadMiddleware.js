const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const ok = file.mimetype.startsWith("image/");
    cb(ok ? null : new Error("Only image files are allowed"), ok);
  },
});

module.exports = upload;
