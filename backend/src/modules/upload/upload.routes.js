const router = require("express").Router();
const cloudinary = require("../../config/cloudinary");
const upload = require("../../middlewares/uploadMiddleware");
const auth = require("../../middlewares/authMiddleware");


// POST /api/uploads/image
router.post("/image", auth, upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image provided" });
    }

    const result = await uploadToCloudinary(req.file.buffer, "rewear/items");

    res.status(201).json({
      success: true,
      data: {
        url: result.secure_url,
        public_id: result.public_id,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
