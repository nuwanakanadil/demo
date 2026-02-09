const service = require("./apparel.service");
const { uploadBufferToCloudinary } = require("../../utils/cloudinaryUpload");

exports.create = async (req, res, next) => {
  try {
    const data = { ...req.body };

    // Convert strings properly (because form-data sends strings)
    if (data.isAvailable !== undefined) {
      data.isAvailable = data.isAvailable === "true";
    }

    // Upload images (if any)
    let images = [];
    if (req.files && req.files.length > 0) {
      const uploads = req.files.map((f) =>
        uploadBufferToCloudinary(f.buffer, "rewear/items")
      );
      const results = await Promise.all(uploads);

      // ✅ store objects, not strings
      images = results.map((r) => ({
        url: r.secure_url,
        public_id: r.public_id,
      }));
    }

    data.images = images;

    const item = await service.create({ userId: req.user.id, data });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const result = await service.list(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const item = await service.getOne(req.params.id);
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = req.params.id;
    const data = { ...req.body };

    if (data.isAvailable !== undefined) {
      data.isAvailable = data.isAvailable === "true";
    }

    // keepImages comes as JSON string:
    // '[{"url":"...","public_id":"..."}, ...]'
    let keepImages = [];
    if (data.keepImages) {
      try {
        keepImages = JSON.parse(data.keepImages);
        if (!Array.isArray(keepImages)) keepImages = [];
      } catch {
        keepImages = [];
      }
    }
    delete data.keepImages;

    // Upload new images (if any)
    let newImages = [];
    if (req.files && req.files.length > 0) {
      const uploads = req.files.map((f) =>
        uploadBufferToCloudinary(f.buffer, "rewear/items")
      );
      const results = await Promise.all(uploads);

      // ✅ store objects, not strings
      newImages = results.map((r) => ({
        url: r.secure_url,
        public_id: r.public_id,
      }));
    }

    // Final images = kept + new uploads
    data.images = [...keepImages, ...newImages];

    const updated = await service.update({
      id,
      userId: req.user.id,
      data,
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await service.remove({ id: req.params.id, userId: req.user.id });
    res.json({ success: true, message: "Item deleted" });
  } catch (err) {
    next(err);
  }
};

exports.myItems = async (req, res, next) => {
  try {
    const items = await service.myItems(req.user.id);
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};
